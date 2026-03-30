/**
 * Character brightness mapping utilities.
 * Maps pixel brightness (0-255) to ASCII characters.
 */

const DEFAULT_CHAR_SET = ' .:-=+*#%@';

/**
 * Get the character that best represents a given brightness value.
 * @param brightness 0 (black) to 255 (white)
 * @param charSet Characters ordered from darkest to brightest representation
 * @param invert If true, bright pixels map to dense characters
 */
export function getCharForBrightness(
  brightness: number,
  charSet: string = DEFAULT_CHAR_SET,
  invert: boolean = false
): string {
  const b = invert ? 255 - brightness : brightness;
  const idx = Math.floor((b / 255) * (charSet.length - 1));
  return charSet[Math.min(Math.max(idx, 0), charSet.length - 1)];
}

/**
 * Sample an image region and return average brightness (0-255).
 */
export function sampleBrightness(
  imageData: ImageData,
  x: number,
  y: number,
  w: number,
  h: number
): number {
  const data = imageData.data;
  const imgW = imageData.width;
  let total = 0;
  let count = 0;

  const sx = Math.max(0, Math.floor(x));
  const sy = Math.max(0, Math.floor(y));
  const ex = Math.min(imgW, Math.floor(x + w));
  const ey = Math.min(imageData.height, Math.floor(y + h));

  for (let py = sy; py < ey; py++) {
    for (let px = sx; px < ex; px++) {
      const idx = (py * imgW + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      total += 0.299 * r + 0.587 * g + 0.114 * b;
      count++;
    }
  }

  return count > 0 ? total / count : 0;
}

/**
 * Sample an image region and return average RGB color.
 */
export function sampleColor(
  imageData: ImageData,
  x: number,
  y: number,
  w: number,
  h: number
): { r: number; g: number; b: number } {
  const data = imageData.data;
  const imgW = imageData.width;
  let totalR = 0, totalG = 0, totalB = 0;
  let count = 0;

  const sx = Math.max(0, Math.floor(x));
  const sy = Math.max(0, Math.floor(y));
  const ex = Math.min(imgW, Math.floor(x + w));
  const ey = Math.min(imageData.height, Math.floor(y + h));

  for (let py = sy; py < ey; py++) {
    for (let px = sx; px < ex; px++) {
      const idx = (py * imgW + px) * 4;
      totalR += data[idx];
      totalG += data[idx + 1];
      totalB += data[idx + 2];
      count++;
    }
  }

  if (count === 0) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };
}
