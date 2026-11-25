export const LEVELS = ['A1', 'A2', 'B1'];
export const MODULES = ['words', 'verbs', 'grammar', 'mistakes', 'mixed'];

export function levelsIncluded(selectedLevel) {
  const index = LEVELS.indexOf(selectedLevel);
  return index < 0 ? ['A1'] : LEVELS.slice(0, index + 1);
}

export function isItemAvailable(item, selectedLevel) {
  return levelsIncluded(selectedLevel).includes(item.level);
}

export function recordAnswer(progress, itemId, isCorrect, sessionId, timestamp = Date.now()) {
  const next = structuredClone(progress ?? { mistakes: {}, completed: {}, sessions: {} });
  next.mistakes ??= {};
  next.completed ??= {};
  next.sessions ??= {};
  next.sessions[sessionId] ??= { startedAt: timestamp, answered: [] };
  const session = next.sessions[sessionId];
  if (!session.answered.includes(itemId)) session.answered.push(itemId);

  if (isCorrect) {
    const record = next.mistakes[itemId];
    if (record && !record.correctSessions.some(entry => entry.sessionId === sessionId)) {
      const previous = record.correctSessions.at(-1);
      const minimumGap = record.correctSessions.length === 0 ? 0 : record.correctSessions.length === 1 ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const spacedEnough = !previous || timestamp - previous.at >= minimumGap;
      if (spacedEnough) record.correctSessions.push({ sessionId, at: timestamp });
      record.lastReviewedAt = timestamp;
      if (record.correctSessions.length >= 3) {
        record.resolvedAt = timestamp;
        delete next.mistakes[itemId];
      } else {
        next.mistakes[itemId] = record;
      }
    }
    next.completed[itemId] = { lastCorrectAt: timestamp, sessionId };
  } else {
    const record = next.mistakes[itemId] ?? { itemId, wrongCount: 0, correctSessions: [], firstWrongAt: timestamp, lastReviewedAt: null };
    record.correctSessions ??= [];
    record.wrongCount += 1;
    record.lastWrongAt = timestamp;
    record.correctSessions = [];
    next.mistakes[itemId] = record;
    delete next.completed[itemId];
  }
  return next;
}

export function shouldShowMiniAd(answerCount, isPro = false) {
  return !isPro && answerCount > 0 && answerCount % 3 === 0;
}

export function shouldShowInterstitial(lastShownAt, now = Date.now(), isPro = false) {
  if (isPro || lastShownAt == null) return false;
  return now - lastShownAt >= 20 * 60 * 1000;
}

export function chooseResumeAction(savedSession) {
  return savedSession?.itemIndex > 0 ? 'offer-choice' : 'start';
}

export function resumeSession(savedSession, choice) {
  if (choice === 'continue') return { ...savedSession };
  return { ...savedSession, itemIndex: 0, restartedAt: Date.now() };
}

export function createSession(module, level, items, now = Date.now()) {
  return {
    id: `s-${now}-${Math.random().toString(36).slice(2, 8)}`,
    module,
    level,
    itemIds: items.map(item => item.id),
    itemIndex: 0,
    startedAt: now,
    completedAt: null,
  };
}

export function reviewDelaySatisfied(record, now = Date.now()) {
  const correctCount = record?.correctSessions?.length ?? 0;
  if (correctCount === 0) return true;
  const previous = record.correctSessions[correctCount - 1];
  const minGap = correctCount === 1 ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return now - previous.at >= minGap;
}

/** Mixes a small A1 review slice into an A2 vocabulary session (25% of total). */
export function mixA1Review(a1Items, targetItems, enabled = true) {
  if (!enabled || !targetItems.length) return [...targetItems];
  const reviewCount = Math.min(a1Items.length, Math.ceil(targetItems.length / 3));
  const reviewItems = [...a1Items].sort((a, b) => Number(Boolean(a.completed)) - Number(Boolean(b.completed))).slice(0, reviewCount);
  return [...targetItems, ...reviewItems];
}

/** Stable per-level, per-module, per-subsection progress key. */
export function sessionStorageKey(level, module, subsection = 'all') {
  return `${level}:${module}:${subsection || 'all'}`;
}

/** Stable mistake archive bucket for independent module/topic review. */
export function mistakeArchiveKey(module, subsection = 'all') {
  return `${module}::${subsection || 'all'}`;
}
