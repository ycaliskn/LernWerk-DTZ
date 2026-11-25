import { LANGUAGES, WORDS, VERBS, GRAMMAR, TOPICS, PRACTICE_QUESTIONS } from './content.js';
import { illustrationDataUri, illustrationAlt } from './illustrations.js';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { UI_TEXT } from './i18n.js';
import { GRAMMAR_CURRICULUM, OFFICIAL_SOURCES } from './sources.js';
import { levelsIncluded, isItemAvailable, recordAnswer, shouldShowMiniAd, shouldShowInterstitial, createSession, chooseResumeAction, resumeSession, mixA1Review, sessionStorageKey } from './core.js';

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
  settings: { language: 'tr', level: 'A1', isPro: false, accountLinked: false, audioEnabled: true, includeA1Review: true },
  progress: { mistakes: {}, completed: {}, sessions: {}, totalAnswers: 0, correctAnswers: 0, lastInterstitialAt: null, moduleSessions: {} },
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
  document.documentElement.dir = ['ar', 'ur', 'fa'].includes(state.settings.language) ? 'rtl' : 'ltr';
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.nav === active));
  const lang = state.settings.language;
  document.querySelector('#navHome').textContent = t('home');
  document.querySelector('#navWords').textContent = lang === 'en' ? 'Words' : lang === 'tr' ? 'Kelime' : UI_TEXT[lang]?.words || 'Kelime';
  document.querySelector('#navVerbs').textContent = lang === 'en' ? 'Verbs' : lang === 'tr' ? 'Fiil' : UI_TEXT[lang]?.verbs || 'Fiil';
  document.querySelector('#navGrammar').textContent = lang === 'en' ? 'Grammar' : lang === 'tr' ? 'Gramer' : UI_TEXT[lang]?.grammar || 'Gramer';
  document.querySelector('#navMistakes').textContent = lang === 'en' ? 'Errors' : lang === 'tr' ? 'Hatalar' : UI_TEXT[lang]?.mistakes || 'Hatalar';
  document.querySelector('#levelPill').textContent = state.settings.level;
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
  const levelDescription = state.settings.level === 'A1' ? 'A1 başlangıç düzeyi' : state.settings.level === 'A2' ? 'A1 + A2 içerikleri açık' : 'A1 + A2 + B1 içerikleri açık';
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
  const saved = state.progress.moduleSessions?.[state.progress.lastSessionKey];
  if (!saved || saved.itemIndex >= saved.itemIds.length) return '';
  return `<section class="progress-card" style="margin-top:18px"><div class="progress-head"><strong>${state.settings.language === 'en' ? 'Continue learning' : 'Çalışmaya devam et'}</strong><span>${saved.itemIndex + 1} / ${saved.itemIds.length}</span></div><button class="primary-button" data-resume="1">${t('continue')}</button><button class="secondary-button" style="width:100%;margin-top:8px" data-restart="1">${t('restart')}</button></section>`;
}

function bindRouteButtons() {
  document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => openRoute(button.dataset.route)));
  document.querySelector('[data-resume]')?.addEventListener('click', () => resumeSaved('continue'));
  document.querySelector('[data-restart]')?.addEventListener('click', () => resumeSaved('restart'));
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
    <div class="page-heading"><div><div class="eyebrow">STUDY MODES</div><h1>${t('mixed')}</h1><p>${state.settings.language === 'en' ? 'Choose what you want to practise in this session.' : 'Bu oturumda hangi konuyu çalışmak istediğinizi seçin.'}</p></div><button class="back-button" id="studyMenuBack">← ${t('home')}</button></div>
    <div class="module-grid">
      <button class="module-card" data-study-mode="words"><span class="module-icon tint-blue">🖼️</span><span><h3>${t('words')}</h3><p>${state.settings.language === 'en' ? 'Vocabulary only' : 'Yalnızca kelime çalışması'}</p></span></button>
      <button class="module-card" data-study-mode="verbs"><span class="module-icon tint-green">🔄</span><span><h3>${t('verbs')}</h3><p>${state.settings.language === 'en' ? 'Verb forms and meanings' : 'Fiil çekimleri ve anlamları'}</p></span></button>
      <button class="module-card" data-study-mode="mixed"><span class="module-icon tint-teal">🧠</span><span><h3>${state.settings.language === 'en' ? 'Words + verbs mixed' : 'Kelime + fiil karışık'}</h3><p>${state.settings.language === 'en' ? 'Alternate vocabulary and verbs' : 'Kelime ve fiil soruları dönüşümlü gelir'}</p></span></button>
      <button class="module-card" data-study-mode="grammar"><span class="module-icon tint-purple">📐</span><span><h3>${t('grammar')}</h3><p>${state.settings.language === 'en' ? 'Grammar rules and exercises' : 'Gramer kuralları ve alıştırmalar'}</p></span></button>
      <button class="module-card practice-mode-card" data-study-mode="practice"><span class="module-icon tint-orange">✍️</span><span><h3>${state.settings.language === 'en' ? 'Fill in the blanks' : 'Boşluk doldurma'}</h3><p>${state.settings.language === 'en' ? 'New sentences, not the learning examples' : 'Öğrenme kartlarından farklı yeni cümleler'}</p></span></button>
    </div>
    <button class="source-entry-card" data-route="sources"><span class="source-entry-icon">📖</span><span><strong>Gramer kaynakları ve konu sırası</strong><small>Her seviyenin açık doküman dayanaklarını görüntüleyin</small></span><span class="source-entry-arrow">›</span></button>`;
  document.querySelector('#studyMenuBack').addEventListener('click', renderHome);
  document.querySelector('[data-route="sources"]')?.addEventListener('click', renderSources);
  document.querySelectorAll('[data-study-mode]').forEach(button => button.addEventListener('click', () => startModule(button.dataset.studyMode)));
}

function moduleForItem(item) {
  if (WORDS.some(entry => entry.id === item.id)) return 'words';
  if (VERBS.some(entry => entry.id === item.id)) return 'verbs';
  if (GRAMMAR.some(entry => entry.id === item.id)) return 'grammar';
  return 'mixed';
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
  const allowed = levelsIncluded(state.settings.level);
  let words = WORDS.filter(item => allowed.includes(item.level));
  const verbs = VERBS.filter(item => allowed.includes(item.level));
  const grammar = GRAMMAR.filter(item => allowed.includes(item.level));
  if (['words','mixed'].includes(module) && state.settings.level === 'A2') {
    const a2 = words.filter(item => item.level === 'A2');
    const a1 = words.filter(item => item.level === 'A1');
    if (!state.settings.includeA1Review) words = a2;
    else {
      words = mixA1Review(a1.map(item => ({...item, completed: Boolean(state.progress.completed[item.id])})), a2, true);
    }
  }
  let items = module === 'words' ? words
    : module === 'verbs' ? verbs
    : module === 'grammar' ? grammar
    : module === 'mixed' ? [...words, ...verbs]
    : module === 'practice' ? PRACTICE_QUESTIONS.filter(item => allowed.includes(item.level))
    : module === 'mistakes' ? [...WORDS, ...VERBS, ...GRAMMAR].filter(item => {
        const record = state.progress.mistakes[item.id];
        if (!record) return false;
        if (!subsectionKey) return true;
        const [sourceModule, topic] = subsectionKey.includes('::') ? subsectionKey.split('::') : [subsectionKey, null];
        return (record.module || moduleForItem(item)) === sourceModule && (!topic || subsectionFor(item, sourceModule) === topic);
      })
    : [];
  if (subsectionKey && module !== 'mistakes') items = items.filter(item => subsectionFor(item, module) === subsectionKey);
  return items;
}

function renderModuleSections(module, items) {
  route = `${module}-sections`; setNav(module === 'mixed' ? 'home' : module);
  const groups = new Map();
  for (const item of items) {
    const key = subsectionFor(item, module);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const title = module === 'words' ? t('words') : module === 'verbs' ? t('verbs') : module === 'grammar' ? t('grammar') : module === 'practice' ? 'Boşluk doldurma' : t('mixed');
  main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">${esc(state.settings.level)} · ${esc(title)}</div><h1>Alt başlık seçin</h1><p>Her başlığın ilerlemesi ve kaldığınız yer ayrı kaydedilir.</p></div><button class="back-button" id="sectionsBack">← Ana sayfa</button></div><div class="topic-list">${[...groups.entries()].map(([key, group]) => {
    const saved = state.progress.moduleSessions?.[sessionStorageKey(state.settings.level, module, key)];
    const done = group.filter(item => state.progress.completed[item.id]).length;
    return `<button class="topic-row subsection-button" data-subsection="${esc(key)}"><span class="topic-icon">${module === 'words' ? '🖼️' : module === 'verbs' ? '🔄' : '📐'}</span><span><strong>${esc(key)}</strong><small>${group.length} öğe · ${done}/${group.length} tamamlandı${saved && saved.itemIndex < saved.itemIds.length ? ` · ${saved.itemIndex + 1}. öğeden devam` : ''}</small></span><span class="chevron">›</span></button>`;
  }).join('')}</div>`;
  document.querySelector('#sectionsBack').addEventListener('click', renderHome);
  document.querySelectorAll('[data-subsection]').forEach(button => button.addEventListener('click', () => startModule(module, button.dataset.subsection)));
}

function renderMistakeArchive() {
  route = 'mistakes'; setNav('mistakes');
  const records = Object.entries(state.progress.mistakes || {});
  const groups = ['words','verbs','grammar'].map(module => ({module, items: records.filter(([id, record]) => (record.module || moduleForItem({id})) === module)}));
  main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">${state.settings.level} · HATALAR</div><h1>Hata arşivim</h1><p>Yanlışların kelime, fiil ve gramer bölümlerinde ayrı saklanır.</p></div><button class="back-button" id="mistakesBack">← Ana sayfa</button></div><div class="topic-list">${groups.map(group => `<button class="topic-row" data-mistake-module="${group.module}"><span class="topic-icon">${group.module==='words'?'🖼️':group.module==='verbs'?'🔄':'📐'}</span><span><strong>${group.module==='words'?t('words'):group.module==='verbs'?t('verbs'):t('grammar')}</strong><small>${group.items.length} aktif hata</small></span><span class="chevron">›</span></button>`).join('')}</div>`;
  document.querySelector('#mistakesBack').addEventListener('click', renderHome);
  document.querySelectorAll('[data-mistake-module]').forEach(button => button.addEventListener('click', () => {
    const module = button.dataset.mistakeModule;
    const list = [...WORDS,...VERBS,...GRAMMAR].filter(item => state.progress.mistakes[item.id]?.module === module || (!state.progress.mistakes[item.id]?.module && moduleForItem(item) === module));
    const byTopic = new Map();
    list.forEach(item => { const key = subsectionFor(item,module); if(!byTopic.has(key)) byTopic.set(key,[]); byTopic.get(key).push(item); });
    main.innerHTML = `<div class="page-heading"><div><div class="eyebrow">HATA ARŞİVİ</div><h1>${module==='words'?t('words'):module==='verbs'?t('verbs'):t('grammar')}</h1><p>Hatalar alt başlıklarına göre saklanır ve buradan tekrar sorulur.</p></div><button class="back-button" id="archiveBack">← Geri</button></div><div class="topic-list">${[...byTopic].map(([key,items])=>`<button class="topic-row" data-error-topic="${esc(key)}"><span><strong>${esc(key)}</strong><small>${items.length} hata</small></span><span class="chevron">›</span></button>`).join('')}</div>`;
    document.querySelector('#archiveBack').addEventListener('click', renderMistakeArchive);
    document.querySelectorAll('[data-error-topic]').forEach(b=>b.addEventListener('click',()=>startModule('mistakes',`${module}::${b.dataset.errorTopic}`)));
  }));
}

function startModule(module, subsectionKey = null) {
  if (module === 'mistakes' && !subsectionKey) return renderMistakeArchive();
  const mistakeFilter = module === 'mistakes' && subsectionKey?.includes('::') ? subsectionKey : null;
  let items;
  if (mistakeFilter) {
    const [sourceModule, topic] = mistakeFilter.split('::');
    items = [...WORDS,...VERBS,...GRAMMAR].filter(item => {
      const record = state.progress.mistakes[item.id];
      return record && moduleForItem(item) === sourceModule && subsectionFor(item,sourceModule) === topic;
    });
    subsectionKey = mistakeFilter;
  } else items = filteredItems(module, subsectionKey);
  if (!items.length) {
    showToast('Bu alt başlıkta tekrar edilecek içerik bulunmuyor.');
    return module === 'mistakes' ? renderMistakeArchive() : renderHome();
  }
  if (!subsectionKey && ['words','verbs','grammar','mixed','practice'].includes(module)) return renderModuleSections(module, items);
  const key = sessionStorageKey(state.settings.level, module, subsectionKey || 'all');
  const saved = state.progress.moduleSessions?.[key];
  if (saved?.module === module && saved.itemIndex > 0 && saved.itemIndex < saved.itemIds.length) {
    renderResumeChoice(module, items, saved);
  } else {
    beginSession(module, items, subsectionKey || 'all');
  }
}

function renderResumeChoice(module, items, saved) {
  route = module; setNav(module === 'mixed' ? 'home' : module);
  const title = module === 'words' ? t('words') : module === 'verbs' ? t('verbs') : module === 'grammar' ? t('grammar') : module === 'mistakes' ? t('mistakes') : module === 'practice' ? (state.settings.language === 'en' ? 'Fill in the blanks' : 'Boşluk doldurma') : t('mixed');
  main.innerHTML = `<section class="panel complete-card"><div class="complete-icon">⏸️</div><div class="eyebrow">${esc(title)}</div><h2>${state.settings.language === 'en' ? 'You have an unfinished session' : 'Tamamlanmamış bir çalışmanız var'}</h2><p>${saved.itemIndex + 1}. ${state.settings.language === 'en' ? 'item' : 'öğeden'} devam edebilirsiniz. Baştan başlamak kayıtlı istatistiklerinizi silmez.</p><button class="primary-button" id="continueSession">${t('continue')}</button><button class="secondary-button" style="width:100%;margin-top:9px" id="restartSession">${t('restart')}</button></section>`;
  document.querySelector('#continueSession').addEventListener('click', () => {
    const byId = new Map(items.map(item => [item.id, item]));
    const restoredItems = saved.itemIds.map(id => byId.get(id)).filter(Boolean);
    activeItemPool = restoredItems.length ? restoredItems : items;
    activeSession = resumeSession(saved, 'continue');
    currentItems = activeItemPool;
    renderStudy();
  });
  document.querySelector('#restartSession').addEventListener('click', () => beginSession(module, items, saved.subsection || 'all'));
}

function beginSession(module, items, subsection = 'all') {
  activeItemPool = [...items];
  currentItems = activeItemPool;
  activeSession = createSession(module, state.settings.level, activeItemPool);
  activeSession.subsection = subsection;
  activeSession.itemIds = activeItemPool.map(item => item.id);
  activeSession.itemIndex = 0;
  const key = sessionStorageKey(state.settings.level, activeSession.module, activeSession.subsection || 'all');
  state.progress.moduleSessions[key] = activeSession;
  state.progress.lastSessionKey = key;
  saveState();
  renderStudy();
}

function resumeSaved(choice) {
  const saved = state.progress.moduleSessions?.[state.progress.lastSessionKey];
  if (!saved) return;
  const pool = saved.module === 'mistakes' ? filteredItems('mistakes', saved.subsection && saved.subsection !== 'all' ? saved.subsection : null) : filteredItems(saved.module, saved.subsection && saved.subsection !== 'all' ? saved.subsection : null);
  const byId = new Map(pool.map(item => [item.id, item]));
  activeItemPool = saved.itemIds.map(id => byId.get(id)).filter(Boolean);
  activeSession = resumeSession(saved, choice === 'continue' ? 'continue' : 'restart');
  if (choice === 'restart') activeSession.itemIndex = 0;
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
  const prompt = isPractice
    ? (state.settings.language === 'en' ? 'Complete the sentence with the correct form' : 'Cümledeki boşluğu doğru biçimle tamamlayın')
    : item.type === 'grammar' ? item.quiz : (state.settings.language === 'en' ? 'Choose the correct meaning' : 'Doğru anlamı seçin');
  const options = isPractice ? (item.options?.[state.settings.language] || item.options?.tr || []) : item.type === 'grammar' ? item.options : (item.options?.[state.settings.language] || item.options?.tr || []);
  const target = item.infinitive || item.title || item.target;
  const sentence = item.sentence || item.example || '';
  const title = isPractice ? item.title : item.type === 'grammar' ? grammarTitle(item) : target;
  const art = isPractice ? '' : illustrationDataUri(item);
  const artAlt = isPractice ? '' : illustrationAlt(item);
  main.innerHTML = `
    <div class="page-heading"><div><div class="eyebrow">${esc(item.level)} · ${isPractice ? 'BOŞLUK DOLDURMA' : esc(item.topic || (item.type === 'grammar' ? 'Gramer' : item.type === 'verb' ? 'Fiil' : 'Kelime'))}</div><h1>${isPractice ? 'Cümleyi tamamlayın' : esc(routeTitle(route))}</h1><p>${isPractice ? ' ' : (state.settings.language === 'en' ? 'Choose an answer, then read the explanation.' : 'Cevabı seçin, ardından açıklamayı inceleyin.')}</p></div><button class="back-button" id="exitStudy">✕</button></div>
    <div class="progress-card"><div class="progress-head"><strong>${state.settings.language === 'en' ? 'Learning session' : 'Öğrenme oturumu'}</strong><span>${index + 1} / ${currentItems.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>
    <section class="study-card">
      <div class="study-top"><span>${esc(item.level)} · ${isPractice ? 'PRACTICE' : item.type === 'grammar' ? 'GRAMMAR' : item.type === 'verb' || item.infinitive ? 'VERB' : 'VOCABULARY'}</span><span>${index + 1}/${currentItems.length}</span></div>
      ${!isPractice ? `<div class="scene scene-illustration"><img class="scene-art" src="${art}" alt="${esc(artAlt)}" loading="eager"></div>` : ''}
      <div class="study-body">
        ${!isPractice ? `<h2 dir="ltr">${esc(title)}</h2>` : ''}
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
  document.querySelector('#speakButton')?.addEventListener('click', () => speak(`${title}. ${sentence}`));
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
  const trackedItemId = item.type === 'practice' ? (item.targetItemId || item.id) : item.id;
  state.progress = recordAnswer(state.progress, trackedItemId, isCorrect, sessionId, now);
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
  state.progress.moduleSessions[sessionStorageKey(state.settings.level, activeSession.module, activeSession.subsection || 'all')] = activeSession;
  state.progress.lastSessionKey = sessionStorageKey(state.settings.level, activeSession.module, activeSession.subsection || 'all');
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
  const key = sessionStorageKey(state.settings.level, activeSession.module, activeSession.subsection || 'all');
  state.progress.moduleSessions[key] = activeSession;
  state.progress.lastSessionKey = key;
  saveState();
  const canInterstitial = shouldShowInterstitial(state.progress.lastInterstitialAt, Date.now(), state.settings.isPro);
  main.innerHTML = `<section class="panel complete-card"><div class="complete-icon">🎉</div><div class="eyebrow">${esc(state.settings.level)} · ${esc(routeTitle(activeSession.module))}</div><h2>${state.settings.language === 'en' ? 'Session completed' : 'Çalışma tamamlandı'}</h2><p>${state.settings.language === 'en' ? 'Your answers and progress have been saved on this device.' : 'Cevaplarınız ve ilerlemeniz bu cihaza kaydedildi.'}<br>${state.progress.correctAnswers} ${state.settings.language === 'en' ? 'correct answers in total.' : 'toplam doğru cevap.'}</p><button class="primary-button" id="againButton">${state.settings.language === 'en' ? 'Practise again' : 'Tekrar çalış'}</button><button class="secondary-button" style="width:100%;margin-top:9px" id="homeFromComplete">${t('home')}</button>${canInterstitial ? `<div class="source-line">Reklam gösterimi için güvenli geçiş noktası. Gerçek AdMob SDK'sı bağlandığında frekans sınırı burada uygulanır.</div>` : ''}</section>`;
  document.querySelector('#againButton').addEventListener('click', () => startModule(activeSession.module, activeSession.subsection && activeSession.subsection !== 'all' ? activeSession.subsection : null));
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
      <div class="note">A2 seçildiğinde A1 tekrarını kelime oturumuna %25 oranında ekleyebilirsiniz. Her bölüm ve alt başlık kendi ilerlemesini saklar.</div>${state.settings.level === 'A2' ? `<div class="setting-card"><strong>A1 kelime tekrarı</strong><p style="font-size:12px;color:var(--muted)">A2 kelime oturumunda yaklaşık %25 A1 kelimesi de sorulsun.</p><label><input type="checkbox" id="includeA1Review" ${state.settings.includeA1Review ? 'checked' : ''}/> A1 tekrarını %25 dahil et</label></div>` : ''}
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
  document.querySelector('#includeA1Review')?.addEventListener('change', async e => { state.settings.includeA1Review = e.target.checked; await saveState(); renderSettings(); });
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
  document.querySelector('#hideAd').addEventListener('click', () => { adSlot.classList.add('hidden'); adBannerDismissed = true; });
}

function migrateProgressBySubsection() {
  const sessions = state.progress.moduleSessions || {};
  const collections = { words: WORDS, verbs: VERBS, grammar: GRAMMAR, mixed: [...WORDS, ...VERBS], practice: PRACTICE_QUESTIONS, mistakes: [...WORDS, ...VERBS, ...GRAMMAR] };
  for (const [oldKey, saved] of Object.entries(sessions)) {
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
  state.progress = { ...defaults().progress, ...(state.progress || {}) };
  state.progress.moduleSessions ||= {};
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
