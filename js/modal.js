/**
 * Modal Controller
 * Phase 1: Open/close only — no form handling.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Initialize the create-capsule modal.
 * @param {string} modalId - The modal overlay element ID.
 */
export function initModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;

  const modal = overlay.querySelector('.modal');
  let previouslyFocused = null;

  const openTriggers = document.querySelectorAll('[data-modal-open]');
  const closeTriggers = overlay.querySelectorAll('[data-modal-close]');

  function getFocusableElements() {
    return modal.querySelectorAll(FOCUSABLE_SELECTOR);
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') return;

    const focusable = Array.from(getFocusableElements());
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

  function openModal() {
    previouslyFocused = document.activeElement;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    });

    document.addEventListener('keydown', handleKeydown);
  }

  function closeModal() {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    const finishClose = () => {
      overlay.hidden = true;
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      finishClose();
    } else {
      overlay.addEventListener('transitionend', finishClose, { once: true });
    }

    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }

    document.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    trapFocus(event);
  }

  function handleOverlayClick(event) {
    if (event.target === overlay) {
      closeModal();
    }
  }

  openTriggers.forEach((trigger) => {
    trigger.addEventListener('click', openModal);
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', closeModal);
  });

  overlay.addEventListener('click', handleOverlayClick);
}
