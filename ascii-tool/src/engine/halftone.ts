/**
 * Apply a halftone dot overlay on top of the current canvas content.
 * Reads the canvas pixels, then redraws dots whose radius varies with luminance.
 */
import { luminance } from './ascii-map';

export function applyHalftoneOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dotSize: number,
  dotSpacing: number
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  const cols = Math.ceil(w / dotSpacing);
  const rows = Math.ceil(h / dotSpacing);
  const maxRadius = dotSize;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * dotSpacing + dotSpacing / 2;
      const cy = row * dotSpacing + dotSpacing / 2;

      const px = Math.min(Math.floor(cx), w - 1);
      const py = Math.min(Math.floor(cy), h - 1);
      const idx = (py * w + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const lum = luminance(r, g, b) / 255;

      if (lum < 0.02) continue;

      const radius = lum * maxRadius;
      if (radius < 0.3) continue;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
