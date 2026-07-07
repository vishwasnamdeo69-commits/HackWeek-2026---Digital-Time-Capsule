/**
 * Capsule business logic — create, read, update, delete.
 */

import * as storage from './storage.js';
import { generateId } from './utils.js';

/**
 * Load all capsules from storage.
 * @returns {Array}
 */
export function loadCapsules() {
  return storage.getAll();
}

/**
 * Create a new capsule.
 * @param {object} data
 * @returns {object}
 */
export function createCapsule(data) {
  const capsule = {
    id: generateId(),
    title: data.title.trim(),
    description: data.description.trim(),
    message: data.message.trim(),
    image: data.image || null,
    unlockDate: data.unlockDate,
    createdAt: new Date().toISOString(),
    theme: data.theme || 'indigo',
    isUnlocked: false,
  };

  return storage.add(capsule);
}

/**
 * Update an existing capsule (only while locked).
 * @param {string} id
 * @param {object} data
 * @returns {object|null}
 */
export function editCapsule(id, data) {
  const existing = storage.getAll().find((c) => c.id === id);
  if (!existing) return null;
  if (existing.isUnlocked) return null;

  return storage.update(id, {
    title: data.title.trim(),
    description: data.description.trim(),
    message: data.message.trim(),
    image: data.image !== undefined ? data.image : existing.image,
    unlockDate: data.unlockDate,
    theme: data.theme || existing.theme,
  });
}

/**
 * Delete a capsule by ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteCapsule(id) {
  return storage.remove(id);
}

/**
 * Get a single capsule by ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getCapsule(id) {
  return storage.getAll().find((c) => c.id === id);
}
