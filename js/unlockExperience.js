/**
 * Orchestrates the premium opening sequence and memory reveal.
 */

import * as capsuleManager from './capsuleManager.js';
import { getCapsuleState } from './timeEngine.js';
import { openMemoryViewer } from './memoryViewer.js';
import { playUnlockClick } from './unlockSound.js';

/**
 * Play opening sequence then reveal the memory viewer.
 * @param {string} id
 * @param {HTMLElement} [cardEl]
 * @returns {Promise<boolean>}
 */
export async function playUnlockExperience(id, cardEl) {
  const capsule = capsuleManager.getCapsule(id);
  if (!capsule) return false;

  const state = getCapsuleState(capsule);
  if (state === 'locked') return false;

  const isFirstOpen = state === 'ready';

  if (isFirstOpen) {
    await playOpenSequence(cardEl, capsule);
    playUnlockClick();
    capsuleManager.openCapsule(id);
  }

  const updated = capsuleManager.getCapsule(id);
  openMemoryViewer(updated, { celebrate: isFirstOpen });
  return true;
}

/**
 * Re-view an already opened capsule.
 * @param {string} id
 * @returns {boolean}
 */
export function viewOpenedCapsule(id) {
  const capsule = capsuleManager.getCapsule(id);
  if (!capsule || getCapsuleState(capsule) !== 'opened') return false;

  openMemoryViewer(capsule, { celebrate: false });
  return true;
}

function playOpenSequence(cardEl, capsule) {
  return new Promise((resolve) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardEl) {
      resolve();
      return;
    }

    const rect = cardEl.getBoundingClientRect();
    const sequence = document.createElement('div');
    sequence.className = 'open-sequence';
    sequence.setAttribute('role', 'presentation');
    sequence.innerHTML = `
      <div class="open-sequence__blur" aria-hidden="true"></div>
      <div class="open-sequence__stage" aria-hidden="true">
        <div class="open-sequence__card" style="
          --origin-top: ${rect.top}px;
          --origin-left: ${rect.left}px;
          --origin-width: ${rect.width}px;
          --origin-height: ${rect.height}px;
        ">
          <div class="open-sequence__card-inner">
            <div class="open-sequence__lock">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="12" y="22" width="24" height="18" rx="4" stroke="currentColor" stroke-width="2"/>
                <path d="M18 22v-6a6 6 0 0112 0v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="open-sequence__sweep" aria-hidden="true"></div>
            <p class="open-sequence__title">${escapeText(capsule.title)}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(sequence);
    document.body.style.overflow = 'hidden';
    cardEl.style.visibility = 'hidden';

    requestAnimationFrame(() => {
      sequence.classList.add('open-sequence--active');
    });

    const duration = 2400;
    setTimeout(() => {
      sequence.classList.add('open-sequence--complete');
      cardEl.style.visibility = '';

      setTimeout(() => {
        sequence.remove();
        resolve();
      }, 500);
    }, duration);
  });
}

function escapeText(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
