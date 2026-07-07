/**
 * UI rendering for capsule cards and empty state.
 */

import { formatDate, escapeHtml, getThemeGradient, getThemeColor } from './utils.js';

const LOCK_ICON = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
  <rect x="2" y="5" width="8" height="6" rx="1.5" stroke="currentColor" stroke-width="1.25"/>
  <path d="M4 5V3.5C4 2.67 4.67 2 5.5 2h1C7.33 2 8 2.67 8 3.5V5" stroke="currentColor" stroke-width="1.25"/>
</svg>`;

const CALENDAR_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
  <rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="currentColor" stroke-width="1.25"/>
  <path d="M1.5 6h11M4.5 1v2M9.5 1v2" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
</svg>`;

const IMAGE_PLACEHOLDER_ICON = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <rect x="4" y="8" width="24" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.4"/>
  <path d="M4 22l6-6 4 4 6-8 8 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/**
 * Build HTML for a single capsule card.
 * @param {object} capsule
 * @returns {string}
 */
function buildCardHTML(capsule) {
  const themeColor = getThemeColor(capsule.theme);
  const themeGradient = getThemeGradient(capsule.theme);

  const imageContent = capsule.image
    ? `<img src="${capsule.image}" alt="" class="capsule-card__image" loading="lazy">`
    : `<div class="capsule-card__image-placeholder" style="background:${themeGradient};color:${themeColor}" aria-hidden="true">${IMAGE_PLACEHOLDER_ICON}</div>`;

  const editButton = !capsule.isUnlocked
    ? `<button type="button" class="btn btn--ghost btn--icon capsule-card__edit" data-action="edit" data-id="${capsule.id}" aria-label="Edit ${escapeHtml(capsule.title)}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </button>`
    : '';

  return `
    <article
      class="capsule-card"
      role="listitem"
      data-id="${capsule.id}"
      style="--card-theme: ${themeColor}"
      aria-label="Time capsule: ${escapeHtml(capsule.title)}"
    >
      <div class="capsule-card__theme-accent" aria-hidden="true"></div>
      <div class="capsule-card__image-wrap">
        ${imageContent}
        <span class="badge badge--locked">
          ${LOCK_ICON}
          Locked
        </span>
      </div>
      <div class="capsule-card__body">
        <div class="capsule-card__header-row">
          <h3 class="capsule-card__title">${escapeHtml(capsule.title)}</h3>
          <div class="capsule-card__actions">
            ${editButton}
            <button type="button" class="btn btn--ghost btn--icon capsule-card__delete" data-action="delete" data-id="${capsule.id}" aria-label="Delete ${escapeHtml(capsule.title)}">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 4h10M6 4V3h4v1M5 4v8.5h6V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <p class="capsule-card__description">${escapeHtml(capsule.description)}</p>
        <div class="capsule-card__meta-group">
          <p class="capsule-card__meta">
            ${CALENDAR_ICON}
            Unlocks ${formatDate(capsule.unlockDate)}
          </p>
          <p class="capsule-card__meta capsule-card__meta--created">
            Created ${formatDate(capsule.createdAt)}
          </p>
        </div>
        <button type="button" class="btn btn--secondary btn--full capsule-card__action" disabled aria-disabled="true">
          Open Capsule
        </button>
      </div>
    </article>
  `;
}

/**
 * Toggle between grid and empty state.
 * @param {boolean} hasCapsules
 * @param {HTMLElement} gridEl
 * @param {HTMLElement} emptyStateEl
 */
export function toggleEmptyState(hasCapsules, gridEl, emptyStateEl) {
  if (hasCapsules) {
    gridEl.classList.remove('capsules__grid--hidden');
    gridEl.setAttribute('aria-hidden', 'false');
    emptyStateEl.classList.remove('empty-state--visible');
    emptyStateEl.setAttribute('aria-hidden', 'true');
  } else {
    gridEl.classList.add('capsules__grid--hidden');
    gridEl.setAttribute('aria-hidden', 'true');
    emptyStateEl.classList.add('empty-state--visible');
    emptyStateEl.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Render all capsule cards into the grid.
 * @param {Array} capsules
 * @param {HTMLElement} gridEl
 * @param {HTMLElement} emptyStateEl
 */
export function renderCapsules(capsules, gridEl, emptyStateEl) {
  toggleEmptyState(capsules.length > 0, gridEl, emptyStateEl);

  if (capsules.length === 0) {
    gridEl.innerHTML = '';
    return;
  }

  gridEl.innerHTML = capsules.map(buildCardHTML).join('');
}

/**
 * Animate and remove a card element.
 * @param {HTMLElement} cardEl
 * @returns {Promise<void>}
 */
export function animateCardRemoval(cardEl) {
  return new Promise((resolve) => {
    cardEl.classList.add('capsule-card--removing');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      resolve();
      return;
    }

    cardEl.addEventListener('transitionend', () => resolve(), { once: true });
    setTimeout(resolve, 400);
  });
}
