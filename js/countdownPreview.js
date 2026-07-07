/**
 * Real countdown for locked capsule cards.
 * Uses the single global time engine — no duplicate timer.
 */

import * as capsuleManager from './capsuleManager.js';
import { getTimeRemaining, getCapsuleState, onTick } from './timeEngine.js';

let activeGrid = null;
let unsubscribe = null;

function pad(value) {
  return String(value).padStart(2, '0');
}

function buildCountdownHTML() {
  return `
    <div class="capsule-card__countdown" data-countdown aria-live="polite" aria-label="Time until unlock">
      <div class="countdown-unit">
        <span class="countdown-unit__value" data-unit="days">0</span>
        <span class="countdown-unit__label">Days</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-unit__value" data-unit="hours">00</span>
        <span class="countdown-unit__label">Hours</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-unit__value" data-unit="minutes">00</span>
        <span class="countdown-unit__label">Minutes</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-unit__value" data-unit="seconds">00</span>
        <span class="countdown-unit__label">Seconds</span>
      </div>
    </div>
  `;
}

function buildReadyLabelHTML() {
  return `<div class="capsule-card__ready-label" data-ready-label aria-live="polite">Ready To Open</div>`;
}

function updateValue(el, nextValue, animate) {
  const formatted = el.dataset.unit === 'days' ? String(nextValue) : pad(nextValue);
  if (el.textContent === formatted) return;

  el.textContent = formatted;
  if (animate) {
    el.classList.remove('countdown-unit__value--tick');
    void el.offsetWidth;
    el.classList.add('countdown-unit__value--tick');
  }
}

function replaceCountdownWithReady(card) {
  const countdown = card.querySelector('[data-countdown]');
  if (!countdown || card.querySelector('[data-ready-label]')) return;

  countdown.outerHTML = buildReadyLabelHTML();
  card.classList.add('capsule-card--pulse-once');
}

function updateCardCountdown(card, animate) {
  const id = card.dataset.id;
  if (!id) return false;

  const capsule = capsuleManager.getCapsule(id);
  if (!capsule) return false;

  if (getCapsuleState(capsule) !== 'locked') {
    replaceCountdownWithReady(card);
    return false;
  }

  const remaining = getTimeRemaining(capsule.unlockDate);
  const countdown = card.querySelector('[data-countdown]');
  if (!countdown) return remaining.totalMs <= 0;

  updateValue(countdown.querySelector('[data-unit="days"]'), remaining.days, animate);
  updateValue(countdown.querySelector('[data-unit="hours"]'), remaining.hours, animate);
  updateValue(countdown.querySelector('[data-unit="minutes"]'), remaining.minutes, animate);
  updateValue(countdown.querySelector('[data-unit="seconds"]'), remaining.seconds, animate);

  if (remaining.totalMs <= 0) {
    replaceCountdownWithReady(card);
    return true;
  }

  return false;
}

function tickCountdowns(animate = true) {
  if (!activeGrid) return;

  activeGrid.querySelectorAll('.capsule-card[data-state="locked"]').forEach((card) => {
    updateCardCountdown(card, animate);
  });
}

/**
 * Inject countdown UI and subscribe to the global time engine.
 * @param {HTMLElement} gridEl
 */
export function syncCountdownPreviews(gridEl) {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  activeGrid = gridEl;

  gridEl.querySelectorAll('.capsule-card[data-id]').forEach((card) => {
    if (card.dataset.state !== 'locked') return;
    if (card.querySelector('[data-countdown]') || card.querySelector('[data-ready-label]')) return;

    const actionBtn = card.querySelector('.capsule-card__action');
    if (!actionBtn) return;

    actionBtn.insertAdjacentHTML('beforebegin', buildCountdownHTML());
    updateCardCountdown(card, false);
  });

  unsubscribe = onTick(tickCountdowns);
}

/**
 * Detach countdown from the time engine.
 */
export function detachCountdownPreviews() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  activeGrid = null;
}
