/**
 * Image pre-processing filters applied to ImageData before ASCII rendering.
 * Runs brightness, contrast, and edge enhancement in sequence.
 */

import { luminance } from './ascii-map';

export interface ImageFilterOptions {
  brightness: number;       // -100 to 100
  contrast: number;         // -100 to 100
  edgeEnhancement: number;  // 0 to 100
}

export interface FilterBuffers {
  gray: Float32Array;
  edges: Float32Array;
}

export function applyImageFilters(
  imageData: ImageData,
  options: ImageFilterOptions,
  buffers?: FilterBuffers,
): void {
  const { brightness, contrast, edgeEnhancement } = options;
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  if (brightness !== 0) {
    const offset = (brightness / 100) * 255;
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = clamp(data[i] + offset);
      data[i + 1] = clamp(data[i + 1] + offset);
      data[i + 2] = clamp(data[i + 2] + offset);
    }
  }

  if (contrast !== 0) {
    const c = (contrast / 100) * 255;
    const factor = (259 * (c + 255)) / (255 * (259 - c));
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = clamp(factor * (data[i] - 128) + 128);
      data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
      data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
    }
  }

  if (edgeEnhancement > 0) {
    applyEdgeEnhancement(data, w, h, edgeEnhancement / 100, buffers);
  }
}

/** Ensure a FilterBuffers object matches the required size, reusing if possible. */
export function ensureFilterBuffers(
  existing: FilterBuffers | null,
  w: number,
  h: number,
): FilterBuffers {
  const len = w * h;
  if (existing && existing.gray.length === len) return existing;
  return { gray: new Float32Array(len), edges: new Float32Array(len) };
}

function applyEdgeEnhancement(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  mix: number,
  buffers?: FilterBuffers,
): void {
  const len = w * h;
  const gray = buffers && buffers.gray.length === len ? buffers.gray : new Float32Array(len);
  const edges = buffers && buffers.edges.length === len ? buffers.edges : new Float32Array(len);

  for (let i = 0; i < len; i++) {
    const idx = i * 4;
    gray[i] = luminance(data[idx], data[idx + 1], data[idx + 2]);
  }

  edges.fill(0);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = gray[(y - 1) * w + (x - 1)];
      const tc = gray[(y - 1) * w + x];
      const tr = gray[(y - 1) * w + (x + 1)];
      const ml = gray[y * w + (x - 1)];
      const mr = gray[y * w + (x + 1)];
      const bl = gray[(y + 1) * w + (x - 1)];
      const bc = gray[(y + 1) * w + x];
      const br = gray[(y + 1) * w + (x + 1)];

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      edges[y * w + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
    }
  }

  for (let i = 0; i < len; i++) {
    const idx = i * 4;
    const edge = edges[i] * mix;
    data[idx]     = clamp(data[idx] + edge);
    data[idx + 1] = clamp(data[idx + 1] + edge);
    data[idx + 2] = clamp(data[idx + 2] + edge);
  }
}

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}
