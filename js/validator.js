/**
 * Form validation for capsule create/edit.
 */

import { isDateInPast } from './utils.js';

/**
 * Validate capsule form data.
 * @param {object} data
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} data.message
 * @param {string} data.unlockDate
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateCapsuleForm(data) {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!data.description || !data.description.trim()) {
    errors.description = 'Description is required.';
  }

  if (!data.message || !data.message.trim()) {
    errors.message = 'Message is required.';
  }

  if (!data.unlockDate) {
    errors.unlockDate = 'Unlock date is required.';
  } else if (isDateInPast(data.unlockDate)) {
    errors.unlockDate = 'Unlock date cannot be in the past.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
