/**
 * Dot grid rendering mode.
 * Draws circles whose radius maps to source image luminance.
 */

import { sampleBrightness } from './ascii-map';

export interface DotGridResult {
  cx: number;
  cy: number;
  radius: number;
}

export function generateDotGrid(
  imageData: ImageData,
  canvasWidth: number,
  canvasHeight: number,
  cellSize: number,
  invert: boolean = false
): DotGridResult[] {
  const dots: DotGridResult[] = [];
  const cellH = Math.floor(cellSize * 1.8);
  const cols = Math.floor(canvasWidth / cellSize);
  const rows = Math.floor(canvasHeight / cellH);
  const maxRadius = Math.min(cellSize, cellH) * 0.45;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const brightness = sampleBrightness(
        imageData,
        col * cellSize,
        row * cellH,
        cellSize,
        cellH
      );

      const norm = invert ? brightness / 255 : 1 - brightness / 255;
      const radius = norm * maxRadius;

      if (radius < 0.3) continue;

      dots.push({
        cx: col * cellSize + cellSize / 2,
        cy: row * cellH + cellH / 2,
        radius,
      });
    }
  }

  return dots;
}
