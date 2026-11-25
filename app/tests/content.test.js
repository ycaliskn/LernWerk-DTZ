import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, WORDS, VERBS, GRAMMAR, TOPICS } from '../content.js';

test('language catalogue contains exactly the four requested native languages', () => {
  assert.deepEqual(LANGUAGES.map(language => language.code), ['tr','en','ar','uk']);
  assert.equal(new Set(LANGUAGES.map(language => language.code)).size, 4);
  assert.equal(LANGUAGES[0].code, 'tr');
  assert.equal(LANGUAGES[1].code, 'en');
});

test('all initial learning content is explicitly labelled A1 and has a valid answer', () => {
  for (const item of [...WORDS, ...VERBS, ...GRAMMAR].filter(item => item.level === 'A1')) {
    assert.equal(item.level, 'A1');
    assert.ok(item.id && /^[a-z0-9-]+$/.test(item.id));
    assert.ok(Number.isInteger(item.answer));
    const optionList = Array.isArray(item.options) ? item.options : item.options?.tr;
    assert.ok(optionList?.length >= 2);
    assert.ok(item.answer >= 0 && item.answer < optionList.length);
  }
});

test('verb cards contain the three requested tense forms', () => {
  for (const verb of VERBS) {
    assert.ok(verb.present.length >= 6);
    assert.ok(verb.preterite);
    assert.ok(verb.perfect);
  }
});

test('A1 roadmap follows the ten official Goethe A1 theme groups', () => {
  const titles = TOPICS.map(topic => topic.title);
  assert.equal(TOPICS.length, 10);
  for (const expected of ['Person: kendini tanıtma ve insanlar','Ev ve konut (Wohnen)','Çevre ve hava durumu (Umwelt)','Seyahat ve ulaşım (Reisen/Verkehr)','Yeme ve içme (Essen/Trinken)','Alışveriş ve ürünler (Einkaufen)','Günlük hizmetler (Dienstleistungen)','Eğitim ve öğrenme (Ausbildung/Lernen)','İş ve meslek (Arbeit/Beruf)','Boş zaman ve eğlence (Freizeit)']) {
    assert.ok(titles.includes(expected));
  }
});

import { GRAMMAR_CURRICULUM, OFFICIAL_SOURCES } from '../sources.js';

test('grammar curriculum includes staged A1, A2, B1 content and cited source IDs', () => {
  assert.deepEqual(GRAMMAR_CURRICULUM.map(group => group.level), ['A1', 'A2', 'B1']);
  const sourceIds = new Set(OFFICIAL_SOURCES.map(source => source.id));
  for (const group of GRAMMAR_CURRICULUM) {
    assert.ok(group.topics.length >= 8, `${group.level} should have a meaningful grammar outline`);
    assert.ok(group.sourceIds.length >= 3, `${group.level} should cite multiple sources`);
    for (const id of group.sourceIds) assert.ok(sourceIds.has(id), `${id} must exist in source registry`);
  }
});

test('every source entry has a unique ID and a valid HTTPS reference with rights note', () => {
  assert.equal(new Set(OFFICIAL_SOURCES.map(source => source.id)).size, OFFICIAL_SOURCES.length);
  for (const source of OFFICIAL_SOURCES) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.title && source.publisher && source.level && source.rights && source.checkedOn);
  }
});

test('expanded A1 vocabulary pack has no holes, duplicate IDs or mismatched keyed answers', () => {
  const a1Words = WORDS.filter(item => item.level === 'A1');
  assert.ok(a1Words.length >= 55, `expected expanded A1 vocabulary, got ${a1Words.length}`);
  assert.equal(new Set(WORDS.map(item => item.id)).size, WORDS.length);
  for (const word of a1Words) {
    assert.equal(word.level, 'A1');
    assert.equal(word.type, 'word');
    assert.ok(word.target && word.sentence && word.topic && word.visual);
    assert.ok(word.meaning?.tr && word.meaning?.en);
    assert.ok(word.sentenceMeaning?.tr && word.sentenceMeaning?.en);
    for (const language of ['tr', 'en']) {
      const choices = word.options?.[language];
      assert.ok(Array.isArray(choices) && choices.length >= 3, `${word.id}: ${language} choices`);
      assert.ok(choices[word.answer], `${word.id}: ${language} answer`);
    }
    assert.ok(word.options.tr[word.answer] === word.meaning.tr || word.meaning.tr.startsWith(word.options.tr[word.answer]), `${word.id}: Turkish keyed answer`);
    assert.equal(word.options.en[word.answer], word.meaning.en, `${word.id}: English keyed answer`);
  }
});

test('expanded A1 verb pack contains complete six-person present and tense forms', () => {
  const a1Verbs = VERBS.filter(item => item.level === 'A1');
  assert.ok(a1Verbs.length >= 24, `expected expanded A1 verb pack, got ${a1Verbs.length}`);
  assert.equal(new Set(VERBS.map(item => item.id)).size, VERBS.length);
  for (const verb of a1Verbs) {
    assert.equal(verb.level, 'A1');
    assert.ok(verb.present.length === 6, `${verb.infinitive}: six present forms`);
    assert.ok(verb.preterite && verb.perfect && verb.example);
    assert.ok(verb.meaning.tr && verb.meaning.en);
    assert.equal(verb.options.tr[verb.answer], verb.meaning.tr);
    assert.equal(verb.options.en[verb.answer], verb.meaning.en);
  }
});

test('A1 grammar quiz items all have valid solutions and cover the VHS A1 progression', () => {
  const a1Grammar = GRAMMAR.filter(item => item.level === 'A1');
  assert.ok(a1Grammar.length >= 18, `expected expanded A1 grammar pack, got ${a1Grammar.length}`);
  assert.equal(new Set(GRAMMAR.map(item => item.id)).size, GRAMMAR.length);
  for (const topic of a1Grammar) {
    assert.equal(topic.level, 'A1');
    assert.ok(topic.title && topic.explanation && topic.example && topic.quiz);
    assert.ok(Array.isArray(topic.options) && topic.options.length >= 3);
    assert.ok(Number.isInteger(topic.answer) && topic.answer >= 0 && topic.answer < topic.options.length);
  }
  const titles = a1Grammar.map(item => item.title.toLowerCase()).join(' | ');
  for (const marker of ['personalpronomen', 'possessiv', 'akkusativ', 'trennbare', 'dativ', 'imperativ', 'modalverben', 'perfekt', 'komparativ', 'ordinalzahlen']) {
    assert.ok(titles.includes(marker), `missing A1 grammar coverage: ${marker}`);
  }
});

test('all learning IDs are globally unique and no array contains undefined cards', () => {
  const all = [...WORDS, ...VERBS, ...GRAMMAR];
  assert.equal(all.some(item => item === undefined), false);
  assert.equal(new Set(all.map(item => item.id)).size, all.length);
  assert.ok(all.every(item => ['A1', 'A2', 'B1'].includes(item.level)));
});

test('expanded grammar pack has bilingual titles and explanations for study UI', () => {
  const expanded = GRAMMAR.filter(item => item.level === 'A1');
  assert.ok(expanded.length >= 20);
  for (const item of expanded) {
    assert.ok(item.title, `${item.id} Turkish title`);
    assert.ok(item.explanation, `${item.id} Turkish explanation`);
    assert.ok(item.titleEn, `${item.id} English title`);
    assert.ok(item.explanationEn, `${item.id} English explanation`);
    assert.ok(item.meaning?.tr, `${item.id} Turkish answer`);
  }
});