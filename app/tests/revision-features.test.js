import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, VERBS, GRAMMAR, PRACTICE_QUESTIONS } from '../content.js';
import { illustrationSvg, illustrationDataUri, illustrationAlt } from '../illustrations.js';
import { readFileSync } from 'node:fs';

const learning=[...WORDS,...VERBS,...GRAMMAR];
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const pkg=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8'));

test('A2 and B1 each include vocabulary, verbs and grammar examples',()=>{
 for(const level of ['A2','B1']){
  assert.ok(WORDS.some(x=>x.level===level));
  assert.ok(VERBS.some(x=>x.level===level));
  assert.ok(GRAMMAR.some(x=>x.level===level));
 }
});
test('every learning example has clean German sentence punctuation',()=>{
 for(const item of learning){
  const sentence=item.sentence||item.example;
  assert.ok(sentence&&sentence.length>5,item.id);
  assert.ok(!/\\s+[.,!?]/.test(sentence),item.id+' stray punctuation space');
  assert.ok(/[.!?]$/.test(sentence),item.id+' missing punctuation');
  assert.ok(!sentence.includes('___'),item.id+' unfinished blank');
 }
});
test('A2/B1 sample sentences use the intended grammar',()=>{
 const byId=new Map(learning.map(x=>[x.id,x]));
 assert.equal(byId.get('a2-w-002').sentence,'Wegen einer Verspätung kommt der Zug später an.');
 assert.equal(byId.get('a2-v-001').example,'Ich nehme an einem Deutschkurs teil.');
 assert.equal(byId.get('a2-g-001').example,'Ich bleibe zu Hause, weil ich krank bin.');
 assert.equal(byId.get('b1-w-001').sentence,'Gute Deutschkenntnisse sind eine wichtige Voraussetzung für diese Stelle.');
 assert.equal(byId.get('b1-v-003').example,'Ich schlage vor, dass wir früher anfangen.');
 assert.equal(byId.get('b1-g-003').example,'Das ist der Mann, der neben mir wohnt.');
});
test('gap-fill practice uses new examples, with five questions per level',()=>{
 assert.equal(PRACTICE_QUESTIONS.length,15);
 for(const level of ['A1','A2','B1'])assert.equal(PRACTICE_QUESTIONS.filter(x=>x.level===level).length,5);
 const learningSentences=new Set(learning.map(x=>x.sentence||x.example));
 for(const q of PRACTICE_QUESTIONS){
  assert.ok(q.sentence.includes('___'),q.id);
  assert.ok(!learningSentences.has(q.sentence),q.id+' reused a learning example');
  assert.ok(learning.some(x=>x.id===q.targetItemId),q.id+' target card missing');
  for(const lang of ['tr','en'])assert.ok(q.options[lang][q.answer]);
  assert.ok(q.explanation&&q.explanationEn);
 }
});
test('every word, verb and grammar card receives a vector illustration',()=>{
 for(const item of learning){
  const svg=illustrationSvg(item);
  assert.match(svg,/^<svg /);
  assert.match(svg,/aria-label=/);
  assert.ok(!/[\\u{1F300}-\\u{1FAFF}]/u.test(svg),item.id+' emoji placeholder');
  assert.match(illustrationDataUri(item),/^data:image\\/svg\\+xml;charset=utf-8,/);
  assert.ok(illustrationAlt(item).length>5);
 }
});
test('study menu separates gap-fill practice from explanation mode',()=>{
 assert.match(app,/data-study-mode="practice"/);
 assert.match(app,/item\\.type === 'practice'/);
 assert.match(app,/illustrationDataUri\\(item\\)/);
 assert.match(app,/fill-gap-sentence/);
});
test('Android native TTS plugin is installed and used in native builds',()=>{
 assert.equal(pkg.dependencies['@capacitor-community/text-to-speech'],'8.0.2');
 assert.match(pkg.scripts['build:web'],/esbuild/);
 assert.match(app,/TextToSpeech\\.isLanguageSupported/);
 assert.match(app,/TextToSpeech\\.speak/);
 assert.match(app,/Capacitor\\.isNativePlatform/);
});
test('native workflow bundles app before all Android and iOS builds',()=>{
 const workflow=readFileSync(new URL('../../.github/workflows/mobile-build.yml',import.meta.url),'utf8');
 assert.equal((workflow.match(/npm run build:web/g)||[]).length,3);
});
