/**
 * LocalStorage persistence layer.
 */

const STORAGE_KEY = 'digital-time-capsules';

/**
 * Validate a capsule object has required shape.
 * @param {unknown} capsule
 * @returns {boolean}
 */
function isValidCapsule(capsule) {
  if (!capsule || typeof capsule !== 'object') return false;
  const c = capsule;
  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    typeof c.description === 'string' &&
    typeof c.message === 'string' &&
    typeof c.unlockDate === 'string' &&
    typeof c.createdAt === 'string' &&
    typeof c.theme === 'string' &&
    typeof c.isUnlocked === 'boolean' &&
    (c.image === null || typeof c.image === 'string') &&
    (c.unlockedAt === undefined || c.unlockedAt === null || typeof c.unlockedAt === 'string') &&
    (c.openedAt === undefined || c.openedAt === null || typeof c.openedAt === 'string')
  );
}

/**
 * Read all capsules from LocalStorage.
 * @returns {Array}
 */
export function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed.filter(isValidCapsule);
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage may be unavailable */
    }
    return [];
  }
}

/**
 * Persist the full capsule array.
 * @param {Array} capsules
 */
export function saveAll(capsules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

/**
 * Add a new capsule.
 * @param {object} capsule
 * @returns {object}
 */
export function add(capsule) {
  const capsules = getAll();
  capsules.unshift(capsule);
  saveAll(capsules);
  return capsule;
}

/**
 * Update an existing capsule by ID.
 * @param {string} id
 * @param {object} updates
 * @returns {object|null}
 */
export function update(id, updates) {
  const capsules = getAll();
  const index = capsules.findIndex((c) => c.id === id);
  if (index === -1) return null;

  capsules[index] = { ...capsules[index], ...updates };
  saveAll(capsules);
  return capsules[index];
}

/**
 * Remove a capsule by ID.
 * @param {string} id
 * @returns {boolean}
 */
export function remove(id) {
  const capsules = getAll();
  const filtered = capsules.filter((c) => c.id !== id);
  if (filtered.length === capsules.length) return false;
  saveAll(filtered);
  return true;
}
