// Digital Credit Card Generator & Downloader
// Produces an official high-resolution (1200x760) digital credit card copy PNG

export function generateAndDownloadDigitalCard(card, brand = 'Visa') {
  if (!card) return;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isFreezed = card.status === 'freezed';

  // 1. Draw Card Outer Shape with Rounded Corners
  const x = 50;
  const y = 40;
  const w = 1100;
  const h = 680;
  const radius = 36;

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

  // 2. Background Luxury Gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (isFreezed) {
    grad.addColorStop(0, '#0a192f');
    grad.addColorStop(0.45, '#1e293b');
    grad.addColorStop(1, '#0f172a');
  } else {
    grad.addColorStop(0, '#090a14');
    grad.addColorStop(0.35, '#1a1033');
    grad.addColorStop(0.7, '#2d1b54');
    grad.addColorStop(1, '#110926');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Subtle Metallic Overlay Sheen
  const sheenGrad = ctx.createRadialGradient(x + 250, y + 150, 50, x + 350, y + 250, 600);
  sheenGrad.addColorStop(0, isFreezed ? 'rgba(56, 189, 248, 0.18)' : 'rgba(168, 85, 247, 0.22)');
  sheenGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(x, y, w, h);

  // Decorative Holographic Wave Lines
  ctx.strokeStyle = isFreezed ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + 120 + i * 80);
    ctx.bezierCurveTo(
      x + 350,
      y + 50 + i * 80,
      x + 750,
      y + 200 + i * 80,
      x + w,
      y + 100 + i * 80
    );
    ctx.stroke();
  }

  // 3. Top Header: Bank Logo + Title & Brand
  // Logo Icon
  ctx.fillStyle = isFreezed ? '#38bdf8' : '#8b5cf6';
  ctx.beginPath();
  ctx.arc(x + 70, y + 70, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', x + 70, y + 70);

  // Bank Name & Pass Type
  ctx.textAlign = 'left';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('LUMEN BANK', x + 115, y + 62);

  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isFreezed ? '#7dd3fc' : '#c084fc';
  ctx.fillText('DIGITAL CREDIT PASS • OFFICIAL VERIFIED COPY', x + 115, y + 86);

  // Brand Name (Top Right)
  ctx.textAlign = 'right';
  ctx.font = '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(brand.toUpperCase(), x + w - 70, y + 72);

  // Contactless Symbol
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const cx = x + w - 175;
  const cy = y + 68;
  for (let r = 10; r <= 22; r += 6) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }

  // 4. EMV Gold Chip
  const chipX = x + 70;
  const chipY = y + 140;
  const chipW = 105;
  const chipH = 80;

  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, '#fcd34d');
  chipGrad.addColorStop(0.5, '#f59e0b');
  chipGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = chipGrad;

  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(chipX, chipY, chipW, chipH, 10)
    : ctx.rect(chipX, chipY, chipW, chipH);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Internal Chip Circuitry Lines
  ctx.beginPath();
  ctx.moveTo(chipX, chipY + 28);
  ctx.lineTo(chipX + chipW, chipY + 28);
  ctx.moveTo(chipX, chipY + 52);
  ctx.lineTo(chipX + chipW, chipY + 52);
  ctx.moveTo(chipX + 38, chipY);
  ctx.lineTo(chipX + 38, chipY + chipH);
  ctx.moveTo(chipX + 68, chipY);
  ctx.lineTo(chipX + 68, chipY + chipH);
  ctx.stroke();

  // 5. Card Status Stamp (Only if card is Freezed)
  if (isFreezed) {
    const statusW = 200;
    const statusH = 40;
    const statusX = x + w - statusW - 70;
    const statusY = y + 155;

    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(statusX, statusY, statusW, statusH, 8)
      : ctx.rect(statusX, statusY, statusW, statusH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❄ STATUS: FREEZED', statusX + statusW / 2, statusY + statusH / 2);
  }

  // 6. Full Card Number Display
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "JetBrains Mono", "Courier New", monospace';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;

  const rawNumber = String(card.cardNumber || '4028 8121 3684 8411');
  // Format into 4 chunks with wide spacing
  const formattedNumber = rawNumber.replace(/\s+/g, '').replace(/(\d{4})/g, '$1  ').trim();
  ctx.fillText(formattedNumber, x + 70, y + 315);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 7. Metadata Details: Cardholder, Valid Thru, CVV, Credit Limit
  const metaY = y + 420;

  // Cardholder
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CARDHOLDER NAME', x + 70, metaY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(String(card.cardHolder || 'Neeraj').toUpperCase(), x + 70, metaY + 36);

  // Valid Thru
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('VALID THRU', x + 460, metaY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillText(card.expiry || '12/31', x + 460, metaY + 36);

  // CVV (CONFIDENTIAL SECURITY CODE)
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CVV / CVC (SECURITY)', x + 680, metaY);

  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillText(card.cvv || '471', x + 680, metaY + 36);

  // Credit Limit
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('TOTAL CREDIT LIMIT', x + w - 260, metaY);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`₹${card.creditLimit?.toLocaleString('en-IN') || '1,50,000'}`, x + w - 260, metaY + 36);

  // 8. Security & Authenticity Footer
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 50, y + 540);
  ctx.lineTo(x + w - 50, y + 540);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    'Official Digital Card Copy generated from Lumen AI Mobile. Valid for online payments & merchant verification.',
    x + 70,
    y + 580
  );

  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isFreezed ? '#38bdf8' : '#a855f7';
  ctx.fillText(
    `CARD REF: LMN-CC-${card.last4 || '8411'} • ISSUED BY LUMEN BANK DIGITAL VAULT`,
    x + 70,
    y + 610
  );

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
  const filename = `Lumen_${brand}_Digital_Card_${(card.cardHolder || 'Neeraj').replace(/\s+/g, '_')}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}
