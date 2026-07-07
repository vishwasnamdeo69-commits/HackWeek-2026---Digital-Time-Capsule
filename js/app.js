/**
 * Application orchestrator — wires modules together.
 */

import { initModal } from './modal.js';
import * as capsuleManager from './capsuleManager.js';
import { renderCapsules, animateCardRemoval } from './renderer.js';
import { validateCapsuleForm } from './validator.js';
import { getTodayDateString, readFileAsBase64 } from './utils.js';
import { syncCountdownPreviews } from './countdownPreview.js';
import { initScrollAnimations } from './scrollAnimations.js';

const form = document.getElementById('capsule-form');
const gridEl = document.getElementById('capsules-grid');
const emptyStateEl = document.getElementById('empty-state');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const submitBtn = document.getElementById('form-submit-btn');
const deleteCapsuleName = document.getElementById('delete-capsule-name');

const titleInput = document.getElementById('capsule-title');
const descriptionInput = document.getElementById('capsule-description');
const messageInput = document.getElementById('capsule-message');
const unlockDateInput = document.getElementById('capsule-unlock-date');
const imageInput = document.getElementById('capsule-cover-image');

let createModal = null;
let deleteModal = null;
let editingId = null;
let pendingImage = null;
let pendingDeleteId = null;

function showFieldError(field, message) {
  const errorEl = document.getElementById(`error-${field}`);
  const inputEl = document.getElementById(
    field === 'image' ? 'capsule-cover-image' : `capsule-${field === 'unlockDate' ? 'unlock-date' : field}`
  );

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('form-error--visible');
  }
  if (inputEl) {
    inputEl.classList.add('form-input--error');
    inputEl.setAttribute('aria-invalid', 'true');
  }
}

function clearFieldError(field) {
  const errorEl = document.getElementById(`error-${field}`);
  const inputEl = document.getElementById(
    field === 'image' ? 'capsule-cover-image' : `capsule-${field === 'unlockDate' ? 'unlock-date' : field}`
  );

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('form-error--visible');
  }
  if (inputEl) {
    inputEl.classList.remove('form-input--error');
    inputEl.removeAttribute('aria-invalid');
  }
}

function clearValidationErrors() {
  ['title', 'description', 'message', 'unlockDate', 'image'].forEach(clearFieldError);
}

function showValidationErrors(errors) {
  clearValidationErrors();
  Object.entries(errors).forEach(([field, message]) => {
    showFieldError(field, message);
  });
}

function resetImagePreview() {
  const preview = document.getElementById('image-preview');
  const previewImg = document.getElementById('image-preview-img');
  const label = document.querySelector('.form-file__label');

  previewImg.removeAttribute('src');
  preview.classList.remove('form-file-preview--visible');
  label.classList.remove('form-file__label--hidden');
  imageInput.value = '';
}

function updateImagePreview(capsule) {
  const preview = document.getElementById('image-preview');
  const previewImg = document.getElementById('image-preview-img');
  const label = document.querySelector('.form-file__label');

  if (capsule.image) {
    previewImg.src = capsule.image;
    previewImg.alt = 'Cover image preview';
    preview.classList.add('form-file-preview--visible');
    label.classList.add('form-file__label--hidden');
  } else {
    resetImagePreview();
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  pendingImage = null;

  modalTitle.textContent = 'Create Time Capsule';
  modalSubtitle.textContent = 'Seal a memory for your future self.';
  submitBtn.textContent = 'Create Capsule';

  const indigoRadio = form.querySelector('input[name="theme-color"][value="indigo"]');
  if (indigoRadio) indigoRadio.checked = true;

  unlockDateInput.min = getTodayDateString();
  resetImagePreview();
  clearValidationErrors();
}

function openCreateModal() {
  resetForm();
  createModal.open();
}

function openEditModal(id) {
  const capsule = capsuleManager.getCapsule(id);
  if (!capsule || capsule.isUnlocked) return;

  editingId = id;
  pendingImage = capsule.image;

  modalTitle.textContent = 'Edit Time Capsule';
  modalSubtitle.textContent = 'Update your memory before it unlocks.';
  submitBtn.textContent = 'Save Changes';

  titleInput.value = capsule.title;
  descriptionInput.value = capsule.description;
  messageInput.value = capsule.message;
  unlockDateInput.value = capsule.unlockDate.slice(0, 10);
  unlockDateInput.min = getTodayDateString();

  const themeRadio = form.querySelector(`input[name="theme-color"][value="${capsule.theme}"]`);
  if (themeRadio) themeRadio.checked = true;

  updateImagePreview(capsule);
  clearValidationErrors();
  createModal.open();
}

function refreshUI() {
  const capsules = capsuleManager.loadCapsules();
  renderCapsules(capsules, gridEl, emptyStateEl);
  syncCountdownPreviews(gridEl);
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = {
    title: titleInput.value,
    description: descriptionInput.value,
    message: messageInput.value,
    unlockDate: unlockDateInput.value,
  };

  const { isValid, errors } = validateCapsuleForm(formData);
  showValidationErrors(errors);
  if (!isValid) return;

  const theme = form.querySelector('input[name="theme-color"]:checked')?.value || 'indigo';

  const capsuleData = {
    ...formData,
    theme,
    image: pendingImage,
  };

  if (editingId) {
    capsuleManager.editCapsule(editingId, capsuleData);
  } else {
    capsuleManager.createCapsule(capsuleData);
  }

  createModal.close();
  resetForm();
  refreshUI();
}

async function handleImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showFieldError('image', 'Please select a valid image file.');
    imageInput.value = '';
    return;
  }

  clearFieldError('image');

  try {
    pendingImage = await readFileAsBase64(file);
    updateImagePreview({ image: pendingImage });
  } catch {
    showFieldError('image', 'Failed to load image. Please try again.');
    imageInput.value = '';
  }
}

function handleGridClick(event) {
  const actionBtn = event.target.closest('[data-action]');
  if (!actionBtn) return;

  const { action, id } = actionBtn.dataset;
  if (!id) return;

  if (action === 'edit') {
    openEditModal(id);
  } else if (action === 'delete') {
    pendingDeleteId = id;
    const capsule = capsuleManager.getCapsule(id);
    if (capsule) {
      deleteCapsuleName.textContent = capsule.title;
    }
    deleteModal.open();
  }
}

async function handleDeleteConfirm() {
  if (!pendingDeleteId) return;

  const cardEl = gridEl.querySelector(`[data-id="${pendingDeleteId}"]`);
  deleteModal.close();

  if (cardEl) {
    await animateCardRemoval(cardEl);
  }

  capsuleManager.deleteCapsule(pendingDeleteId);
  pendingDeleteId = null;
  refreshUI();
}

function handleDeleteCancel() {
  pendingDeleteId = null;
  deleteModal.close();
}

function init() {
  unlockDateInput.min = getTodayDateString();

  createModal = initModal('create-capsule-modal');
  deleteModal = initModal('delete-confirm-modal');

  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', openCreateModal);
  });

  form.addEventListener('submit', handleFormSubmit);
  imageInput.addEventListener('change', handleImageChange);
  gridEl.addEventListener('click', handleGridClick);

  document.getElementById('delete-confirm-btn').addEventListener('click', handleDeleteConfirm);
  document.getElementById('delete-cancel-btn').addEventListener('click', handleDeleteCancel);

  initScrollAnimations();
  refreshUI();
}

export { init };
