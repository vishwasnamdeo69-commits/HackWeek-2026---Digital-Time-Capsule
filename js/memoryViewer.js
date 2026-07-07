/**
 * Fullscreen memory viewer with timeline and celebration.
 */

import { formatDate, escapeHtml, getThemeGradient, getThemeColor } from './utils.js';
import { getSealedDurationDays } from './timeEngine.js';
import { downloadShareCard } from './shareCard.js';
import { isSoundEnabled, setSoundEnabled } from './unlockSound.js';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

let viewerEl = null;
let previouslyFocused = null;
let currentCapsule = null;
let isFirstOpen = false;
let keydownBound = false;

/**
 * Initialize the memory viewer module.
 */
export function initMemoryViewer() {
  viewerEl = document.getElementById('memory-viewer');
  if (!viewerEl) return;

  const closeBtn = viewerEl.querySelector('[data-viewer-close]');
  const shareBtn = viewerEl.querySelector('[data-viewer-share]');
  const soundBtn = viewerEl.querySelector('[data-viewer-sound]');

  closeBtn?.addEventListener('click', close);
  viewerEl.addEventListener('click', (e) => {
    if (e.target === viewerEl.querySelector('.memory-viewer__backdrop')) close();
  });
  shareBtn?.addEventListener('click', handleShare);
  soundBtn?.addEventListener('click', toggleSound);

  updateSoundButton();
}

/**
 * Open the fullscreen memory viewer.
 * @param {object} capsule
 * @param {object} [options]
 * @param {boolean} [options.celebrate=false]
 */
export function openMemoryViewer(capsule, options = {}) {
  if (!viewerEl || !capsule) return;

  currentCapsule = capsule;
  isFirstOpen = options.celebrate === true;
  previouslyFocused = document.activeElement;

  populateContent(capsule);

  viewerEl.hidden = false;
  viewerEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (!keydownBound) {
    document.addEventListener('keydown', handleKeydown);
    keydownBound = true;
  }

  requestAnimationFrame(() => {
    viewerEl.classList.add('memory-viewer--visible');

    if (isFirstOpen) {
      triggerCelebration();
    }

    viewerEl.querySelector('[data-viewer-close]')?.focus();
  });
}

function close() {
  if (!viewerEl) return;

  viewerEl.classList.remove('memory-viewer--visible');
  viewerEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finish = () => {
    viewerEl.hidden = true;
    currentCapsule = null;
    isFirstOpen = false;
    clearCelebration();
  };

  if (prefersReducedMotion) {
    finish();
  } else {
    viewerEl.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 500);
  }

  previouslyFocused?.focus?.();
}

function populateContent(capsule) {
  const themeColor = getThemeColor(capsule.theme);
  const themeGradient = getThemeGradient(capsule.theme);
  const sealedDays = getSealedDurationDays(capsule);

  viewerEl.style.setProperty('--viewer-theme', themeColor);

  const heroEl = viewerEl.querySelector('[data-viewer-hero]');
  const titleEl = viewerEl.querySelector('[data-viewer-title]');
  const descEl = viewerEl.querySelector('[data-viewer-description]');
  const messageEl = viewerEl.querySelector('[data-viewer-message]');
  const eyebrowEl = viewerEl.querySelector('[data-viewer-eyebrow]');
  const createdEl = viewerEl.querySelector('[data-viewer-created]');
  const unlockedEl = viewerEl.querySelector('[data-viewer-unlocked]');

  if (capsule.image) {
    heroEl.innerHTML = `
      <img src="${capsule.image}" alt="" class="memory-viewer__image">
      <div class="memory-viewer__hero-gradient" aria-hidden="true"></div>
    `;
  } else {
    heroEl.innerHTML = `
      <div class="memory-viewer__image-placeholder" style="background:${themeGradient};color:${themeColor}" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="4" y="8" width="24" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.4"/>
          <path d="M4 22l6-6 4 4 6-8 8 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="memory-viewer__hero-gradient" aria-hidden="true"></div>
    `;
  }

  eyebrowEl.textContent = isFirstOpen ? 'Memory Unlocked' : 'Your Memory';
  titleEl.textContent = capsule.title;
  descEl.textContent = capsule.description;
  messageEl.textContent = capsule.message;
  createdEl.textContent = formatDate(capsule.createdAt);
  unlockedEl.textContent = formatDate(capsule.unlockedAt || capsule.unlockDate);

  viewerEl.querySelector('[data-viewer-timeline]').innerHTML = buildTimelineHTML(capsule, sealedDays);
}

function buildTimelineHTML(capsule, sealedDays) {
  const events = [
    {
      label: 'Created',
      date: formatDate(capsule.createdAt),
      detail: 'You sealed this memory',
      active: false,
    },
    {
      label: 'Waiting',
      date: formatDate(capsule.createdAt),
      detail: `Protected for ${sealedDays} day${sealedDays === 1 ? '' : 's'}`,
      active: false,
    },
    {
      label: 'Unlocked',
      date: formatDate(capsule.unlockedAt || capsule.unlockDate),
      detail: 'The moment finally arrived',
      active: !capsule.openedAt,
    },
    {
      label: 'Opened',
      date: capsule.openedAt ? formatDate(capsule.openedAt) : 'Now',
      detail: 'You relived this moment',
      active: !!capsule.openedAt,
    },
  ];

  return events.map((event) => `
    <li class="memory-timeline__item${event.active ? ' memory-timeline__item--active' : ''}">
      <div class="memory-timeline__marker" aria-hidden="true">
        <span class="memory-timeline__dot"></span>
      </div>
      <div class="memory-timeline__content">
        <p class="memory-timeline__label">${escapeHtml(event.label)}</p>
        <p class="memory-timeline__date">${escapeHtml(event.date)}</p>
        <p class="memory-timeline__detail">${escapeHtml(event.detail)}</p>
      </div>
    </li>
  `).join('');
}

function triggerCelebration() {
  const celebrationEl = viewerEl.querySelector('[data-viewer-celebration]');
  if (!celebrationEl) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  celebrationEl.classList.add('memory-viewer__celebration--active');

  if (!prefersReducedMotion) {
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('span');
      particle.className = 'celebration-particle';
      particle.style.setProperty('--x', `${10 + Math.random() * 80}%`);
      particle.style.setProperty('--delay', `${Math.random() * 0.4}s`);
      particle.style.setProperty('--hue', `${220 + Math.random() * 40}`);
      celebrationEl.appendChild(particle);
    }
  }

  const announceEl = viewerEl.querySelector('[data-viewer-announce]');
  if (announceEl) {
    announceEl.textContent = `${currentCapsule.title} has been opened.`;
  }
}

function clearCelebration() {
  const celebrationEl = viewerEl?.querySelector('[data-viewer-celebration]');
  if (!celebrationEl) return;
  celebrationEl.classList.remove('memory-viewer__celebration--active');
  celebrationEl.innerHTML = '';
}

function toggleSound() {
  setSoundEnabled(!isSoundEnabled());
  updateSoundButton();
}

function updateSoundButton() {
  const soundBtn = viewerEl?.querySelector('[data-viewer-sound]');
  if (!soundBtn) return;

  const enabled = isSoundEnabled();
  soundBtn.setAttribute('aria-pressed', String(enabled));
  soundBtn.setAttribute('aria-label', enabled ? 'Disable unlock sound' : 'Enable unlock sound');
  soundBtn.classList.toggle('memory-viewer__sound--on', enabled);
}

async function handleShare() {
  if (!currentCapsule) return;
  const shareBtn = viewerEl.querySelector('[data-viewer-share]');
  if (shareBtn) {
    shareBtn.disabled = true;
    shareBtn.textContent = 'Generating…';
  }

  await downloadShareCard(currentCapsule);

  if (shareBtn) {
    shareBtn.disabled = false;
    shareBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg> Download Share Card`;
  }
}

function handleKeydown(event) {
  if (!viewerEl || viewerEl.hidden) return;

  if (event.key === 'Escape') {
    close();
    return;
  }

  if (event.key === 'Tab') {
    trapFocus(event);
  }
}

function trapFocus(event) {
  const focusable = Array.from(viewerEl.querySelectorAll(FOCUSABLE_SELECTOR));
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
