import test from 'node:test';
import assert from 'node:assert/strict';
import { levelsIncluded, isItemAvailable, recordAnswer, shouldShowMiniAd, shouldShowInterstitial, resumeSession } from '../core.js';

test('A2 and B1 unlock all earlier learning levels', () => {
  assert.deepEqual(levelsIncluded('A1'), ['A1']);
  assert.deepEqual(levelsIncluded('A2'), ['A1', 'A2']);
  assert.deepEqual(levelsIncluded('B1'), ['A1', 'A2', 'B1']);
  assert.equal(isItemAvailable({ level: 'A1' }, 'B1'), true);
  assert.equal(isItemAvailable({ level: 'B1' }, 'A2'), false);
});

test('a wrong answer enters the mistake list and resets mastery streak', () => {
  const progress = recordAnswer({}, 'word-1', false, 's1', 1000);
  assert.equal(progress.mistakes['word-1'].wrongCount, 1);
  assert.deepEqual(progress.mistakes['word-1'].correctSessions, []);
});

test('three spaced correct review sessions remove a mistake', () => {
  let progress = recordAnswer({}, 'word-1', false, 'wrong-session', 0);
  progress = recordAnswer(progress, 'word-1', true, 'review-1', 60_000);
  assert.equal(progress.mistakes['word-1'].correctSessions.length, 1);
  progress = recordAnswer(progress, 'word-1', true, 'review-too-soon', 5 * 60_000);
  assert.equal(progress.mistakes['word-1'].correctSessions.length, 1, 'second correct must wait at least 10 minutes');
  progress = recordAnswer(progress, 'word-1', true, 'review-2', 12 * 60_000);
  assert.equal(progress.mistakes['word-1'].correctSessions.length, 2);
  progress = recordAnswer(progress, 'word-1', true, 'review-too-soon-3', 20 * 60_000);
  assert.equal(progress.mistakes['word-1'].correctSessions.length, 2, 'third correct must wait at least 24 hours');
  progress = recordAnswer(progress, 'word-1', true, 'review-3', 37 * 60 * 60_000);
  assert.equal(Object.hasOwn(progress.mistakes, 'word-1'), false);
});

test('a wrong answer resets consecutive successful reviews', () => {
  let progress = recordAnswer({}, 'verb-1', false, 's0', 0);
  progress = recordAnswer(progress, 'verb-1', true, 's1', 60_000);
  progress = recordAnswer(progress, 'verb-1', false, 's2', 20 * 60_000);
  assert.equal(progress.mistakes['verb-1'].wrongCount, 2);
  assert.deepEqual(progress.mistakes['verb-1'].correctSessions, []);
});

test('the same session cannot count twice toward mastery', () => {
  let progress = recordAnswer({}, 'grammar-1', false, 's0', 0);
  progress = recordAnswer(progress, 'grammar-1', true, 's1', 60_000);
  progress = recordAnswer(progress, 'grammar-1', true, 's1', 60_000 + 1);
  assert.equal(progress.mistakes['grammar-1'].correctSessions.length, 1);
});

test('small ad is due only after every third answer and never in Pro', () => {
  assert.equal(shouldShowMiniAd(2, false), false);
  assert.equal(shouldShowMiniAd(3, false), true);
  assert.equal(shouldShowMiniAd(6, false), true);
  assert.equal(shouldShowMiniAd(3, true), false);
});

test('interstitial is capped at one per twenty minutes and suppressed for Pro', () => {
  const now = 10_000_000;
  assert.equal(shouldShowInterstitial(null, now, false), false);
  assert.equal(shouldShowInterstitial(now - 19 * 60_000, now, false), false);
  assert.equal(shouldShowInterstitial(now - 20 * 60_000, now, false), true);
  assert.equal(shouldShowInterstitial(now - 60 * 60_000, now, true), false);
});

test('resume action can continue or restart without deleting other session fields', () => {
  const saved = { module: 'words', itemIndex: 4, itemIds: ['1','2','3','4','5'], id: 'session-1' };
  assert.deepEqual(resumeSession(saved, 'continue'), saved);
  const restarted = resumeSession(saved, 'restart');
  assert.equal(restarted.itemIndex, 0);
  assert.equal(restarted.id, 'session-1');
});
