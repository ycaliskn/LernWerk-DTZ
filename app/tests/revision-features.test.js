import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, VERBS, GRAMMAR, PRACTICE_QUESTIONS } from '../content.js';
import { illustrationSvg, illustrationDataUri, illustrationAlt } from '../illustrations.js';
import { readFileSync } from 'node:fs';

const learning = [...WORDS, ...VERBS, ...GRAMMAR];
const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

test('A2 and B1 have representative words, verbs and grammar cards', () => {
  for (const level of ['A2', 'B1']) {
    assert.ok(WORDS.some(item => item.level === level), `${level} vocabulary sample`);
    assert.ok(VERBS.some(item => item.level === level), `${level} verb sample`);
    assert.ok(GRAMMAR.some(item => item.level === level), `${level} grammar sample`);
  }
  assert.equal(WORDS.filter(item => item.level === 'A2').length, 3);
  assert.equal(WORDS.filter(item => item.level === 'B1').length, 3);
});

test('each learning item has a German example sentence with clean punctuation', () => {
  for (const item of learning) {
    const sentence = item.sentence || item.example;
    assert.ok(sentence && sentence.length > 5, `${item.id} example`);
    assert.ok(!/\s+[.,!?]/.test(sentence), `${item.id} has stray whitespace before punctuation`);
    assert.ok(/[.!?]$/.test(sentence), `${item.id} ends with punctuation`);
    assert.ok(!sentence.includes('___'), `${item.id} has an unfilled blank`);
  }
});

test('authored A2 and B1 German examples pass targeted grammar checks', () => {
  const byId = new Map(learning.map(item => [item.id, item]));
  assert.equal(byId.get('a2-w-002').sentence, 'Wegen einer Verspätung kommt der Zug später an.');
  assert.equal(byId.get('a2-v-001').example, 'Ich nehme an einem Deutschkurs teil.');
  assert.equal(byId.get('a2-g-001').example, 'Ich bleibe zu Hause, weil ich krank bin.');
  assert.equal(byId.get('b1-w-001').sentence, 'Gute Deutschkenntnisse sind eine wichtige Voraussetzung für diese Stelle.');
  assert.equal(byId.get('b1-v-003').example, 'Ich schlage vor, dass wir früher anfangen.');
  assert.equal(byId.get('b1-g-003').example, 'Das ist der Mann, der neben mir wohnt.');
});

test('fill-in-the-blank practice has new sentences and five questions per level', () => {
  assert.equal(PRACTICE_QUESTIONS.length, 15);
  for (const level of ['A1', 'A2', 'B1']) {
    assert.equal(PRACTICE_QUESTIONS.filter(item => item.level === level).length, 5);
  }
  const sourceSentences = new Set(learning.map(item => item.sentence || item.example));
  for (const question of PRACTICE_QUESTIONS) {
    assert.ok(question.sentence.includes('___'), `${question.id} contains a blank`);
    assert.ok(!sourceSentences.has(question.sentence), `${question.id} must use a different sentence`);
    assert.ok(question.targetItemId, `${question.id} links to a learning card`);
    assert.ok(learning.some(item => item.id === question.targetItemId), `${question.id} target exists`);
    for (const lang of ['tr', 'en']) {
      assert.ok(question.options[lang].length >= 3);
      assert.ok(question.options[lang][question.answer]);
    }
    assert.ok(question.explanation && question.explanationEn);
  }
});

test('every vocabulary, verb and grammar card gets an original SVG illustration', () => {
  for (const item of learning) {
    const svg = illustrationSvg(item);
    assert.match(svg, /^<svg /);
    assert.match(svg, /<title|aria-label=/);
    assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(svg), `${item.id} uses vector artwork, not an emoji placeholder`);
    assert.match(illustrationDataUri(item), /^data:image\/svg\+xml;charset=utf-8,/);
    assert.ok(illustrationAlt(item).length > 5);
  }
});

test('study menu has a separate practice route and app renders card illustrations', () => {
  assert.match(appSource, /data-study-mode="practice"/);
  assert.match(appSource, /item\.type === 'practice'/);
  assert.match(appSource, /illustrationDataUri\(item\)/);
  assert.match(appSource, /fill-gap-sentence/);
});

test('native TTS plugin is installed, bundled and used instead of WebView-only speech synthesis', () => {
  assert.equal(packageJson.dependencies['@capacitor-community/text-to-speech'], '8.0.2');
  assert.match(packageJson.scripts['build:web'], /esbuild/);
  assert.match(appSource, /TextToSpeech\.isLanguageSupported/);
  assert.match(appSource, /TextToSpeech\.speak/);
  assert.match(appSource, /Capacitor\.isNativePlatform/);
});

test('native mobile workflow bundles the JavaScript app before Capacitor sync', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/mobile-build.yml', import.meta.url), 'utf8');
  assert.ok((workflow.match(/npm run build:web/g) || []).length >= 2);
});

test('every individual vocabulary, verb and grammar item maps to its own distinct illustration', async () => {
  const { illustrationKey } = await import('../illustrations.js');
  const keys = learning.map(item => illustrationKey(item));
  assert.equal(keys.length, learning.length);
  assert.equal(new Set(keys).size, keys.length, 'no two learning cards reuse the same illustration');
  for (const id of ['a1-002','a1-017','a1-018','a1-019']) {
    const item = learning.find(entry => entry.id === id);
    assert.ok(illustrationSvg(item).length > 250);
  }
  assert.notEqual(illustrationKey(learning.find(item => item.id === 'a1-002')), illustrationKey(learning.find(item => item.id === 'a1-017')));
  assert.notEqual(illustrationKey(learning.find(item => item.id === 'a1-018')), illustrationKey(learning.find(item => item.id === 'a1-019')));
});

test('blank practice view omits illustrations, learning hints, and the learning-card title', () => {
  assert.match(appSource, /!isPractice\s*\?\s*`<div class="scene scene-illustration"/);
  assert.match(appSource, /!isPractice\s*\?\s*`<h2 dir="ltr"/);
  assert.doesNotMatch(appSource, /practice-instruction/);
});

test('each topic subsection has a distinct resumable session key', async () => {
  const { sessionStorageKey } = await import('../core.js');
  assert.notEqual(sessionStorageKey('A1','words','Wohnen'), sessionStorageKey('A1','words','Essen'));
  assert.notEqual(sessionStorageKey('A1','verbs','Modal fiiller'), sessionStorageKey('A1','verbs','Düzensiz ve güçlü fiiller'));
  assert.notEqual(sessionStorageKey('A2','grammar','Nebensätze'), sessionStorageKey('A2','grammar','Reflexive Verben'));
});

test('A2 A1 review option mixes exactly about 25 percent A1 words and can be disabled', async () => {
  const { mixA1Review } = await import('../core.js');
  const a2 = Array.from({length: 12}, (_,i)=>({id:`a2-${i}`,level:'A2'}));
  const a1 = Array.from({length: 30}, (_,i)=>({id:`a1-${i}`,level:'A1'}));
  const mixed = mixA1Review(a1,a2,true);
  assert.equal(mixed.length,16);
  assert.equal(mixed.filter(item=>item.level==='A1').length,4);
  assert.equal(mixA1Review(a1,a2,false).length,12);
});

test('mistake archive supports independent module and subsection buckets', async () => {
  const { mistakeArchiveKey } = await import('../core.js');
  assert.notEqual(mistakeArchiveKey('words','Wohnen'), mistakeArchiveKey('verbs','Düzensiz fiiller'));
  assert.notEqual(mistakeArchiveKey('grammar','Artikel'), mistakeArchiveKey('grammar','W-Fragen'));
  assert.match(appSource, /function renderMistakeArchive\(\)/);
  assert.match(appSource, /data-error-topic/);
});


test('old whole-module sessions are migrated to subsection-specific resume keys', () => {
  assert.match(appSource, /function migrateProgressBySubsection\(\)/);
  assert.match(appSource, /sessions\[nextKey\] = \{ \.\.\.saved, subsection, itemIds: filteredIds, itemIndex: newIndex \}/);
  assert.match(appSource, /migrateProgressBySubsection\(\);/);
});

test('A2 A1 review mix is also used in combined vocabulary-plus-verb sessions', () => {
  assert.match(appSource, /\['words','mixed'\]\.includes\(module\) && state\.settings\.level === 'A2'/);
});
