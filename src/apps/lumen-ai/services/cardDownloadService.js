// Digital Credit Card Generator & Downloader
// Produces a realistic, minimalist vertical credit card PNG (760x1200)

export function generateAndDownloadDigitalCard(card, brand = 'Visa') {
  if (!card) return;

  const canvas = document.createElement('canvas');
  canvas.width = 760;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isFreezed = card.status === 'freezed';

  // 1. Draw Card Outer Shape with Rounded Corners
  const x = 40;
  const y = 40;
  const w = 680;
  const h = 1120;
  const radius = 38;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  // 2. Background Luxury Vertical Gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (isFreezed) {
    grad.addColorStop(0, '#0a192f');
    grad.addColorStop(0.35, '#0f2444');
    grad.addColorStop(0.7, '#1e293b');
    grad.addColorStop(1, '#0b1329');
  } else {
    grad.addColorStop(0, '#0a0a14');
    grad.addColorStop(0.3, '#170f2c');
    grad.addColorStop(0.65, '#2e1954');
    grad.addColorStop(1, '#0e0820');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Subtle Metallic Sheen
  const sheenGrad = ctx.createRadialGradient(x + 220, y + 250, 40, x + 340, y + 500, 600);
  sheenGrad.addColorStop(0, isFreezed ? 'rgba(56, 189, 248, 0.22)' : 'rgba(168, 85, 247, 0.22)');
  sheenGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(x, y, w, h);

  // Subtle Matte Texture / Diagonal Lines
  ctx.strokeStyle = isFreezed ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 60 + i * 110, y);
    ctx.bezierCurveTo(
      x + 120 + i * 110,
      y + 400,
      x - 10 + i * 110,
      y + 800,
      x + 90 + i * 110,
      y + h
    );
    ctx.stroke();
  }

  // 3. Top Header: Bank Logo + Contactless Symbol
  // Logo Circle
  ctx.fillStyle = isFreezed ? '#38bdf8' : '#8b5cf6';
  ctx.beginPath();
  ctx.arc(x + 70, y + 75, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', x + 70, y + 75);

  // Bank Name
  ctx.textAlign = 'left';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('LUMEN', x + 115, y + 75);

  // Contactless Symbol (Top Right)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const cx = x + w - 80;
  const cy = y + 75;
  for (let r = 9; r <= 23; r += 7) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }

  // 4. EMV Gold Smart Chip
  const chipX = x + 70;
  const chipY = y + 175;
  const chipW = 96;
  const chipH = 74;

  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, '#fde68a');
  chipGrad.addColorStop(0.45, '#f59e0b');
  chipGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = chipGrad;

  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(chipX, chipY, chipW, chipH, 10)
    : ctx.rect(chipX, chipY, chipW, chipH);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Internal Chip Circuitry
  ctx.beginPath();
  ctx.moveTo(chipX, chipY + 26);
  ctx.lineTo(chipX + chipW, chipY + 26);
  ctx.moveTo(chipX, chipY + 48);
  ctx.lineTo(chipX + chipW, chipY + 48);
  ctx.moveTo(chipX + 35, chipY);
  ctx.lineTo(chipX + 35, chipY + chipH);
  ctx.moveTo(chipX + 61, chipY);
  ctx.lineTo(chipX + 61, chipY + chipH);
  ctx.stroke();

  // Frozen Status Stamp (only shown if card is actually locked)
  if (isFreezed) {
    const statusW = 160;
    const statusH = 34;
    const statusX = x + w - statusW - 70;
    const statusY = y + 195;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(statusX, statusY, statusW, statusH, 8)
      : ctx.rect(statusX, statusY, statusW, statusH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❄ FROZEN', statusX + statusW / 2, statusY + statusH / 2);
  }

  // 5. Card Number Section
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px "JetBrains Mono", "Courier New", monospace';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;

  const rawNumber = String(card.cardNumber || '4028 8121 3684 8411');
  const formattedNumber = rawNumber.replace(/\s+/g, '').replace(/(\d{4})/g, '$1  ').trim();
  ctx.fillText(formattedNumber, x + 70, y + 460);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 6. Security Details: Valid Thru & CVV
  const metaY1 = y + 570;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('VALID THRU', x + 70, metaY1);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(card.expiry || '12/31', x + 70, metaY1 + 36);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CVV', x + 310, metaY1);

  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(card.cvv || '471', x + 310, metaY1 + 36);

  // 7. Cardholder Name
  const metaY2 = y + 710;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CARDHOLDER', x + 70, metaY2);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(String(card.cardHolder || 'Neeraj').toUpperCase(), x + 70, metaY2 + 40);

  // 8. Payment Network Logo (VISA / MASTERCARD) at bottom right
  ctx.textAlign = 'right';
  ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(brand.toUpperCase(), x + w - 70, y + 1040);

  ctx.restore();

  // 9. Card Border Outline
  ctx.strokeStyle = isFreezed ? 'rgba(56, 189, 248, 0.45)' : 'rgba(168, 85, 247, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(x, y, w, h, radius)
    : ctx.rect(x, y, w, h);
  ctx.stroke();

  // 10. Trigger Instant Download of PNG
  const dataUrl = canvas.toDataURL('image/png');
  const filename = `Lumen_Card_${(card.cardHolder || 'Neeraj').replace(/\s+/g, '_')}_••••${card.last4 || '8411'}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}
