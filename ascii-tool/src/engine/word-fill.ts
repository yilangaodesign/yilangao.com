/**
 * Word-fill layout algorithm.
 * Places flowing text into areas where brightness is below threshold.
 */

export interface WordFillChar {
  char: string;
  x: number;
  y: number;
  fontSize: number;
}

/**
 * Generate word-fill characters for a frame.
 * Text flows left-to-right, top-to-bottom, only drawn where image is dark enough.
 */
export function generateWordFill(
  imageData: ImageData,
  canvasWidth: number,
  canvasHeight: number,
  text: string,
  cellW: number,
  cellH: number,
  brightnessThreshold: number,
  baseFontSize: number
): WordFillChar[] {
  const chars: WordFillChar[] = [];
  if (!text || text.length === 0) return chars;

  const cols = Math.floor(canvasWidth / cellW);
  const rows = Math.floor(canvasHeight / cellH);
  const imgW = imageData.width;
  const imgH = imageData.height;
  const data = imageData.data;

  let charIdx = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const srcX = Math.floor((col / cols) * imgW);
      const srcY = Math.floor((row / rows) * imgH);
      const pixIdx = (srcY * imgW + srcX) * 4;

      const r = data[pixIdx];
      const g = data[pixIdx + 1];
      const b = data[pixIdx + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      if (brightness < brightnessThreshold) {
        const darkness = 1 - brightness / brightnessThreshold;
        const fontSize = Math.max(
          baseFontSize * 0.5,
          baseFontSize * (0.5 + darkness * 0.5)
        );

        chars.push({
          char: text[charIdx % text.length],
          x: col * cellW,
          y: row * cellH,
          fontSize,
        });
        charIdx++;
      }
    }
  }

  return chars;
}
