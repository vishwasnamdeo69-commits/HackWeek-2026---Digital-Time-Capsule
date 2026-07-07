/**
 * Modal Controller
 * Handles open/close, focus trap, and keyboard accessibility.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Initialize a modal overlay.
 * @param {string} modalId
 * @param {object} [options]
 * @param {boolean} [options.bindOpenTriggers=false] - Bind [data-modal-open] globally
 * @param {function} [options.onOpen]
 * @param {function} [options.onClose]
 * @returns {{ open: function, close: function, overlay: HTMLElement }}
 */
export function initModal(modalId, options = {}) {
  const { bindOpenTriggers = false, onOpen, onClose } = options;
  const overlay = document.getElementById(modalId);
  if (!overlay) return { open: () => {}, close: () => {}, overlay: null };

  const modal = overlay.querySelector('.modal');
  let previouslyFocused = null;

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

  function open() {
    previouslyFocused = document.activeElement;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (onOpen) onOpen();

    requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    });

    document.addEventListener('keydown', handleKeydown);
  }

  function close() {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    const finishClose = () => {
      overlay.hidden = true;
      if (onClose) onClose();
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
      close();
      return;
    }
    trapFocus(event);
  }

  function handleOverlayClick(event) {
    if (event.target === overlay) {
      close();
    }
  }

  if (bindOpenTriggers) {
    document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
      trigger.addEventListener('click', open);
    });
  }

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', close);
  });

  overlay.addEventListener('click', handleOverlayClick);

  return { open, close, overlay };
}
