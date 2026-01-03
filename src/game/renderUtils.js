export function drawBubble(ctx, x, y, r) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, r*0.2, x, y, r);
  grad.addColorStop(0, '#e0f7ff');
  grad.addColorStop(0.5, '#7fd8ff');
  grad.addColorStop(1, '#3bb0e6');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(x - r*0.3, y - r*0.3, r*0.35, r*0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawSlime(c, x, y, r, color) {
  c.save();
  c.fillStyle = color || '#7be36b';
  c.beginPath();
  c.ellipse(x, y, r, r * 0.85, 0, Math.PI * 2, 0);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.25)';
  c.beginPath();
  c.ellipse(x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.2, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#222';
  c.beginPath();
  c.arc(x - r * 0.25, y - r * 0.05, Math.max(2, r * 0.12), 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(x + r * 0.1, y - r * 0.05, Math.max(2, r * 0.12), 0, Math.PI * 2);
  c.fill();
  c.restore();
}

export function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === 'undefined') r = 5;
  if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
