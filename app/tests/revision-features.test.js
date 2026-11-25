import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, WORDS, VERBS, GRAMMAR } from '../content.js';
import { createWorkPairs, WORK_CONTENT_AUDIT } from '../work-mode.js';
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

test('work mode creates a distinct image-led direct question followed by a new no-image blank', () => {
  const pairs = createWorkPairs(learning);
  assert.equal(pairs.length, learning.length * 2);
  assert.deepEqual(WORK_CONTENT_AUDIT, { vocabulary: WORDS.length, verbs: VERBS.length, grammar: GRAMMAR.length });
  for (let i = 0; i < pairs.length; i += 2) {
    const direct = pairs[i];
    const blank = pairs[i + 1];
    const source = learning.find(item => item.id === direct.sourceItemId);
    assert.ok(source, `${direct.id} source exists`);
    assert.equal(direct.workStep, 'direct');
    assert.equal(blank.workStep, 'gap');
    assert.equal(blank.type, 'practice');
    assert.equal(direct.sentence, '', `${direct.id} must not repeat the learning example`);
    assert.ok(!blank.sentence.includes(source.sentence || source.example), `${blank.id} uses a new context`);
    assert.ok(blank.sentence.includes('___'), `${blank.id} contains a blank`);
    assert.equal(blank.targetItemId, source.id);
    assert.ok(!blank.visual, `${blank.id} has no visual hint`);
    const directChoices = Array.isArray(direct.options) ? direct.options : direct.options.tr;
    const blankChoices = blank.options.tr;
    assert.ok(directChoices.length >= 3 && directChoices[direct.answer]);
    assert.ok(blankChoices.length >= 3 && blankChoices[blank.answer]);
    assert.equal(new Set(directChoices).size, directChoices.length, `${direct.id} direct choices are unique`);
    assert.equal(new Set(blankChoices).size, blankChoices.length, `${blank.id} gap choices are unique`);
    assert.ok(illustrationSvg(direct).length > 250, `${direct.id} direct stage keeps its illustration`);
    assert.match(direct.id, /::direct$/);
    assert.match(blank.id, /::gap$/);
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

test('study menu offers learning areas and the work flow renders a two-stage paired question', () => {
  for (const module of ['words','verbs','grammar','mixed']) assert.match(appSource, new RegExp(`data-study-mode=\"${module}\"`));
  assert.match(appSource, /item\.workStep === 'direct'/);
  assert.match(appSource, /item\.type === 'practice'/);
  assert.match(appSource, /illustrationDataUri\(item\)/);
  assert.match(appSource, /fill-gap-sentence/);
  assert.match(appSource, /Görselin Almanca karşılığını seçin/);
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
  assert.match(workflow, /-I \.\.\/\.github\/gradle-mirror\.init\.gradle assembleDebug/);
});

test('Android push workflow does not run iOS jobs until explicitly dispatched', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/mobile-build.yml', import.meta.url), 'utf8');
  assert.match(workflow, /build_ios_simulator/);
  assert.match(workflow, /if: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.build_ios_simulator \}\}/);
  assert.match(workflow, /if: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.build_signed_ios_ipa \}\}/);
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

test('A2 is mixed 75/25 with A1 and B1 is mixed 75/25 with A2 (never A1)', async () => {
  const { mixLevelReview } = await import('../core.js');
  const a2Pool = [
    ...Array.from({length: 12}, (_,i)=>({id:`a2-${i}`,level:'A2'})),
    ...Array.from({length: 30}, (_,i)=>({id:`a1-${i}`,level:'A1'})),
  ];
  const b1Pool = [
    ...Array.from({length: 12}, (_,i)=>({id:`b1-${i}`,level:'B1'})),
    ...Array.from({length: 30}, (_,i)=>({id:`b1-a2-${i}`,level:'A2'})),
    ...Array.from({length: 30}, (_,i)=>({id:`b1-a1-${i}`,level:'A1'})),
  ];
  const a2 = mixLevelReview(a2Pool, 'A2', true);
  assert.equal(a2.length, 16);
  assert.equal(a2.filter(item=>item.level==='A1').length, 4);
  const b1 = mixLevelReview(b1Pool, 'B1', true);
  assert.equal(b1.length, 16);
  assert.equal(b1.filter(item=>item.level==='A2').length, 4);
  assert.ok(b1.every(item=>item.level !== 'A1'));
  assert.equal(mixLevelReview(a2Pool, 'A2', false).filter(item=>item.level==='A2').length, 12);
  assert.equal(mixLevelReview(b1Pool, 'B1', false).filter(item=>item.level==='B1').length, 12);
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

test('global level and language controls are present in the persistent top menu', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="globalLevel"/);
  assert.match(html, /id="globalLanguage"/);
  assert.deepEqual(LANGUAGES.map(item=>item.code), ['tr','en','ar','uk']);
  assert.match(appSource, /document\.querySelector\('#globalLevel'\)\.addEventListener/);
  assert.match(appSource, /document\.querySelector\('#globalLanguage'\)\.addEventListener/);
  assert.match(appSource, /includeLowerLevelReview/);
});

test('a one-card subtopic still gets meaningful direct and blank distractors from its full module pool', () => {
  const a2Single = WORDS.find(item => item.level === 'A2');
  const paired = createWorkPairs([a2Single], WORDS);
  assert.equal(paired.length, 2);
  const directOptions = Array.isArray(paired[0].options) ? paired[0].options : paired[0].options.tr;
  assert.equal(directOptions.length, 3);
  assert.ok(directOptions.every(option => option !== 'heute' && option !== 'morgen'));
  assert.equal(new Set(directOptions).size, 3);
  assert.equal(paired[1].options.tr.length, 3);
  assert.ok(paired[1].options.tr.every(option => option !== 'heute' && option !== 'morgen'));
});

test('illustration audit rates every distinct learning-card image at least four out of five', () => {
  const audit = JSON.parse(readFileSync(new URL('../illustration-audit.json', import.meta.url), 'utf8'));
  assert.equal(audit.length, learning.length);
  assert.equal(new Set(audit.map(item => item.id)).size, learning.length);
  assert.equal(new Set(audit.map(item => item.illustrationKey)).size, learning.length);
  assert.ok(audit.every(item => item.score >= 4 && item.score <= 5));
  assert.equal(Math.min(...audit.map(item => item.score)), 4);
});

test('subtopic menus use an actual card-specific SVG thumbnail and a mixed-all row', () => {
  assert.match(appSource, /class="topic-icon topic-art"><img src="\$\{illustrationDataUri\(visualItem\)\}"/);
  assert.match(appSource, /data-subsection="__all__"/);
  assert.match(appSource, /Karışık – tüm alt başlıklar/);
});

test('work mode keeps one direct question followed by one blank and resuming work preserves work mode', () => {
  assert.match(appSource, /item\.workStep === 'direct'/);
  assert.match(appSource, /item\.type === 'practice'/);
  assert.match(appSource, /createWorkPairs\(items, distractorPoolForModule\(module\), state\.settings\.language\)/);
  assert.match(appSource, /activeSession\.mode \|\| 'learn'\)\);/);
  assert.equal((appSource.match(/activeSession\.itemIndex \+= 1/g) || []).length, 1, 'one answer advances exactly one step');
});

test('learning and work progress keys remain separate for each selected level and subsection', async () => {
  const { sessionStorageKey } = await import('../core.js');
  const learn = sessionStorageKey('B1', 'verbs', 'Düzensiz ve güçlü fiiller');
  const work = sessionStorageKey('B1', 'work-verbs', 'Düzensiz ve güçlü fiiller');
  assert.notEqual(learn, work);
  assert.notEqual(learn, sessionStorageKey('A2', 'verbs', 'Düzensiz ve güçlü fiiller'));
});
