/**
 * Visual-only live countdown for capsule cards.
 * Does not affect unlock logic or storage.
 */

import * as capsuleManager from './capsuleManager.js';

let intervalId = null;
let activeGrid = null;

function pad(value) {
  return String(value).padStart(2, '0');
}

function getTimeRemaining(unlockDate) {
  const target = new Date(
    unlockDate.includes('T') ? unlockDate : `${unlockDate}T23:59:59`
  );
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
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

function updateCardCountdown(card, animate) {
  const id = card.dataset.id;
  if (!id) return;

  const capsule = capsuleManager.getCapsule(id);
  if (!capsule) return;

  const remaining = getTimeRemaining(capsule.unlockDate);
  const countdown = card.querySelector('[data-countdown]');
  if (!countdown) return;

  updateValue(countdown.querySelector('[data-unit="days"]'), remaining.days, animate);
  updateValue(countdown.querySelector('[data-unit="hours"]'), remaining.hours, animate);
  updateValue(countdown.querySelector('[data-unit="minutes"]'), remaining.minutes, animate);
  updateValue(countdown.querySelector('[data-unit="seconds"]'), remaining.seconds, animate);
}

function tickAll(animate = true) {
  if (!activeGrid) return;
  activeGrid.querySelectorAll('.capsule-card[data-id]').forEach((card) => {
    updateCardCountdown(card, animate);
  });
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function startInterval() {
  stopInterval();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  intervalId = setInterval(() => tickAll(!prefersReducedMotion), 1000);
}

/**
 * Inject countdown UI and start live updates after cards render.
 * @param {HTMLElement} gridEl
 */
export function syncCountdownPreviews(gridEl) {
  activeGrid = gridEl;
  stopInterval();

  gridEl.querySelectorAll('.capsule-card[data-id]').forEach((card) => {
    if (card.querySelector('[data-countdown]')) return;

    const actionBtn = card.querySelector('.capsule-card__action');
    if (!actionBtn) return;

    actionBtn.insertAdjacentHTML('beforebegin', buildCountdownHTML());
    updateCardCountdown(card, false);
  });

  if (gridEl.querySelectorAll('.capsule-card[data-id]').length > 0) {
    startInterval();
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopInterval();
  } else if (activeGrid?.querySelector('.capsule-card[data-id]')) {
    tickAll(false);
    startInterval();
  }
});
