/**
 * Scroll-triggered section animations via IntersectionObserver.
 * Visual layer only — no business logic.
 */

const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '0px 0px -8% 0px',
  threshold: 0.12,
};

/**
 * Initialize scroll animations for marked sections.
 */
export function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-animate]');

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.animateDelay;
        if (delay) {
          entry.target.style.transitionDelay = `${delay}ms`;
        }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, OBSERVER_OPTIONS);

  targets.forEach((el) => observer.observe(el));
}
