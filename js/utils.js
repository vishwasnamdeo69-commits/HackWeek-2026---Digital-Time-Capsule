/**
 * Shared utility helpers.
 */

const THEME_GRADIENTS = {
  indigo: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
  violet: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
  rose: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
  amber: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
  emerald: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
  sky: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
};

const THEME_COLORS = {
  indigo: '#4F46E5',
  violet: '#7C3AED',
  rose: '#E11D48',
  amber: '#D97706',
  emerald: '#059669',
  sky: '#0284C7',
};

/**
 * Generate a unique capsule ID.
 * @returns {string}
 */
export function generateId() {
  return `capsule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Format an ISO date string for display.
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const date = isoDate.includes('T')
    ? new Date(isoDate)
    : new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Return today's date as YYYY-MM-DD for date inputs.
 * @returns {string}
 */
export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is in the past (before today).
 * @param {string} dateString - YYYY-MM-DD
 * @returns {boolean}
 */
export function isDateInPast(dateString) {
  if (!dateString) return true;
  const input = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return input < today;
}

/**
 * Read a File as a Base64 data URL.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get theme gradient for placeholder backgrounds.
 * @param {string} theme
 * @returns {string}
 */
export function getThemeGradient(theme) {
  return THEME_GRADIENTS[theme] || THEME_GRADIENTS.indigo;
}

/**
 * Get theme accent color.
 * @param {string} theme
 * @returns {string}
 */
export function getThemeColor(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.indigo;
}

/**
 * Escape HTML to prevent XSS when rendering user content.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
