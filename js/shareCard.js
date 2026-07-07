/**
 * Canvas share card generator for opened capsules.
 */

import { formatDate, getThemeColor } from './utils.js';
import { getSealedDurationDays } from './timeEngine.js';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

/**
 * Generate a shareable image blob from capsule data.
 * @param {object} capsule
 * @returns {Promise<Blob|null>}
 */
export async function generateShareCard(capsule) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const themeColor = getThemeColor(capsule.theme);
  const sealedDays = getSealedDurationDays(capsule);

  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, '#FAFAF8');
  gradient.addColorStop(0.5, '#FFFFFF');
  gradient.addColorStop(1, hexToRgba(themeColor, 0.08));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  drawGrain(ctx, CARD_WIDTH, CARD_HEIGHT);

  const accentGradient = ctx.createRadialGradient(
    CARD_WIDTH * 0.8, CARD_HEIGHT * 0.2, 0,
    CARD_WIDTH * 0.8, CARD_HEIGHT * 0.2, CARD_WIDTH * 0.5
  );
  accentGradient.addColorStop(0, hexToRgba(themeColor, 0.15));
  accentGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.strokeStyle = hexToRgba(themeColor, 0.2);
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 60, CARD_WIDTH - 120, CARD_HEIGHT - 120, 32);
  ctx.stroke();

  ctx.fillStyle = themeColor;
  ctx.font = '600 28px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DIGITAL TIME CAPSULE', CARD_WIDTH / 2, 180);

  ctx.fillStyle = '#0F172A';
  ctx.font = '500 64px Newsreader, Georgia, serif';
  wrapText(ctx, capsule.title, CARD_WIDTH / 2, 320, CARD_WIDTH - 200, 72);

  if (capsule.image) {
    try {
      const img = await loadImage(capsule.image);
      const imgSize = 480;
      const imgX = (CARD_WIDTH - imgSize) / 2;
      const imgY = 420;
      roundRect(ctx, imgX, imgY, imgSize, imgSize * 0.65, 20);
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize * 0.65);
      ctx.restore();
    } catch {
      /* skip image if load fails */
    }
  }

  ctx.fillStyle = '#475569';
  ctx.font = '400 32px Inter, system-ui, sans-serif';
  const descY = capsule.image ? 780 : 480;
  wrapText(ctx, capsule.description, CARD_WIDTH / 2, descY, CARD_WIDTH - 200, 42);

  ctx.strokeStyle = hexToRgba(themeColor, 0.15);
  ctx.beginPath();
  ctx.moveTo(200, 920);
  ctx.lineTo(CARD_WIDTH - 200, 920);
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 24px Inter, system-ui, sans-serif';
  ctx.fillText(`Sealed for ${sealedDays} day${sealedDays === 1 ? '' : 's'}`, CARD_WIDTH / 2, 980);

  ctx.fillStyle = '#0F172A';
  ctx.font = '500 36px Inter, system-ui, sans-serif';
  ctx.fillText(`Unlocked ${formatDate(capsule.unlockedAt || capsule.unlockDate)}`, CARD_WIDTH / 2, 1040);

  ctx.fillStyle = themeColor;
  ctx.font = '600 28px Inter, system-ui, sans-serif';
  ctx.fillText('Preserve today. Unlock tomorrow.', CARD_WIDTH / 2, CARD_HEIGHT - 120);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.92);
  });
}

/**
 * Trigger a download of the share card.
 * @param {object} capsule
 * @returns {Promise<boolean>}
 */
export async function downloadShareCard(capsule) {
  const blob = await generateShareCard(capsule);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(capsule.title)}-time-capsule.png`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawGrain(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40) || 'capsule';
}
