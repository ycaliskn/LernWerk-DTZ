import { LANGUAGES, WORDS, VERBS, GRAMMAR, TOPICS, PRACTICE_QUESTIONS } from './content.js';
import { illustrationDataUri, illustrationAlt } from './illustrations.js';
import { createWorkPairs } from './work-mode.js';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { UI_TEXT } from './i18n.js';
import { GRAMMAR_CURRICULUM, OFFICIAL_SOURCES } from './sources.js';
import { levelsIncluded, isItemAvailable, recordAnswer, shouldShowMiniAd, shouldShowInterstitial, createSession, chooseResumeAction, resumeSession, mixA1Review, mixLevelReview, sessionStorageKey } from './core.js';

const STORE_NAME = 'lernwerk-state';
const main = document.querySelector('#main');
const toast = document.querySelector('#toast');
const adSlot = document.querySelector('#adSlot');
let db;
let state;
let route = 'home';
let selectedAnswer = null;
let answered = false;
let currentFeedback = null;
let currentItems = [];
let currentItem = null;
let activeItemPool = [];
let activeSession = null;
let adBannerDismissed = false;

const defaults = () => ({
  settings: { language: 'tr', level: 'A1', isPro: false, accountLinked: false, audioEnabled: true, includeLowerLevelReview: true },
  progress: { mistakes: {}, completed: {}, learningProgress: {}, studyProgress: {}, sessions: {}, totalAnswers: 0, correctAnswers: 0, lastInterstitialAt: null, moduleSessions: {} },
});

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return resolve(null);
    const request = indexedDB.open('lernwerk-local', 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readState() {
  if (!db) {
    try { return JSON.parse(localStorage.getItem('lernwerk-state') || 'null'); } catch { return null; }
  }
  return new Promise(resolve => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get('main');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function saveState() {
  if (!db) {
    localStorage.setItem('lernwerk-state', JSON.stringify(state));
    return;
  }
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(state, 'main');
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function t(key) {
  const lang = state.settings.language;
  return UI_TEXT[lang]?.[key] || UI_TEXT.tr[key] || key;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function meaning(item) {
  const lang = state.settings.language;
  return item.meaning?.[lang] || item.meaning?.en || item.meaning?.tr || '';
}

function sentenceMeaning(item) {
  const lang = state.settings.language;
  return item.sentenceMeaning?.[lang] || item.sentenceMeaning?.en || item.sentenceMeaning?.tr || '';
}

function grammarTitle(item) {
  if (state.settings.language !== 'en') return item.title;
  return item.titleEn || ({
    'Artikel: der, die, das': 'Articles: der, die, das',
    'Präsens – düzenli fiiller': 'Present tense – regular verbs',
    'W-Fragen': 'W-questions',
    'Negation: nicht / kein': 'Negation: nicht / kein',
  }[item.title] || item.title);
}

function grammarExplanation(item) {
  if (state.settings.language !== 'en') return item.explanation;
  return item.explanationEn || item.explanation;
}

function setNav(active) {
  document.documentElement.lang = state.settings.language;
  document.documentElement.dir = state.settings.language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.nav === active));
  const lang = state.settings.language;
  document.querySelector('#navHome').textContent = t('home');
  document.querySelector('#navWords').textContent = t('words');
  document.querySelector('#navVerbs').textContent = t('verbs');
  document.querySelector('#navGrammar').textContent = t('grammar');
  document.querySelector('#navMistakes').textContent = t('mistakes');
  const levelSelect = document.querySelector('#globalLevel');
  const languageSelect = document.querySelector('#globalLanguage');
  if (levelSelect) levelSelect.value = state.settings.level;
  if (languageSelect) languageSelect.value = lang;
  const levelPill = document.querySelector('#levelPill');
  if (levelPill) levelPill.textContent = state.settings.level;
}

function makeSessionKey(module, subsection = 'all', mode = 'learn') {
  const moduleKey = mode === 'work' ? `work-${module}` : module;
  return sessionStorageKey(state.settings.level, moduleKey, !subsection || subsection === '__all__' ? 'all' : subsection);
}

function rerenderAfterGlobalSettingChange() {
  // Global controls are intentionally available on every route. A change returns to
  // the dashboard while preserving all per-level/per-subsection sessions on disk.
  renderHome();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function renderHome() {
  route = 'home';
  setNav('home');
  const doneCount = Object.keys(state.progress.completed).length;
  const totalCount = WORDS.length + VERBS.length + GRAMMAR.length;
  const percent = Math.min(100, Math.round(doneCount / totalCount * 100));
  const levelDescription = state.settings.level === 'A1' ? 'Yalnızca A1' : state.settings.level === 'A2' ? (state.settings.includeLowerLevelReview ? 'A2 ağırlık %75 · A1 tekrar %25' : 'Yalnızca A2') : (state.settings.includeLowerLevelReview ? 'B1 ağırlık %75 · A2 tekrar %25' : 'Yalnızca B1');
  main.innerHTML = `
    <section class="hero">
      <div><div class="eyebrow">DEUTSCH LERNEN · ${esc(state.settings.level)}</div><h1>${state.settings.language === 'en' ? 'Small steps. Strong German.' : 'Her gün küçük adımlar, daha güçlü Almanca.'}</h1><p>${state.settings.language === 'en' ? 'Learn words in context, practise verbs and grammar, and review the mistakes that matter.' : 'Kelimeleri bağlam içinde öğrenin, fiil ve gramer çalışın, yaptığınız hataları tekrar ederek kalıcı öğrenin.'}</p></div>
      <div class="hero-visual"><span class="hero-emoji">📖</span><small>${esc(levelDescription)}</small></div>
    </section>
    <section class="progress-card"><div class="progress-head"><strong>${t('progress')}</strong><span>${doneCount} / ${totalCount} ${state.settings.language === 'en' ? 'items' : 'öğe'} · ${percent}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></section>
    <div class="section-title"><div><h2>${t('choose')}</h2><p>${state.settings.language === 'en' ? 'Five ways to practise' : 'Beş farklı çalışma alanı'}</p></div></div>
    <section class="module-grid">
      <button class="module-card" data-route="words"><span class="module-icon tint-blue">🖼️</span><span><h3>${t('words')}</h3><p>${state.settings.language === 'en' ? 'Pictures, example sentences and translations.' : 'Görseller, örnek cümleler ve karşılıkları.'}</p></span></button>
      <button class="module-card" data-route="verbs"><span class="module-icon tint-green">🔄</span><span><h3>${t('verbs')}</h3><p>${state.settings.language === 'en' ? 'Präsens, Präteritum and Perfekt.' : 'Präsens, Präteritum ve Perfekt çekimleri.'}</p></span></button>
      <button class="module-card" data-route="grammar"><span class="module-icon tint-purple">📐</span><span><h3>${t('grammar')}</h3><p>${state.settings.language === 'en' ? 'Short explanations and applied exercises.' : 'Kısa anlatımlar ve uygulamalı alıştırmalar.'}</p></span></button>
      <button class="module-card" data-route="mistakes"><span class="module-icon tint-orange">🎯</span><span><h3>${t('mistakes')}</h3><p>${state.settings.language === 'en' ? 'Revisit errors until mastered.' : 'Öğrenilene kadar yanlışları tekrar edin.'}</p></span></button>
    </section>
    <button class="mode-card" data-route="study-menu"><div><strong>${t('mixed')}</strong><p>${state.settings.language === 'en' ? 'Choose vocabulary, verbs, mixed words + verbs, or grammar.' : 'Kelime, fiil, karışık kelime + fiil veya gramer çalışın.'}</p></div><span>🧠</span></button>
    <div class="section-title"><div><h2>${state.settings.language === 'en' ? 'A1 course roadmap' : 'A1 konu sıralaması'}</h2><p>${state.settings.language === 'en' ? 'Official exam themes mapped into learning units' : 'Resmî sınav temalarına göre düzenlenen öğrenme aşamaları'}</p></div><button class="secondary-button" data-route="topics">${state.settings.language === 'en' ? 'View all' : 'Tümünü gör'}</button></div>
    <button class="source-entry-card" data-route="sources"><span class="source-entry-icon">📚</span><span><strong>Kaynaklar ve gramer müfredatı</strong><small>Goethe · BAMF · vhs-Lernportal · Deutsche Welle</small></span><span class="source-entry-arrow">›</span></button>
    <div class="note">${t('sources')}: Goethe-Institut A1/A2/B1 Wortlisten ve BAMF DTZ referansları. Demo içeriği başlangıç örnekleridir; tam liste değildir.</div>

    ${savedSessionCard()}
  `;
  bindRouteButtons();
}

function savedSessionCard() {
  const entries = Object.entries(state.progress.moduleSessions || {})
    .filter(([, saved]) => saved && saved.level === state.settings.level && saved.itemIndex > 0 && saved.itemIndex < saved.itemIds?.length)
    .sort((a,b) => (b[1].updatedAt || b[1].startedAt || 0) - (a[1].updatedAt || a[1].startedAt || 0))
    .slice(0, 8);
  if (!entries.length) return '';
  const labels = { words: t('words'), verbs: t('verbs'), grammar: t('grammar'), mixed: 'Karışık kelime + fiil' };
  return `<section class="resume-stack"><div class="section-title"><div><h2>${state.settings.language === 'en' ? 'Continue where you left off' : 'Kaldığın yerden devam et'}</h2><p>${state.settings.language === 'en' ? 'Separate progress for each section and mode' : 'Her bölüm, alt başlık ve mod için ayrı kayıt'}</p></div></div>${entries.map(([key,saved]) => {
    const modeLabel = saved.mode === 'work' ? (state.settings.language === 'en' ? 'Study mode' : 'Çalışma') : (state.settings.language === 'en' ? 'Learn mode' : 'Öğrenme');
    const moduleName = labels[saved.module] || saved.module;
    const subsection = saved.subsection && saved.subsection !== 'all' ? saved.subsection : (state.settings.language === 'en' ? 'Mixed topics' : 'Karışık tüm başlıklar');
    return `<button class="resume-row" data-resume-key="${esc(key)}"><span><strong>${esc(moduleName)} · ${esc(subsection)}</strong><small>${modeLabel} · ${saved.itemIndex + 1}/${saved.itemIds.length} · ${esc(saved.level)}</small></span><span class="chevron">›</span></button>`;
  }).join('')}</section>`;
}

function bindRouteButtons() {
  document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => openRoute(button.dataset.route)));
  document.querySelectorAll('[data-resume-key]').forEach(button => button.addEventListener('click', () => resumeSaved(button.dataset.resumeKey)));
  document.querySelector('[data-resume]')?.addEventListener('click', () => resumeSaved(state.progress.lastSessionKey));
}

function openRoute(next) {
  if (next === 'settings') return renderSettings();
  if (next === 'topics') return renderTopics();
  if (next === 'study-menu') return renderStudyModeMenu();
  if (next === 'sources') return renderSources();
  if (next === 'words' || next === 'verbs' || next === 'grammar' || next === 'mixed' || next === 'mistakes' || next === 'practice') return startModule(next);
  renderHome();
}

function renderStudyModeMenu() {
  route = 'study-menu'; setNav('home');
  main.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">STUDY MODES · ${esc(state.settings.level)}</div><h1>${state.settings.language === 'en' ? 'Study mode' : 'Çalışma modu'}</h1><p>${state.settings.language === 'en' ? 'Each learning target has two new tasks: a direct question and a different fill-in-the-blank sentence.' : 'Her öğrenme hedefinde iki aşama vardır: önce doğrudan soru, sonra farklı bir cümlede boşluk doldurma.'}</p></div><button class="back-button" id="studyMenuBack">← ${t('home')}</button></div>
    <div class="module-grid">
      <button class="module-card" data-study-mode="words"><span class="module-icon tint-blue">🖼️</span><span><h3>${t('words')}</h3><p>${state.settings.language === 'en' ? 'Vocabulary · picture + two questions' : 'Kelime · görsel + iki farklı soru'}</p></span></button>
      <button class="module-card" data-study-mode="verbs"><span class="module-icon tint-green">🔄</span><span><h3>${t('verbs')}</h3><p>${state.settings.language === 'en' ? 'Verb forms in a new context' : 'Fiil çekimleri ve yeni bağlam'}</p></span></button>
      <button class="module-card" data-study-mode="grammar"><span class="module-icon tint-purple">📐</span><span><h3>${t('grammar')}</h3><p>${state.settings.language === 'en' ? 'Grammar examples + a new blank' : 'Gramer örneği + yeni boşluk doldurma'}</p></span></button>
      <button class="module-card" data-study-mode="mixed"><span class="module-icon tint-teal">🔀</span><span><h3>${state.settings.language === 'en' ? 'Mixed vocabulary + verbs' : 'Karışık kelime + fiil'}</h3><p>${state.settings.language === 'en' ? 'All subtopics together' : 'Tüm kelime ve fiil alt başlıkları'}</p></span></button>
    </div>
    <div class="note">${state.settings.language === 'en' ? 'Pictures appear with the direct question. The fill-in-the-blank step has no picture or answer hint.' : 'Doğrudan soruda konuya ait görsel bulunur. Boşluk doldurma adımında görsel veya cevabı ele veren ipucu gösterilmez.'}</div>
    <button class="source-entry-card" data-route="sources"><span class="source-entry-icon">📖</span><span><strong>Gramer kaynakları ve konu sırası</strong><small>Her seviyenin açık doküman dayanaklarını görüntüleyin</small></span><span class="source-entry-arrow">›</span></button>`;
  document.querySelector('#studyMenuBack').addEventListener('click', renderHome);
  document.querySelector('[data-route="sources"]')?.addEventListener('click', renderSources);
  document.querySelectorAll('[data-study-mode]').forEach(button => button.addEventListener('click', () => startModule(button.dataset.studyMode, null, 'work')));
}

function moduleForItem(item) {
  if (WORDS.some(entry => entry.id === item.id)) return 'words';
  if (VERBS.some(entry => entry.id === item.id)) return 'verbs';
  if (GRAMMAR.some(entry => entry.id === item.id)) return 'grammar';
  return 'mixed';
}

function distractorPoolForModule(module) {
  if (module === 'words') return WORDS;
  if (module === 'verbs') return VERBS;
  if (module === 'grammar') return GRAMMAR;
  if (module === 'mixed') return [...WORDS, ...VERBS];
  return [];
}

function subsectionFor(item, module) {
  if (module === 'words') return item.topic || 'Diğer kelimeler';
  if (module === 'grammar') return item.topic || item.title || 'Gramer';
  if (module === 'practice') return item.topic || 'Karışık alıştırmalar';
  if (module === 'verbs') {
    const verb = item.infinitive || '';
    if (/^(sein|haben|werden|gehen|kommen|fahren|sprechen|lesen|essen|nehmen|geben|helfen|schlafen|mögen)$/.test(verb)) return 'Düzensiz ve güçlü fiiller';
    if (/^(müssen|können|dürfen|sollen|wollen|möchten)$/.test(verb)) return 'Modal fiiller';
    if (/^(an|auf|ab|ein|aus|um|mit|vor|teil)\w+/.test(verb)) return 'Ayrılabilen fiiller';
    return 'Düzenli ve diğer fiiller';
  }
  return item.topic || 'Karışık';
}

function filteredItems(module, subsectionKey = null) {
  const rawWords = WORDS;
  const rawVerbs = VERBS;
  const rawGrammar = GRAMMAR;
  let items = module === 'words' ? rawWords
    : module === 'verbs' ? rawVerbs
    : module === 'grammar' ? rawGrammar
    : module === 'mixed' ? [...rawWords, ...rawVerbs]
    : module === 'practice' ? PRACTICE_QUESTIONS
    : module === 'mistakes' ? [...rawWords, ...rawVerbs, ...rawGrammar].filter(item => Boolean(state.progress.mistakes[item.id]))
    : [];
  if (module === 'mistakes' && subsectionKey && subsectionKey !== '__all__') {
    const parts = subsectionKey.split('::');
    const sourceModule = parts[1];
    const topic = parts.slice(2).join('::');
    items = items.filter(item => {
      const record = state.progress.mistakes[item.id];
      return (record?.module || moduleForItem(item)) === sourceModule && subsectionFor(item, sourceModule) === topic;
    });
    return items;
  }
  if (subsectionKey && subsectionKey !== '__all__') {
    items = items.filter(item => subsectionFor(item, module) === subsectionKey);
  }
  return mixLevelReview(items, state.settings.level, state.settings.includeLowerLevelReview !== false);
}

function renderModuleSections(module, items, mode = 'learn') {
  route = `${module}-sections`; setNav(module === 'mixed' ? 'home' : module);
  const groups = new Map();
  for (const item of items) {
    const key = subsectionFor(item, module);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const title = module === 'words' ? t('words') : module === 'verbs' ? t('verbs') : module === 'grammar' ? t('grammar') : module === 'practice' ? 'Boşluk doldurma' : t('mixed');
  const rows = [...groups.entries()].map(([key, group]) => {
    const sessionKey = makeSessionKey(module, key, mode);
    const saved = state.progress.moduleSessions?.[sessionKey];
    const sourceIds = [...new Set(group.map(item => item.sourceItemId || item.id.replace(/::(direct|gap)$/,'')))];
    const completedMap = mode === 'work' ? (state.progress.studyProgress?.[sessionKey] || {}) : (state.progress.learningProgress?.[sessionKey] || {});
    const done = mode === 'work'
      ? sourceIds.filter(id => completedMap[`${id}::direct`] && completedMap[`${id}::gap`]).length
      : sourceIds.filter(id => completedMap[id]).length;
    const visualItem = group.find(item => item.type !== 'practice') || group[0];
    const countLabel = `${sourceIds.length} öğe · ${done}/${sourceIds.length} tamamlandı`;
    const resumeLabel = saved && saved.itemIndex < saved.itemIds.length ? ` · ${saved.itemIndex + 1}. sorudan devam` : '';
    return `<button class="topic-row subsection-button" data-subsection="${esc(key)}"><span class="topic-icon topic-art"><img src="${illustrationDataUri(visualItem)}" alt="${esc(illustrationAlt(visualItem))}" loading="lazy"></span><span><strong>${esc(key)}</strong><small>${countLabel}${resumeLabel}</small></span><span class="chevron">›</span></button>`;
  }).join('');
  const allKey = makeSessionKey(module, 'all', mode);
  const allSaved = state.progress.moduleSessions?.[allKey];
  const totalSources = [...new Set(items.map(item => item.sourceItemId || item.id.replace(/::(direct|gap)$/,'')))].length;
  const allProgress = mode === 'work' ? (state.progress.studyProgress?.[allKey] || {}) : (state.progress.learningProgress?.[allKey] || {});
  const allDone = mode === 'work'
    ? [...new Set(items.map(item => item.sourceItemId || item.id.replace(/::(direct|gap)$/,'')))].filter(id => allProgress[`${id}::direct`] && allProgress[`${id}::gap`]).length
    : [...new Set(items.map(item => item.id))].filter(id => allProgress[id]).length;
  main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">${esc(state.settings.level)} · ${esc(title)} · ${mode === 'work' ? 'ÇALIŞMA' : 'ÖĞRENME'}</div><h1>Alt başlık seçin</h1><p>Her alt başlıkta ayrı ilerleme ve kaldığın yerden devam kaydı bulunur.</p></div><button class="back-button" id="sectionsBack">← Ana sayfa</button></div><div class="topic-list"><button class="topic-row subsection-button mixed-topic-row" data-subsection="__all__"><span class="topic-icon mixed-topic-icon">🔀</span><span><strong>Karışık – tüm alt başlıklar</strong><small>${totalSources} öğe · ${allDone}/${totalSources} tamamlandı${allSaved && allSaved.itemIndex < allSaved.itemIds.length ? ` · ${allSaved.itemIndex + 1}. sorudan devam` : ''}</small></span><span class="chevron">›</span></button>${rows}</div>`;
  document.querySelector('#sectionsBack').addEventListener('click', renderHome);
  document.querySelectorAll('[data-subsection]').forEach(button => button.addEventListener('click', () => startModule(module, button.dataset.subsection, mode)));
}

function renderMistakeArchive() {
  route = 'mistakes'; setNav('mistakes');
  const records = Object.entries(state.progress.mistakes || {});
  const vocabularyVerbCount = records.filter(([id, record]) => ['words','verbs'].includes(record.module || moduleForItem({id}))).length;
  const grammarCount = records.filter(([id, record]) => (record.module || moduleForItem({id})) === 'grammar').length;
  main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">${state.settings.level} · HATALAR</div><h1>Hata arşivim</h1><p>Önce hangi hata grubunu tekrar etmek istediğini seç.</p></div><button class="back-button" id="mistakesBack">← Ana sayfa</button></div><div class="topic-list"><button class="topic-row" data-error-category="words"><span class="topic-icon">🖼️</span><span><strong>Kelime ve fiil</strong><small>${vocabularyVerbCount} aktif hata</small></span><span class="chevron">›</span></button><button class="topic-row" data-error-category="grammar"><span class="topic-icon">📐</span><span><strong>${t('grammar')}</strong><small>${grammarCount} aktif hata</small></span><span class="chevron">›</span></button></div>`;
  document.querySelector('#mistakesBack').addEventListener('click', renderHome);
  document.querySelectorAll('[data-error-category]').forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.errorCategory;
    const modules = category === 'words' ? ['words','verbs'] : ['grammar'];
    const byTopic = new Map();
    records.forEach(([id, record]) => {
      const sourceModule = record.module || moduleForItem({id});
      if (!modules.includes(sourceModule)) return;
      const item = [...WORDS,...VERBS,...GRAMMAR].find(entry => entry.id === id);
      if (!item) return;
      const topic = subsectionFor(item, sourceModule);
      const key = `${sourceModule}::${topic}`;
      if (!byTopic.has(key)) byTopic.set(key, []);
      byTopic.get(key).push(item);
    });
    main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">HATA ARŞİVİ</div><h1>${category === 'words' ? 'Kelime ve fiil' : t('grammar')}</h1><p>Hatalar alt başlıklarına göre ayrı saklanır ve buradan tekrar sorulur.</p></div><button class="back-button" id="archiveBack">← Geri</button></div><div class="topic-list">${[...byTopic].map(([key,items])=>`<button class="topic-row" data-error-topic="${esc(key)}"><span><strong>${esc(key.split('::')[1])}</strong><small>${items.length} hata</small></span><span class="chevron">›</span></button>`).join('')}</div>`;
    document.querySelector('#archiveBack').addEventListener('click', renderMistakeArchive);
    document.querySelectorAll('[data-error-topic]').forEach(b=>b.addEventListener('click',()=>startModule('mistakes',`${category}::${b.dataset.errorTopic}`)));
  }));
}

function startModule(module, subsectionKey = null, mode = 'learn') {
  if (module === 'mistakes' && !subsectionKey) return renderMistakeArchive();
  let items = filteredItems(module, subsectionKey);
  if (mode === 'work' && !['mistakes','practice'].includes(module)) items = createWorkPairs(items, distractorPoolForModule(module), state.settings.language);
  if (!items.length) {
    showToast(t('noMistakes'));
    return module === 'mistakes' ? renderMistakeArchive() : renderHome();
  }
  if (!subsectionKey) return renderModuleSections(module, items, mode);
  const key = makeSessionKey(module, subsectionKey, mode);
  const saved = state.progress.moduleSessions?.[key];
  if (saved?.itemIndex > 0 && saved.itemIndex < saved.itemIds.length) {
    renderResumeChoice(module, items, saved, mode, key);
  } else {
    beginSession(module, items, subsectionKey === '__all__' ? 'all' : subsectionKey, mode);
  }
}

function renderResumeChoice(module, items, saved, mode = saved.mode || 'learn', key = saved.sessionKey) {
  route = module; setNav(module === 'mixed' ? 'home' : module);
  const title = routeTitle(module);
  main.innerHTML = `<section class="panel complete-card"><div class="complete-icon">⏸️</div><div class="eyebrow">${esc(title)} · ${mode === 'work' ? 'ÇALIŞMA' : 'ÖĞRENME'}</div><h2>${state.settings.language === 'en' ? 'You have an unfinished session' : 'Tamamlanmamış bir çalışman var'}</h2><p>${saved.itemIndex + 1}. sorudan devam edebilirsin. Baştan başlamak diğer bölüm kayıtlarını silmez.</p><button class="primary-button" id="continueSession">${t('continue')}</button><button class="secondary-button" style="width:100%;margin-top:9px" id="restartSession">${t('restart')}</button></section>`;
  document.querySelector('#continueSession').addEventListener('click', () => {
    const byId = new Map(items.map(item => [item.id, item]));
    const restoredItems = saved.itemIds.map(id => byId.get(id)).filter(Boolean);
    activeItemPool = restoredItems.length ? restoredItems : items;
    activeSession = resumeSession(saved, 'continue');
    activeSession.module = module;
    activeSession.mode = mode;
    activeSession.sessionKey = key || saved.sessionKey || makeSessionKey(module, saved.subsection, mode);
    currentItems = activeItemPool;
    renderStudy();
  });
  document.querySelector('#restartSession').addEventListener('click', () => beginSession(module, items, saved.subsection || 'all', mode));
}

function beginSession(module, items, subsection = 'all', mode = 'learn') {
  activeItemPool = [...items];
  currentItems = activeItemPool;
  activeSession = createSession(module, state.settings.level, activeItemPool);
  activeSession.module = module;
  activeSession.mode = mode;
  activeSession.subsection = subsection;
  activeSession.itemIds = activeItemPool.map(item => item.id);
  activeSession.itemIndex = 0;
  activeSession.sessionKey = makeSessionKey(module, subsection, mode);
  state.progress.moduleSessions[activeSession.sessionKey] = activeSession;
  state.progress.lastSessionKey = activeSession.sessionKey;
  saveState();
  renderStudy();
}

function resumeSaved(key) {
  const saved = state.progress.moduleSessions?.[key || state.progress.lastSessionKey];
  if (!saved) return;
  const module = saved.module;
  const mode = saved.mode || 'learn';
  let pool = filteredItems(module, saved.subsection && saved.subsection !== 'all' ? saved.subsection : null);
  if (mode === 'work' && !['mistakes','practice'].includes(module)) pool = createWorkPairs(pool, distractorPoolForModule(module), state.settings.language);
  const byId = new Map(pool.map(item => [item.id, item]));
  activeItemPool = saved.itemIds.map(id => byId.get(id)).filter(Boolean);
  activeSession = resumeSession(saved, 'continue');
  activeSession.sessionKey = key || saved.sessionKey;
  currentItems = activeItemPool;
  renderStudy();
}

function renderStudy() {
  route = activeSession.module;
  setNav(route === 'mixed' ? 'home' : route);
  const index = activeSession.itemIndex;
  if (index >= currentItems.length) return finishSession();
  currentItem = currentItems[index];
  selectedAnswer = null; answered = false; currentFeedback = null;
  const item = currentItem;
  const pct = Math.round(index / currentItems.length * 100);
  const isPractice = item.type === 'practice';
  const isWorkDirect = item.workStep === 'direct';
  const prompt = isPractice
    ? (state.settings.language === 'en' ? 'Complete the sentence with the correct word or form' : 'Cümledeki boşluğu doğru kelime veya fiil biçimiyle tamamlayın')
    : isWorkDirect
      ? (item.type === 'grammar' ? (state.settings.language === 'en' ? 'Which grammar topic does the picture show?' : 'Görsel hangi gramer konusunu anlatıyor?') : item.infinitive ? (state.settings.language === 'en' ? 'Choose the German verb shown.' : 'Görsele uygun Almanca fiili seçin.') : (state.settings.language === 'en' ? 'Choose the German word shown.' : 'Görselin Almanca karşılığını seçin.'))
      : item.type === 'grammar' ? item.quiz : (state.settings.language === 'en' ? 'Choose the correct meaning' : 'Doğru anlamı seçin');
  const options = isPractice || (isWorkDirect && item.type !== 'grammar') ? (item.options?.[state.settings.language] || item.options?.tr || []) : item.type === 'grammar' ? item.options : (item.options?.[state.settings.language] || item.options?.tr || []);
  const target = item.infinitive || item.title || item.target;
  const sentence = isWorkDirect ? '' : (item.sentence || item.example || '');
  const title = isPractice || isWorkDirect ? '' : item.type === 'grammar' ? grammarTitle(item) : target;
  const art = isPractice ? '' : illustrationDataUri(item);
  const artAlt = isPractice ? '' : illustrationAlt(item);
  main.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">${esc(item.level)} · ${isPractice ? 'BOŞLUK DOLDURMA' : esc(item.topic || (item.type === 'grammar' ? 'Gramer' : item.type === 'verb' ? 'Fiil' : 'Kelime'))}</div><h1>${isPractice ? 'Cümleyi tamamlayın' : esc(routeTitle(route))}</h1><p>${isPractice ? ' ' : (state.settings.language === 'en' ? 'Choose an answer, then read the explanation.' : 'Cevabı seçin, ardından açıklamayı inceleyin.')}</p></div><button class="back-button" id="exitStudy">✕</button></div>
    <div class="progress-card"><div class="progress-head"><strong>${state.settings.language === 'en' ? (activeSession.mode === 'work' ? 'Work session' : 'Learning session') : (activeSession.mode === 'work' ? 'Çalışma oturumu' : 'Öğrenme oturumu')}</strong><span>${index + 1} / ${currentItems.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>
    <section class="study-card">
      <div class="study-top"><span>${esc(item.level)} · ${isPractice ? 'PRACTICE' : item.type === 'grammar' ? 'GRAMMAR' : item.type === 'verb' || item.infinitive ? 'VERB' : 'VOCABULARY'}</span><span>${index + 1}/${currentItems.length}</span></div>
      ${!isPractice ? `<div class="scene scene-illustration"><img class="scene-art" src="${art}" alt="${esc(artAlt)}" loading="eager"></div>` : ''}
      <div class="study-body">
        ${!isPractice ? `<h2 dir="ltr">${isWorkDirect ? (state.settings.language === 'en' ? 'Match the picture' : item.type === 'grammar' ? (state.settings.language === 'en' ? 'Match the grammar topic' : 'Gramer konusunu eşleştirin') : item.infinitive ? (state.settings.language === 'en' ? 'Match the German verb' : 'Fiili görselle eşleştirin') : (state.settings.language === 'en' ? 'Match the German word' : 'Görseli kelimeyle eşleştirin')) : esc(title)}</h2>` : ''}
        <p class="sentence ${isPractice ? 'fill-gap-sentence' : ''}" dir="ltr">${esc(sentence)}</p>
        ${isPractice ? '' : item.type === 'grammar' ? `<div class="note">${esc(grammarExplanation(item))}<br><br><strong dir="ltr">${esc(item.example)}</strong></div>` : item.type === 'verb' || item.infinitive ? renderVerbInfo(item) : `<div class="source-line">${esc(item.plural ? `Plural: ${item.plural}` : '')}</div>`}
        ${!isPractice ? `<div class="toolbar" style="justify-content:center"><button class="chip" id="speakButton">🔊 ${state.settings.language === 'en' ? 'Listen' : 'Dinle'}</button></div>` : ''}
        <p class="question-label">${esc(prompt)}</p>
        <div class="answers">${options.map((option, i) => `<button class="answer-option" data-answer="${i}">${esc(option)}<span>${String.fromCharCode(65 + i)}</span></button>`).join('')}</div>
        <div id="feedback"></div>
        <button class="primary-button" id="checkAnswer" disabled>${t('check')}</button>
      </div>
    </section>
    ${item.type === 'grammar' ? `<button class="source-entry-card" id="grammarSources"><span class="source-entry-icon">📚</span><span><strong>Bu gramer konusunun kaynakları</strong><small>BAMF · vhs-Lernportal · Goethe · DW</small></span><span class="source-entry-arrow">›</span></button>` : ''}
    <div class="note">${state.settings.language === 'en' ? 'Your progress is saved on this device. No account is required.' : 'İlerlemeniz bu cihazda kaydedilir. Kayıt için hesap açmanız gerekmez.'}</div>
    ${!['tr','en'].includes(state.settings.language) ? `<div class="note">Bu dil için kelime ve örnek cümle çevirileri henüz tamamlanmadı; bu prototipte İngilizce karşılık gösterilir.</div>` : ''}
  `;
  document.querySelector('#exitStudy').addEventListener('click', () => exitStudy());
  document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => selectAnswer(Number(button.dataset.answer))));
  document.querySelector('#checkAnswer').addEventListener('click', checkAnswer);
  document.querySelector('#speakButton')?.addEventListener('click', () => speak(isWorkDirect ? (item.target || item.infinitive || item.title || grammarTitle(item)) : `${title}. ${sentence}`));
  document.querySelector('#grammarSources')?.addEventListener('click', renderSources);
}

function renderVerbInfo(item) {
  if (!(item.infinitive || item.type === 'verb')) return '';
  return `<div class="conjugation" dir="ltr"><div><strong>Präsens</strong>${item.present?.map(v => `<p>${esc(v)}</p>`).join('') || '<p>—</p>'}</div><div><strong>Präteritum</strong><p>${esc(item.preterite || '—')}</p></div><div><strong>Perfekt</strong><p>${esc(item.perfect || '—')}</p></div></div><div class="source-line">${esc(meaning(item))}</div>`;
}

function routeTitle(module) {
  return module === 'words' ? t('words') : module === 'verbs' ? t('verbs') : module === 'grammar' ? t('grammar') : module === 'mistakes' ? t('mistakes') : module === 'practice' ? (state.settings.language === 'en' ? 'Fill in the blanks' : 'Boşluk doldurma') : t('mixed');
}

function selectAnswer(index) {
  if (answered) return;
  selectedAnswer = index;
  document.querySelectorAll('[data-answer]').forEach(button => button.classList.toggle('selected', Number(button.dataset.answer) === index));
  document.querySelector('#checkAnswer').disabled = false;
}

async function checkAnswer() {
  if (selectedAnswer == null || answered) return;
  answered = true;
  const item = currentItem;
  const isCorrect = selectedAnswer === item.answer;
  const sessionId = activeSession.id;
  const now = Date.now();
  const trackedItemId = item.type === 'practice' ? (item.targetItemId || item.id) : (item.sourceItemId || item.id);
  const previousCompleted = { ...(state.progress.completed || {}) };
  state.progress = recordAnswer(state.progress, trackedItemId, isCorrect, sessionId, now);
  const progressKey = activeSession.sessionKey || makeSessionKey(activeSession.module, activeSession.subsection || 'all', activeSession.mode || 'learn');
  if (activeSession.mode === 'work') {
    state.progress.completed = previousCompleted;
    state.progress.studyProgress ||= {};
    state.progress.studyProgress[progressKey] ||= {};
    state.progress.studyProgress[progressKey][item.id] = isCorrect;
  } else {
    state.progress.learningProgress ||= {};
    state.progress.learningProgress[progressKey] ||= {};
    if (isCorrect) state.progress.learningProgress[progressKey][trackedItemId] = true;
    else delete state.progress.learningProgress[progressKey][trackedItemId];
  }
  if (!isCorrect && state.progress.mistakes[trackedItemId]) {
    const sourceItem = [...WORDS, ...VERBS, ...GRAMMAR].find(entry => entry.id === trackedItemId) || item;
    const sourceModule = moduleForItem(sourceItem);
    state.progress.mistakes[trackedItemId].module = sourceModule;
    state.progress.mistakes[trackedItemId].subsection = subsectionFor(sourceItem, sourceModule);
    state.progress.mistakes[trackedItemId].level = sourceItem.level;
  }
  state.progress.totalAnswers = (state.progress.totalAnswers || 0) + 1;
  if (isCorrect) state.progress.correctAnswers = (state.progress.correctAnswers || 0) + 1;
  activeSession.itemIndex += 1;
  activeSession.updatedAt = now;
  const sessionKey = activeSession.sessionKey || makeSessionKey(activeSession.module, activeSession.subsection || 'all', activeSession.mode || 'learn');
  state.progress.moduleSessions[sessionKey] = activeSession;
  state.progress.lastSessionKey = sessionKey;
  await saveState();

  const buttons = [...document.querySelectorAll('[data-answer]')];
  buttons.forEach((button, i) => {
    button.disabled = true;
    if (i === item.answer) button.classList.add('correct');
    if (i === selectedAnswer && !isCorrect) button.classList.add('wrong');
  });
  const exp = item.type === 'practice'
    ? (state.settings.language === 'en' ? item.explanationEn : item.explanation)
    : item.type === 'grammar' ? grammarExplanation(item) : `${meaning(item)}${sentenceMeaning(item) ? ` — ${sentenceMeaning(item)}` : ''}`;
  const reviewRecord = state.progress.mistakes[trackedItemId];
  const reviewNote = isCorrect && reviewRecord?.lastReviewedAt === now && reviewRecord.correctSessions.length < 3 ? '' : ''; // review spacing is tracked in local progress
  const feedback = document.querySelector('#feedback');
  feedback.className = `feedback ${isCorrect ? 'good' : 'bad'}`;
  feedback.innerHTML = `<strong>${isCorrect ? t('correct') : t('wrong')}</strong><br>${esc(exp)}${reviewNote}${!isCorrect ? `<br><small>${state.settings.language === 'en' ? 'Correct answer:' : 'Doğru cevap:'} ${esc(buttons[item.answer]?.textContent.replace(/[A-C]$/, '').trim())}</small>` : ''}`;
  document.querySelector('#checkAnswer').textContent = t('next');
  document.querySelector('#checkAnswer').disabled = false;
  document.querySelector('#checkAnswer').onclick = nextItem;
  if (shouldShowMiniAd(state.progress.totalAnswers, state.settings.isPro) && !adBannerDismissed) adSlot.classList.remove('hidden');
  currentFeedback = { isCorrect, itemId: item.id };
}

function nextItem() {
  adSlot.classList.add('hidden');
  if (activeSession.itemIndex >= currentItems.length) return finishSession();
  renderStudy();
}

function finishSession() {
  activeSession.completedAt = Date.now();
  state.progress.sessions[activeSession.id] = { ...activeSession };
  const key = activeSession.sessionKey || makeSessionKey(activeSession.module, activeSession.subsection || 'all', activeSession.mode || 'learn');
  state.progress.moduleSessions[key] = activeSession;
  state.progress.lastSessionKey = key;
  saveState();
  const canInterstitial = shouldShowInterstitial(state.progress.lastInterstitialAt, Date.now(), state.settings.isPro);
  main.innerHTML = `<section class="panel complete-card"><div class="complete-icon">🎉</div><div class="eyebrow">${esc(state.settings.level)} · ${esc(routeTitle(activeSession.module))}</div><h2>${state.settings.language === 'en' ? 'Session completed' : 'Çalışma tamamlandı'}</h2><p>${state.settings.language === 'en' ? 'Your answers and progress have been saved on this device.' : 'Cevaplarınız ve ilerlemeniz bu cihaza kaydedildi.'}<br>${state.progress.correctAnswers} ${state.settings.language === 'en' ? 'correct answers in total.' : 'toplam doğru cevap.'}</p><button class="primary-button" id="againButton">${state.settings.language === 'en' ? 'Practise again' : 'Tekrar çalış'}</button><button class="secondary-button" style="width:100%;margin-top:9px" id="homeFromComplete">${t('home')}</button>${canInterstitial ? `<div class="source-line">Reklam gösterimi için güvenli geçiş noktası. Gerçek AdMob SDK'sı bağlandığında frekans sınırı burada uygulanır.</div>` : ''}</section>`;
  document.querySelector('#againButton').addEventListener('click', () => startModule(activeSession.module, activeSession.subsection && activeSession.subsection !== 'all' ? activeSession.subsection : null, activeSession.mode || 'learn'));
  document.querySelector('#homeFromComplete').addEventListener('click', () => {
    if (canInterstitial && !state.settings.isPro) state.progress.lastInterstitialAt = Date.now();
    saveState(); renderHome();
  });
  adSlot.classList.add('hidden');
}

function exitStudy() {
  saveState();
  const canInterstitial = shouldShowInterstitial(state.progress.lastInterstitialAt, Date.now(), state.settings.isPro);
  if (canInterstitial) state.progress.lastInterstitialAt = Date.now();
  saveState(); renderHome();
}

async function speak(text) {
  const phrase = String(text || '').trim();
  if (!phrase) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await TextToSpeech.stop().catch(() => {});
      const { supported } = await TextToSpeech.isLanguageSupported({ lang: 'de-DE' });
      if (!supported) {
        if (Capacitor.getPlatform() === 'android') {
          await TextToSpeech.openInstall().catch(() => {});
        }
        showToast('Cihazda Almanca ses paketi bulunamadı. Android Ayarlar > Metin okuma çıkışından Almanca ses yükleyin.');
        return;
      }
      await TextToSpeech.speak({ text: phrase, lang: 'de-DE', rate: 0.82, pitch: 1, volume: 1, queueStrategy: 0 });
      return;
    }
    if (typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance === 'undefined') {
      showToast('Bu tarayıcı sesli okumayı desteklemiyor. Android uygulamasında yerel ses motoru kullanılır.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(phrase);
    utterance.lang = 'de-DE';
    utterance.rate = 0.88;
    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(voice => /^de(-|_)/i.test(voice.lang));
    if (germanVoice) utterance.voice = germanVoice;
    utterance.onerror = event => showToast(`Seslendirme hatası: ${event.error || 'bilinmeyen hata'}`);
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('LernWerk TTS error', error);
    showToast(`Seslendirme başlatılamadı: ${error?.message || 'TTS motorunu kontrol edin.'}`);
  }
}

function renderSettings() {
  route = 'settings'; setNav('home');
  main.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">PREFERENCES</div><h1>${t('settings')}</h1><p>${state.settings.language === 'en' ? 'Choose the language you use to learn German and your target level.' : 'Almanca öğrenirken kullanacağınız ana dili ve hedef seviyenizi seçin.'}</p></div><button class="back-button" id="settingsBack">← ${t('home')}</button></div>
    <section class="panel">
      <div class="settings-grid">
        <label class="setting-card"><strong>${t('language')}</strong><select id="languageSelect">${LANGUAGES.map(lang => `<option value="${lang.code}" ${state.settings.language === lang.code ? 'selected' : ''}>${esc(lang.label)} — ${esc(lang.native)}</option>`).join('')}</select></label>
        <label class="setting-card"><strong>${t('level')}</strong><select id="levelSelect">${['A1','A2','B1'].map(level => `<option value="${level}" ${state.settings.level === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label>
      </div>
      <div class="note">A2 seçildiğinde tüm kelime, fiil, gramer ve çalışma oturumları %75 A2 + %25 A1 olur. B1 seçildiğinde %75 B1 + %25 A2 kullanılır. Her bölüm ve alt başlığın ilerlemesi ayrı saklanır.</div><div class="setting-card"><strong>Alt seviye tekrarı</strong><p style="font-size:12px;color:var(--muted)">A2 seçiliyken %75 A2 + %25 A1; B1 seçiliyken %75 B1 + %25 A2. İstersen yalnızca seçili seviyeyi çalış.</p><label><input type="checkbox" id="includeLowerLevelReview" ${state.settings.includeLowerLevelReview !== false ? 'checked' : ''}/> %25 alt seviye tekrarını dahil et</label></div>
      <div class="section-title"><div><h2>${state.settings.language === 'en' ? 'Guest profile and sync' : 'Misafir profili ve senkronizasyon'}</h2><p>${state.settings.language === 'en' ? 'Your progress is stored locally without registration.' : 'İlerlemeniz kayıt olmadan cihazda saklanır.'}</p></div></div>
      <div class="setting-card"><strong>${state.settings.accountLinked ? 'Hesap bağlı' : 'Misafir kullanıcı'}</strong><p style="font-size:12px;color:var(--muted);line-height:1.5">${state.settings.accountLinked ? 'Bu prototipte hesap bağlama demosudur. Gerçek kimlik sağlayıcısı henüz bağlanmadı.' : 'Cihazdaki kayıtlar IndexedDB üzerinde tutulur. Hesap ve bulut senkronizasyonu backend aşamasında eklenecek.'}</p><button class="secondary-button" id="accountButton">${state.settings.accountLinked ? 'Hesap bağlantısı demo durumunu kaldır' : 'Hesap bağlama (demo)'}</button></div>
      <div class="section-title"><div><h2>Pro ve reklam tercihleri</h2><p>Pro altyapısı hazır; ödeme sağlayıcıları henüz bağlanmadı.</p></div></div>
      <div class="setting-card"><strong>Pro modu (test)</strong><p style="font-size:12px;color:var(--muted)">Pro açıkken uygulama içi reklam alanları gösterilmez. Gerçek abonelik doğrulaması sunucu tarafından yapılacak.</p><label><input type="checkbox" id="proToggle" ${state.settings.isPro ? 'checked' : ''}/> Pro modunu etkinleştir</label></div>
      <div class="note">Reklam kategorileri AdMob konsolunda ayrıca engellenecek. +18, siyaset, alkol, sigara/tütün ve kumar içerikleri için yayıncı engelleme kontrolleri uygulanacak. Reklam sınıflandırması yüzde yüz garanti vermez.</div>
      <div class="sync-status">● ${state.settings.accountLinked ? 'Hesap bağlı (demo)' : 'Misafir verileri bu cihazda kayıtlı'}</div>
    </section>`;
  document.querySelector('#settingsBack').addEventListener('click', renderHome);
  document.querySelector('#languageSelect').addEventListener('change', async e => { state.settings.language = e.target.value; await saveState(); renderSettings(); });
  document.querySelector('#levelSelect').addEventListener('change', async e => { state.settings.level = e.target.value; await saveState(); renderSettings(); });
  document.querySelector('#includeLowerLevelReview')?.addEventListener('change', async e => { state.settings.includeLowerLevelReview = e.target.checked; await saveState(); renderSettings(); });
  document.querySelector('#proToggle').addEventListener('change', async e => { state.settings.isPro = e.target.checked; await saveState(); renderSettings(); });
  document.querySelector('#accountButton').addEventListener('click', async () => { state.settings.accountLinked = !state.settings.accountLinked; await saveState(); renderSettings(); showToast('Bu işlem prototip durumunu değiştirir; gerçek hesap henüz bağlanmadı.'); });
}

function renderTopics() {
  route = 'topics'; setNav('home');
  const allowed = levelsIncluded(state.settings.level);
  const topics = TOPICS.filter(topic => allowed.includes(topic.level));
  main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">A1 → A2 → B1</div><h1>${state.settings.language === 'en' ? 'Course roadmap' : 'Konu sıralaması'}</h1><p>${state.settings.language === 'en' ? 'A staged course structure based on official exam topics.' : 'Resmî sınav konu başlıkları temelinde aşamalı eğitim planı.'}</p></div><button class="back-button" id="topicsBack">← ${t('home')}</button></div><div class="topic-list">${topics.map(topic => `<div class="topic-row"><span class="topic-icon">${topic.icon}</span><span><strong>${esc(topic.title)}</strong><small>${esc(topic.units.join(' · '))}</small></span><span class="chevron">›</span></div>`).join('')}</div><div class="note">A1 konu listesi başlangıç taslağıdır. A2 ve B1 başlıkları resmi kaynaklarla eşleştirme aşamasında eklenecek.</div>`;
  document.querySelector('#topicsBack').addEventListener('click', renderHome);
}

function renderSources() {
  route = 'sources'; setNav('home');
  const sourceCards = OFFICIAL_SOURCES.map(source => `
    <article class="reference-card">
      <div class="reference-card-top"><span class="reference-level">${esc(source.level)}</span><span class="reference-publisher">${esc(source.publisher)}</span></div>
      <h3>${esc(source.title)}</h3>
      <p class="reference-year">${esc(source.year)} · Kontrol: ${esc(source.checkedOn || "")}</p>
      <p>${esc(source.description)}</p>
      <div class="reference-use"><strong>Uygulamada kullanım:</strong> ${esc(source.use)}</div>
      <p class="reference-rights"><strong>Telif / kullanım:</strong> ${esc(source.rights)}</p>
      <a class="reference-link" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Kaynağı aç ↗</a>
    </article>`).join('');
  const curriculum = GRAMMAR_CURRICULUM.map(group => {
    const refs = (group.sourceIds || []).map(id => OFFICIAL_SOURCES.find(source => source.id === id)).filter(Boolean);
    return `
    <section class="curriculum-card">
      <div class="curriculum-heading"><span class="reference-level">${esc(group.level)}</span><div><h3>${esc(group.title)}</h3><p>${esc(group.provenance)}</p></div></div>
      <ol>${group.topics.map(topic => `<li>${esc(topic)}</li>`).join('')}</ol>
      <div class="reference-use"><strong>Bu seviye için referanslar:</strong> ${refs.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)} – ${esc(source.title)}</a>`).join(' · ')}</div>
    </section>`;
  }).join('');
  main.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">QUELLEN · CURRICULUM</div><h1>Kaynaklar ve gramer müfredatı</h1><p>Gramer konu sırası, kelime kapsamı ve sınav örnekleri için kullandığımız resmî ve açık erişimli referanslar.</p></div><button class="back-button" id="sourcesBack">← Ana sayfa</button></div>
    <div class="note"><strong>Önemli kaynak ayrımı:</strong> DTZ'nin resmî el kitabı A2–B1 yapısal envanterini verir; Goethe'nin A1/A2/B1 sınav sayfaları ise örnek sınav ve kelime referansları sunar. A1–B1 gramer sıralamasını ders bazında en açık biçimde vhs-Lernportal'ın konu/gramer özetleri destekler. Goethe veya DTZ tarafından yayımlanmış tek ve eksiksiz bir “resmî gramer listesi” olduğu iddia edilmez.</div>
    <div class="section-title"><div><h2>A1 → A2 → B1 gramer sırası</h2><p>Her seviye önceki seviyeyi temel alır.</p></div></div>
    ${curriculum}
    <div class="section-title"><div><h2>Kaynak kayıtları</h2><p>Kaynak, yayıncı, seviye, kullanım amacı ve telif notu.</p></div></div>
    <div class="reference-list">${sourceCards}</div>
    <div class="note">Bu uygulama Goethe-Institut, BAMF, telc, vhs-Lernportal veya Deutsche Welle tarafından onaylanmış ya da bu kurumlarla bağlantılı bir ürün değildir. Kurumların kaynakları eğitim içeriğinin doğrulanması için referans alınır. Kaynak belgelerdeki soru, açıklama veya listeler izin alınmadan topluca kopyalanmaz.</div>`;
  document.querySelector('#sourcesBack').addEventListener('click', renderHome);
}

function bootNav() {
  document.querySelector('#homeButton').addEventListener('click', renderHome);
  document.querySelector('#settingsButton').addEventListener('click', renderSettings);
  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => openRoute(button.dataset.nav)));
  document.querySelector('#globalLevel').addEventListener('change', async e => { state.settings.level = e.target.value; await saveState(); rerenderAfterGlobalSettingChange(); });
  document.querySelector('#globalLanguage').addEventListener('change', async e => { state.settings.language = e.target.value; await saveState(); rerenderAfterGlobalSettingChange(); });
  document.querySelector('#hideAd').addEventListener('click', () => { adSlot.classList.add('hidden'); adBannerDismissed = true; });
}

function migrateProgressBySubsection() {
  const sessions = state.progress.moduleSessions || {};
  const collections = { words: WORDS, verbs: VERBS, grammar: GRAMMAR, mixed: [...WORDS, ...VERBS], practice: PRACTICE_QUESTIONS, mistakes: [...WORDS, ...VERBS, ...GRAMMAR] };
  for (const [oldKey, saved] of Object.entries(sessions)) {
    saved.mode ||= oldKey.includes(':work-') ? 'work' : 'learn';
    if (oldKey.split(':').length !== 2 || !saved?.module || !Array.isArray(saved.itemIds)) continue;
    const source = collections[saved.module] || [];
    const byId = new Map(source.map(item => [item.id, item]));
    const current = byId.get(saved.itemIds[saved.itemIndex]);
    if (!current) continue;
    const sourceModule = saved.module === 'mistakes' ? (state.progress.mistakes[current.id]?.module || moduleForItem(current)) : saved.module;
    const subsection = saved.module === 'mistakes'
      ? `${sourceModule}::${state.progress.mistakes[current.id]?.subsection || subsectionFor(current, sourceModule)}`
      : subsectionFor(current, saved.module);
    const filteredIds = saved.itemIds.filter(id => {
      const item = byId.get(id);
      if (!item) return false;
      if (saved.module === 'mistakes') {
        const record = state.progress.mistakes[id];
        return (record?.module || moduleForItem(item)) === sourceModule && (record?.subsection || subsectionFor(item, sourceModule)) === subsection.split('::')[1];
      }
      return subsectionFor(item, saved.module) === subsection;
    });
    const newIndex = filteredIds.indexOf(current.id);
    if (newIndex < 0) continue;
    const nextKey = sessionStorageKey(saved.level || state.settings.level, saved.module, subsection);
    sessions[nextKey] = { ...saved, subsection, itemIds: filteredIds, itemIndex: newIndex };
    if (state.progress.lastSessionKey === oldKey) state.progress.lastSessionKey = nextKey;
  }
  for (const [id, record] of Object.entries(state.progress.mistakes || {})) {
    const item = [...WORDS, ...VERBS, ...GRAMMAR].find(entry => entry.id === id);
    if (!item) continue;
    record.module ||= moduleForItem(item);
    record.subsection ||= subsectionFor(item, record.module);
    record.level ||= item.level;
  }
}

async function init() {
  try { db = await openDatabase(); } catch { db = null; }
  state = (await readState()) || defaults();
  state.settings = { ...defaults().settings, ...(state.settings || {}) };
  if (state.settings.includeLowerLevelReview == null) state.settings.includeLowerLevelReview = state.settings.includeA1Review !== false;
  state.progress = { ...defaults().progress, ...(state.progress || {}) };
  state.progress.moduleSessions ||= {};
  state.progress.learningProgress ||= {};
  state.progress.studyProgress ||= {};
  if (state.progress.lastInterstitialAt == null) state.progress.lastInterstitialAt = Date.now();
  state.progress.sessions ||= {};
  state.progress.mistakes ||= {};
  migrateProgressBySubsection();
  await saveState();
  bootNav();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
  renderHome();
}

init();
