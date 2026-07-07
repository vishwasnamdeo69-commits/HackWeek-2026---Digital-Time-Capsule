/**
 * Time Engine — single timer, unlock detection, and capsule state logic.
 */

import * as storage from './storage.js';

let intervalId = null;
let onUnlockChange = null;
const tickHandlers = new Set();

/**
 * Normalize an unlock date string to a Date at start of that calendar day.
 * @param {string} unlockDate
 * @returns {Date}
 */
export function parseUnlockDate(unlockDate) {
  return new Date(
    unlockDate.includes('T') ? unlockDate : `${unlockDate}T00:00:00`
  );
}

/**
 * Check whether the unlock date has been reached.
 * @param {string} unlockDate
 * @returns {boolean}
 */
export function isUnlockDateReached(unlockDate) {
  if (!unlockDate) return false;
  return Date.now() >= parseUnlockDate(unlockDate).getTime();
}

/**
 * Auto-unlock capsules whose date has passed. Persists immediately.
 * @returns {boolean}
 */
export function syncUnlockStates() {
  const capsules = storage.getAll();
  let changed = false;

  const updated = capsules.map((capsule) => {
    if (!capsule.isUnlocked && isUnlockDateReached(capsule.unlockDate)) {
      changed = true;
      return {
        ...capsule,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }
    return capsule;
  });

  if (changed) {
    storage.saveAll(updated);
  }

  return changed;
}

/**
 * Get remaining time until unlock.
 * @param {string} unlockDate
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, totalMs: number }}
 */
export function getTimeRemaining(unlockDate) {
  const target = parseUnlockDate(unlockDate);
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    totalMs: diff,
  };
}

/**
 * Derive the UI state for a capsule.
 * @param {object} capsule
 * @returns {'locked' | 'ready' | 'opened'}
 */
export function getCapsuleState(capsule) {
  if (!capsule) return 'locked';
  if (!capsule.isUnlocked) return 'locked';
  if (!capsule.openedAt) return 'ready';
  return 'opened';
}

/**
 * Whether the user can open (or re-view) a capsule.
 * @param {object} capsule
 * @returns {boolean}
 */
export function canOpenCapsule(capsule) {
  const state = getCapsuleState(capsule);
  return state === 'ready' || state === 'opened';
}

/**
 * Calculate how long a capsule was sealed (in days).
 * @param {object} capsule
 * @returns {number}
 */
export function getSealedDurationDays(capsule) {
  const created = new Date(capsule.createdAt);
  const end = capsule.unlockedAt
    ? new Date(capsule.unlockedAt)
    : capsule.openedAt
      ? new Date(capsule.openedAt)
      : new Date();
  const diff = end.getTime() - created.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Register a handler called every engine tick (1s).
 * @param {function} handler
 * @returns {function} Unsubscribe function
 */
export function onTick(handler) {
  tickHandlers.add(handler);
  return () => tickHandlers.delete(handler);
}

function runTick(animate = true) {
  const changed = syncUnlockStates();
  tickHandlers.forEach((handler) => handler(animate));

  if (changed && onUnlockChange) {
    onUnlockChange();
  }
}

/**
 * Start the single global time engine.
 * @param {function} [onChange] - Called when any capsule auto-unlocks
 */
export function startTimeEngine(onChange) {
  stopTimeEngine();
  onUnlockChange = onChange || null;

  runTick(false);

  intervalId = setInterval(() => {
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    runTick(animate);
  }, 1000);
}

/**
 * Stop the global time engine.
 */
export function stopTimeEngine() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopTimeEngine();
  } else if (onUnlockChange !== null || tickHandlers.size > 0) {
    startTimeEngine(onUnlockChange);
  }
});
