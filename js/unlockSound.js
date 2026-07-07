/**
 * Optional unlock click sound — muted by default, no autoplay.
 */

const STORAGE_KEY = 'dtc-sound-enabled';

let audioContext = null;

/**
 * @returns {boolean}
 */
export function isSoundEnabled() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Play a tiny unlock click. Only fires when user has enabled sound.
 */
export function playUnlockClick() {
  if (!isSoundEnabled()) return;

  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    const ctx = audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    /* audio unavailable */
  }
}
