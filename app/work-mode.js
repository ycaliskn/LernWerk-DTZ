const grammarGaps = {
  'g-a1-001': ['___ Frau arbeitet heute.', ['Die','Der','Das'], 0],
  'g-a1-002': ['Wir ___ jeden Abend Deutsch.', ['lerne','lernen','lernt'], 1],
  'g-a1-003': ['___ beginnt der Film?', ['Wann','Wer','Was'], 0],
  'g-a1-004': ['Ich habe ___ Zeit.', ['kein','keine','nicht'], 1],
  'g-a1-005': ['___ bin heute müde.', ['Ich','Du','Er'], 0],
  'g-a1-006': ['___ du heute Zeit?', ['Hast','Hat','Haben'], 0],
  'g-a1-007': ['Ist das ___ Tasche?', ['deine','dein','deinen'], 0],
  'g-a1-008': ['Ich habe ___ Auto.', ['kein','keine','keinen'], 0],
  'g-a1-009': ['Der Film ist ___.', ['interessant','interessante','interessanter'], 0],
  'g-a1-010': ['Ich trinke gern ___.', ['Wasser','ein Wasser','der Wasser'], 0],
  'g-a1-011': ['Ich sehe ___ Mann.', ['der','den','dem'], 1],
  'g-a1-012': ['Er ___ um sieben Uhr auf.', ['steht','aufsteht','stehet'], 0],
  'g-a1-013': ['Heute ___ ich Deutsch.', ['lerne','lernst','lernt'], 0],
  'g-a1-014': ['Ich fahre ___ dem Bus.', ['mit','zu','nach'], 0],
  'g-a1-015': ['___ Sie bitte langsam!', ['Sprechen','Sprich','Sprecht'], 0],
  'g-a1-016': ['Morgen ___ ich arbeiten.', ['muss','müssen','musst'], 0],
  'g-a1-017': ['Wir ___ nach Berlin gefahren.', ['sind','haben','seid'], 0],
  'g-a1-018': ['Mein Bruder ist ___ als ich.', ['größer','groß','größte'], 0],
  'g-a1-019': ['Ich nehme ___ Stuhl hier.', ['diesen','dieser','dieses'], 0],
  'g-a1-020': ['Heute ist der ___.', ['erste','ersten','eins'], 0],
  'a2-g-001': ['Ich bleibe zu Hause, ___ ich krank bin.', ['weil','obwohl','deshalb'], 0],
  'a2-g-002': ['Ich interessiere ___ für Musik.', ['mich','mir','mein'], 0],
  'a2-g-003': ['Ich stelle die Vase ___ den Tisch.', ['auf','auf dem','am'], 0],
  'b1-g-001': ['Ich ___ gern mehr Zeit.', ['hätte','habe','hatte'], 0],
  'b1-g-002': ['Das Auto ___ morgen repariert.', ['wird','hat','ist'], 0],
  'b1-g-003': ['Das ist die Frau, ___ nebenan wohnt.', ['die','der','den'], 0],
  'b1-g-004': ['Ich warte ___ den Bus.', ['auf','an','mit'], 0],
  'b1-g-005': ['___ es regnet, gehen wir spazieren.', ['Obwohl','Weil','Deshalb'], 0],
};

const verbFrames = {
  'v-a1-001': ['Heute ___ ich zu Hause.', 'bin'],
  'v-a1-002': ['Heute ___ ich viel Zeit.', 'habe'],
  'v-a1-003': ['Heute ___ ich zum Arzt.', 'gehe'],
  'v-a1-004': ['Heute ___ ich meine Hausaufgaben.', 'mache'],
  'v-a1-005': ['Heute ___ ich mit dem Bus.', 'fahre'],
  'v-a1-006': ['Heute ___ ich um acht Uhr nach Hause.', 'komme'],
  'v-a1-007': ['Heute ___ ich in Bayern.', 'wohne'],
  'v-a1-008': ['Heute ___ ich Deutsch.', 'lerne'],
  'v-a1-009': ['Heute ___ ich im Büro.', 'arbeite'],
  'v-a1-010': ['Heute ___ ich Brot und Milch.', 'kaufe'],
  'v-a1-011': ['Heute ___ ich einen Apfel.', 'esse'],
  'v-a1-012': ['Heute ___ ich Wasser.', 'trinke'],
  'v-a1-013': ['Heute ___ ich mit meinem Lehrer.', 'spreche'],
  'v-a1-014': ['Heute ___ ich am Abend ein Buch.', 'lese'],
  'v-a1-015': ['Heute ___ ich früh.', 'schlafe'],
  'v-a1-016': ['Heute ___ ich den Bus.', 'nehme'],
  'v-a1-017': ['Heute ___ ich klassische Musik.', 'mag'],
  'v-a1-018': ['Heute ___ ich den Kurs um neun Uhr an.', 'fange'],
  'v-a1-019': ['Heute ___ ich meiner Mutter.', 'helfe'],
  'v-a1-020': ['Heute ___ ich arbeiten.', 'muss'],
  'v-a1-021': ['Heute ___ ich ein bisschen Deutsch sprechen.', 'kann'],
  'v-a1-022': ['Heute ___ ich hier sitzen.', 'darf'],
  'v-a1-023': ['Heute ___ ich mehr Wasser trinken.', 'soll'],
  'v-a1-024': ['Heute ___ ich nach Hause gehen.', 'will'],
  'v-a1-025': ['Heute ___ ich meinem Kind ein Buch.', 'gebe'],
  'a2-v-001': ['Heute ___ ich an einem Deutschkurs teil.', 'nehme'],
  'a2-v-002': ['Heute ___ ich in eine neue Wohnung um.', 'ziehe'],
  'a2-v-003': ['Heute ___ ich einen Termin.', 'vereinbare'],
  'b1-v-001': ['Heute ___ ich diesen Fehler.', 'vermeide'],
  'b1-v-002': ['Heute ___ ich den Termin ab.', 'sage'],
  'b1-v-003': ['Heute ___ ich einen neuen Plan vor.', 'schlage'],
};

const wordFrames = {
  'a1-001':['Im Obstkorb liegt ___.','der Apfel'],
  'a1-002':['___ hat zwei Zimmer.','Die Wohnung'],
  'a1-003':['Nach acht Stunden ist ___ vorbei.','die Arbeit'],
  'a1-004':['Ich gehe morgen zu ___.','dem Arzt'],
  'a1-005':['Ich fahre mit ___ zur Schule.','dem Bus'],
  'a1-006':['Abends lese ich ein ___.','Buch'],
  'a1-007':['Am Sonntag besucht mich ___.','die Familie'],
  'a1-008':['Am Samstag möchte ich im Supermarkt ___.','einkaufen'],
  'a1-009':['Auf dem Ausweis steht ___.','der Name'],
  'a1-010':['Bitte schreiben Sie Ihre ___ hier.','Adresse'],
  'a1-011':['Bitte geben Sie Ihre ___ an.','Telefonnummer'],
  'a1-012':['Im Garten spielt ___.','das Kind'],
  'a1-013':['Meine ___ kocht heute.','Mutter'],
  'a1-014':['Mein ___ fährt das Auto.','Vater'],
  'a1-015':['Ihr ___ geht in die Schule.','Sohn'],
  'a1-016':['Ihre ___ spielt im Garten.','Tochter'],
  'a1-017':['In meinem ___ steht ein Bett.','Zimmer'],
  'a1-018':['In der ___ koche ich.','Küche'],
  'a1-019':['Ich dusche im ___.','Bad'],
  'a1-020':['Das Essen steht auf dem ___.','Tisch'],
  'a1-021':['Ich sitze auf dem ___.','Stuhl'],
  'a1-022':['Bitte schließen Sie das ___.','Fenster'],
  'a1-023':['Zum Frühstück trinke ich ___.','die Milch'],
  'a1-024':['Nach dem Sport trinke ich ___.','das Wasser'],
  'a1-025':['Ich esse Brot mit ___.','Käse'],
  'a1-026':['Zum Frühstück esse ich ein ___.','Ei'],
  'a1-027':['Im Ofen backe ich eine ___.','Kartoffel'],
  'a1-028':['Für den Salat schneide ich eine ___.','Tomate'],
  'a1-029':['Das ___ liegt im Portemonnaie.','Geld'],
  'a1-030':['Wie hoch ist der ___?','Preis'],
  'a1-031':['Nach dem Essen bezahle ich die ___.','Rechnung'],
  'a1-032':['Im Winter brauche ich warme ___.','Kleidung'],
  'a1-033':['Der ___ kommt um neun Uhr an.','Zug'],
  'a1-034':['Im Sommer fahre ich mit dem ___.','Fahrrad'],
  'a1-035':['Für die Fahrt brauche ich eine ___.','Fahrkarte'],
  'a1-036':['Wir fahren zum ___.','Flughafen'],
  'a1-037':['Heute ist das ___ besonders schön.','Wetter'],
  'a1-038':['Bei starkem ___ bleibe ich zu Hause.','Regen'],
  'a1-039':['Die Kinder gehen morgens in die ___.','Schule'],
  'a1-040':['Mein Kind spielt im ___.','Kindergarten'],
  'a1-041':['Der ___ erklärt die Aufgabe.','Lehrer'],
  'a1-042':['Ich habe eine ___.','Frage'],
  'a1-043':['Die ___ ist richtig.','Antwort'],
  'a1-044':['Morgen habe ich einen ___.','Termin'],
  'a1-045':['Ich kaufe Medikamente in der ___.','Apotheke'],
  'a1-046':['Der Patient liegt im ___.','Krankenhaus'],
  'a1-047':['In meiner ___ lese ich gern.','Freizeit'],
  'a1-048':['Am Wochenende mache ich gern ___.','Sport'],
  'a1-049':['Mein ___ ist Elektriker.','Beruf'],
  'a1-050':['Nach zwei Stunden mache ich eine ___.','Pause'],
  'a1-051':['Wie spät ist es? Ich sehe auf die ___.','Uhr'],
  'a1-052':['Am ___ habe ich Deutschkurs.','Montag'],
  'a1-053':['Am ___ trinke ich zuerst Kaffee.','Morgen'],
  'a1-054':['Mein ___ tut weh.','Kopf'],
  'a1-055':['Meine ___ ist kalt.','Hand'],
  'a1-056':['Ich sehe mit dem ___ gut.','Auge'],
  'a1-057':['Ich warte am ___ auf den Zug.','Bahnhof'],
  'a1-058':['Die ___ ist wegen Bauarbeiten gesperrt.','Straße'],
  'a2-w-001':['Diese ___ habe ich in meinem Beruf gesammelt.','Erfahrung'],
  'a2-w-002':['Wegen der ___ fährt der Zug später.','Verspätung'],
  'a2-w-003':['Meine ___ schicke ich heute ab.','Bewerbung'],
  'b1-w-001':['Eine wichtige ___ für diese Arbeit ist Deutsch.','Voraussetzung'],
  'b1-w-002':['Im Text wird ein großer ___ deutlich.','Unterschied'],
  'b1-w-003':['Ich übernehme die ___ für das Projekt.','Verantwortung'],
};


function directOptionsFor(item, pool, language = 'tr') {
  const isGrammar = item.type === 'grammar';
  const grammarLabel = value => language === 'en' ? (value.titleEn || value.title) : value.title;
  const correct = isGrammar ? grammarLabel(item) : (item.infinitive || item.target);
  const candidates = pool.filter(other => other.id !== item.id && other.level === item.level)
    .map(other => isGrammar ? grammarLabel(other) : (other.infinitive || other.target))
    .filter(value => value && value.toLocaleLowerCase('de') !== String(correct).toLocaleLowerCase('de'));
  const unique = [...new Set(candidates)];
  let seed = 0; for (const char of item.id) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const distractors = [];
  while (distractors.length < 2 && unique.length) distractors.push(unique.splice(seed % unique.length, 1)[0]);
  while (distractors.length < 2) distractors.push(distractors.length ? 'morgen' : 'heute');
  const options = [correct, ...distractors];
  const answer = seed % 3;
  [options[0], options[answer]] = [options[answer], options[0]];
  return { options, answer };
}

function optionsFor(correct, item, pool, key) {
  const candidates = pool.filter(other => other.id !== item.id && other.level === item.level)
    .map(other => {
      if (other.type === 'verb' || other.infinitive) return other.present?.[0]?.replace(/^ich\s+/, '') || other.infinitive;
      if (other.type === 'grammar') return other.options?.[0] || other.title;
      return (other.target || '').replace(/^(der|die|das)\s+/i, '');
    }).filter(value => value && value.toLocaleLowerCase('de') !== correct.toLocaleLowerCase('de'));
  const unique = [...new Set(candidates)];
  let seed = 0; for (const c of key) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const distractors = [];
  while (distractors.length < 2 && unique.length) distractors.push(unique.splice(seed % unique.length, 1)[0]);
  while (distractors.length < 2) distractors.push(distractors.length ? 'morgen' : 'heute');
  const all = [correct, ...distractors];
  const position = seed % 3;
  [all[0], all[position]] = [all[position], all[0]];
  return { options: all, answer: position };
}

export function createWorkPairs(items, distractorPool = items, language = 'tr') {
  const sourcePool = items.filter(item => item.type !== 'practice');
  const availableDistractors = distractorPool.filter(item => item.type !== 'practice');
  const pairs = [];
  for (const item of sourcePool) {
    const typedDistractors = availableDistractors.filter(other => (item.type === 'grammar') === (other.type === 'grammar') && Boolean(item.infinitive) === Boolean(other.infinitive));
    const directChoices = directOptionsFor(item, typedDistractors, language);
    const direct = { ...item, id: `${item.id}::direct`, sourceItemId: item.id, workStep: 'direct', sentence: '', example: '', answer: directChoices.answer, options: item.type === 'grammar' ? directChoices.options : { tr: directChoices.options, en: directChoices.options, ar: directChoices.options, uk: directChoices.options } };
    let sentence = '';
    let correct = '';
    let options;
    let answer;
    if (item.type === 'grammar') {
      const gap = grammarGaps[item.id];
      if (!gap) throw new Error(`Missing new grammar practice for ${item.id}`);
      [sentence, options, answer] = gap;
    } else if (item.type === 'verb' || item.infinitive) {
      const gap = verbFrames[item.id];
      if (!gap) throw new Error(`Missing new verb practice for ${item.id}`);
      [sentence, correct] = gap;
      ({ options, answer } = optionsFor(correct, item, availableDistractors.filter(x => x.type === 'verb' || x.infinitive), item.id));
    } else {
      const gap = wordFrames[item.id];
      if (!gap) throw new Error(`Missing new vocabulary practice for ${item.id}`);
      [sentence, correct] = gap;
      ({ options, answer } = optionsFor(correct, item, availableDistractors.filter(x => x.type === 'word'), item.id));
    }
    const translatedOptions = { tr: options, en: options, ar: options, uk: options };
    const blank = {
      id: `${item.id}::gap`, type: 'practice', level: item.level, topic: item.topic || item.title || 'Karışık',
      title: item.target || item.infinitive || item.title, infinitive: item.infinitive, sentence, options: translatedOptions, answer,
      targetItemId: item.id, sourceItemId: item.id, workStep: 'gap',
      explanation: item.type === 'grammar' ? item.explanation : item.meaning?.tr || item.meaning?.en || '',
      explanationEn: item.type === 'grammar' ? item.explanationEn || item.explanation : item.meaning?.en || item.meaning?.tr || ''
    };
    pairs.push(direct, blank);
  }
  return pairs;
}

export function practiceQuestionPairs(items) {
  return createWorkPairs(items).reduce((pairs, item, index, all) => {
    if (index % 2 === 0) pairs.push([item, all[index + 1]]);
    return pairs;
  }, []);
}

export const WORK_CONTENT_AUDIT = Object.freeze({
  grammar: Object.keys(grammarGaps).length,
  verbs: Object.keys(verbFrames).length,
  vocabulary: Object.keys(wordFrames).length,
});
