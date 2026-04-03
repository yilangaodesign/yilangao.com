/**
 * Character brightness mapping utilities.
 * Maps pixel brightness (0-255) to ASCII characters.
 */

const DEFAULT_CHAR_SET = ' .:-=+*#%@';

/** BT.601 luminance from RGB channels. Single source of truth for the formula. */
export function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

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
      total += luminance(data[idx], data[idx + 1], data[idx + 2]);
      count++;
    }
  }

  return count > 0 ? total / count : 0;
}
