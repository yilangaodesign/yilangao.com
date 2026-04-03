"use client";
import { useRef, useCallback, useEffect } from 'react';
import { getCharForBrightness, sampleBrightness } from '@/engine/ascii-map';
import { generateWordFill } from '@/engine/word-fill';
import { generateDotGrid } from '@/engine/dot-grid';
import { applyHalftoneOverlay } from '@/engine/halftone';
import { applyImageFilters, ensureFilterBuffers, type FilterBuffers } from '@/engine/image-filters';
import type { MediaLayer } from './use-video-transform';

export type BlendMode = 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn';

export interface AsciiSettings {
  mode: 'charGrid' | 'wordFill' | 'dotGrid';
  fillerText: string;
  charSet: string;
  textColor: string;
  bgColor: string;
  transparentBg?: boolean;
  fontFamily: string;
  fontSize: number;
  gridDensity: number;
  brightnessThreshold: number;
  solidBackground?: boolean;
  halftoneOverlay?: boolean;
  halftoneDotSize?: number;
  halftoneDotSpacing?: number;
  brightness: number;
  contrast: number;
  edgeEnhancement: number;
  invertMapping: boolean;
  coverage: number;
  charOpacity: number;
  bgBlur: number;
  bgBlurOpacity: number;
  overlayColor: string;
  overlayOpacity: number;
  overlayBlendMode: BlendMode;
  animate: boolean;
  animationIntensity: number;
}

export const defaultSettings: AsciiSettings = {
  mode: 'charGrid',
  fillerText: 'HELLO WORLD ',
  charSet: ' .:-=+*#%@',
  textColor: '#00ff00',
  bgColor: '#000000',
  transparentBg: false,
  fontFamily: 'monospace',
  fontSize: 10,
  gridDensity: 8,
  brightnessThreshold: 128,
  solidBackground: false,
  halftoneOverlay: false,
  halftoneDotSize: 4,
  halftoneDotSpacing: 6,
  brightness: 0,
  contrast: 0,
  edgeEnhancement: 0,
  invertMapping: false,
  coverage: 100,
  charOpacity: 100,
  bgBlur: 0,
  bgBlurOpacity: 100,
  overlayColor: '#000000',
  overlayOpacity: 0,
  overlayBlendMode: 'multiply',
  animate: false,
  animationIntensity: 50,
};

function coverageHash(col: number, row: number): number {
  let h = col * 374761393 + row * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) % 100;
}

interface UseAsciiRendererParams {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  settings: AsciiSettings;
  isPlaying: boolean;
  mediaLayer?: MediaLayer;
  renderScale?: number;
}

function drawSourceToCanvas(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLImageElement,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  mediaLayer?: MediaLayer,
  canvas?: HTMLCanvasElement | null,
  rScale: number = 1,
) {
  if (mediaLayer && canvas) {
    const scaleX = targetW / canvas.width;
    const scaleY = targetH / canvas.height;
    ctx.drawImage(
      source,
      mediaLayer.x * scaleX,
      mediaLayer.y * scaleY,
      mediaLayer.w * scaleX,
      mediaLayer.h * scaleY,
    );
  } else if (mediaLayer && rScale !== 1) {
    ctx.drawImage(
      source,
      mediaLayer.x * rScale,
      mediaLayer.y * rScale,
      mediaLayer.w * rScale,
      mediaLayer.h * rScale,
    );
  } else {
    const mediaAR = sourceW / sourceH;
    const canvasAR = targetW / targetH;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (mediaAR > canvasAR) {
      drawW = targetW; drawH = targetW / mediaAR; drawX = 0; drawY = (targetH - drawH) / 2;
    } else {
      drawH = targetH; drawW = targetH * mediaAR; drawX = (targetW - drawW) / 2; drawY = 0;
    }
    ctx.drawImage(source, drawX, drawY, drawW, drawH);
  }
}

function resolveSource(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  imageRef?: React.RefObject<HTMLImageElement | null>,
) {
  const image = imageRef?.current;
  const video = videoRef.current;
  if (image && image.naturalWidth > 0) {
    return { source: image as HTMLVideoElement | HTMLImageElement, sourceW: image.naturalWidth, sourceH: image.naturalHeight };
  }
  if (video && video.readyState >= 2) {
    return { source: video as HTMLVideoElement | HTMLImageElement, sourceW: video.videoWidth, sourceH: video.videoHeight };
  }
  return null;
}

function renderAsciiToCtx(
  renderCtx: CanvasRenderingContext2D,
  imageData: ImageData,
  renderW: number,
  renderH: number,
  settings: AsciiSettings,
  frameCount: number = 0,
) {
  const cellW = settings.gridDensity;
  const cellH = Math.floor(cellW * 1.8);
  const cov = settings.coverage;
  const useAnimation = settings.animate;
  const intensity = settings.animationIntensity / 100;

  renderCtx.globalAlpha = settings.charOpacity / 100;

  if (settings.mode === 'charGrid') {
    renderCtx.font = `${settings.fontSize}px ${settings.fontFamily}`;
    renderCtx.fillStyle = settings.textColor;
    renderCtx.textBaseline = 'top';

    const cols = Math.floor(renderW / cellW);
    const rows = Math.floor(renderH / cellH);
    const useSolidBg = settings.solidBackground ?? false;
    const threshold = settings.brightnessThreshold;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (cov < 100 && coverageHash(col, row) >= cov) continue;
        const brightness = sampleBrightness(imageData, col * cellW, row * cellH, cellW, cellH);
        if (useSolidBg && brightness > threshold) continue;
        let char = getCharForBrightness(brightness, settings.charSet, settings.invertMapping);

        if (useAnimation && intensity > 0) {
          const shouldSwap = coverageHash(col + frameCount, row + frameCount * 7) < (intensity * 15);
          if (shouldSwap && settings.charSet.length > 1) {
            const charIdx = settings.charSet.indexOf(char);
            const offset = (coverageHash(col * 3, row * 5 + frameCount) % 3) - 1;
            const newIdx = Math.min(Math.max(charIdx + offset, 0), settings.charSet.length - 1);
            char = settings.charSet[newIdx];
          }
        }

        let dx = col * cellW;
        let dy = row * cellH;
        if (useAnimation && intensity > 0) {
          const jitter = intensity * 1.5;
          dx += (coverageHash(col + frameCount * 3, row) % 3 - 1) * jitter;
          dy += (coverageHash(col, row + frameCount * 3) % 3 - 1) * jitter;
        }

        renderCtx.fillText(char, dx, dy);
      }
    }
  } else if (settings.mode === 'wordFill') {
    const chars = generateWordFill(
      imageData, renderW, renderH, settings.fillerText,
      cellW, cellH, settings.brightnessThreshold, settings.fontSize,
      settings.invertMapping,
    );

    renderCtx.fillStyle = settings.textColor;
    renderCtx.textBaseline = 'top';

    for (const c of chars) {
      if (cov < 100 && coverageHash(Math.floor(c.x / cellW), Math.floor(c.y / cellH)) >= cov) continue;
      renderCtx.font = `${c.fontSize}px ${settings.fontFamily}`;
      let dx = c.x;
      let dy = c.y;
      if (useAnimation && intensity > 0) {
        const jitter = intensity * 1.5;
        dx += (coverageHash(Math.floor(c.x) + frameCount * 3, Math.floor(c.y)) % 3 - 1) * jitter;
        dy += (coverageHash(Math.floor(c.x), Math.floor(c.y) + frameCount * 3) % 3 - 1) * jitter;
      }
      renderCtx.fillText(c.char, dx, dy);
    }
  } else if (settings.mode === 'dotGrid') {
    const dots = generateDotGrid(imageData, renderW, renderH, cellW, settings.invertMapping);
    renderCtx.fillStyle = settings.textColor;

    for (const dot of dots) {
      if (cov < 100 && coverageHash(Math.floor(dot.cx), Math.floor(dot.cy)) >= cov) continue;
      renderCtx.beginPath();
      renderCtx.arc(dot.cx, dot.cy, dot.radius, 0, Math.PI * 2);
      renderCtx.fill();
    }
  }

  renderCtx.globalAlpha = 1;
}

function applyColorOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  opacity: number,
  blendMode: BlendMode,
) {
  if (opacity <= 0) return;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = blendMode;
  ctx.globalAlpha = opacity / 100;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

export function useAsciiRenderer({
  videoRef,
  imageRef,
  canvasRef,
  settings,
  isPlaying,
  mediaLayer,
  renderScale = 1,
}: UseAsciiRendererParams) {
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const hiresRef = useRef<HTMLCanvasElement | null>(null);
  const blurRef = useRef<HTMLCanvasElement | null>(null);
  const exportSamplerRef = useRef<HTMLCanvasElement | null>(null);
  const exportBlurRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const filterBuffersRef = useRef<FilterBuffers | null>(null);

  const getOffscreen = useCallback(() => {
    if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas');
    return offscreenRef.current;
  }, []);

  const getHires = useCallback(() => {
    if (!hiresRef.current) hiresRef.current = document.createElement('canvas');
    return hiresRef.current;
  }, []);

  const getBlurCanvas = useCallback(() => {
    if (!blurRef.current) blurRef.current = document.createElement('canvas');
    return blurRef.current;
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resolved = resolveSource(videoRef, imageRef);
    if (!resolved) return;
    const { source, sourceW, sourceH } = resolved;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayW = canvas.width;
    const displayH = canvas.height;
    const rScale = Math.max(1, renderScale);
    const rw = Math.round(displayW * rScale);
    const rh = Math.round(displayH * rScale);

    const useHires = rScale > 1;
    let renderCtx: CanvasRenderingContext2D;
    let renderW: number;
    let renderH: number;

    if (useHires) {
      const hires = getHires();
      hires.width = rw;
      hires.height = rh;
      const hCtx = hires.getContext('2d');
      if (!hCtx) return;
      renderCtx = hCtx;
      renderW = rw;
      renderH = rh;
    } else {
      renderCtx = ctx;
      renderW = displayW;
      renderH = displayH;
    }

    // Sample source image
    const offscreen = getOffscreen();
    offscreen.width = renderW;
    offscreen.height = renderH;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.clearRect(0, 0, renderW, renderH);
    drawSourceToCanvas(offCtx, source, sourceW, sourceH, renderW, renderH, mediaLayer, undefined, rScale);
    const imageData = offCtx.getImageData(0, 0, renderW, renderH);

    // Phase 1: Pre-processing
    const needsFilters = settings.brightness !== 0 || settings.contrast !== 0 || settings.edgeEnhancement > 0;
    if (needsFilters) {
      if (settings.edgeEnhancement > 0) {
        filterBuffersRef.current = ensureFilterBuffers(filterBuffersRef.current, renderW, renderH);
      }
      applyImageFilters(imageData, {
        brightness: settings.brightness,
        contrast: settings.contrast,
        edgeEnhancement: settings.edgeEnhancement,
      }, filterBuffersRef.current ?? undefined);
    }

    // Clear render target
    if (settings.transparentBg) {
      renderCtx.clearRect(0, 0, renderW, renderH);
    } else {
      renderCtx.fillStyle = settings.bgColor;
      renderCtx.fillRect(0, 0, renderW, renderH);
    }

    // Phase 4a: Background blur layer (copies from offscreen to avoid redundant drawImage from source)
    if (settings.bgBlur > 0) {
      const blurCanvas = getBlurCanvas();
      blurCanvas.width = renderW;
      blurCanvas.height = renderH;
      const bCtx = blurCanvas.getContext('2d');
      if (bCtx) {
        bCtx.filter = `blur(${settings.bgBlur}px)`;
        bCtx.clearRect(0, 0, renderW, renderH);
        bCtx.drawImage(offscreen, 0, 0);
        bCtx.filter = 'none';

        renderCtx.globalAlpha = settings.bgBlurOpacity / 100;
        renderCtx.drawImage(blurCanvas, 0, 0);
        renderCtx.globalAlpha = 1;
      }
    }

    // Phase 2-3: Render ASCII/dots
    const frameCount = settings.animate ? frameCountRef.current : 0;
    renderAsciiToCtx(renderCtx, imageData, renderW, renderH, settings, frameCount);

    // Halftone post-effect
    if (settings.halftoneOverlay) {
      applyHalftoneOverlay(
        renderCtx, renderW, renderH,
        settings.halftoneDotSize ?? 4,
        settings.halftoneDotSpacing ?? 6
      );
    }

    // Phase 4b: Color overlay
    applyColorOverlay(
      renderCtx, renderW, renderH,
      settings.overlayColor, settings.overlayOpacity, settings.overlayBlendMode
    );

    if (useHires) {
      ctx.clearRect(0, 0, displayW, displayH);
      ctx.drawImage(getHires(), 0, 0, rw, rh, 0, 0, displayW, displayH);
    }

    if (settings.animate) frameCountRef.current++;
  }, [videoRef, imageRef, canvasRef, settings, getOffscreen, getHires, getBlurCanvas, mediaLayer, renderScale]);

  const renderExportFrame = useCallback(
    (
      exportW: number,
      exportH: number,
      overrides?: { transparent?: boolean },
    ): HTMLCanvasElement | null => {
      const canvas = canvasRef.current;
      const resolved = resolveSource(videoRef, imageRef);
      if (!resolved) return null;
      const { source, sourceW, sourceH } = resolved;

      const target = document.createElement('canvas');
      target.width = exportW;
      target.height = exportH;
      const ctx = target.getContext('2d');
      if (!ctx) return null;

      if (!exportSamplerRef.current) exportSamplerRef.current = document.createElement('canvas');
      const sampler = exportSamplerRef.current;
      sampler.width = exportW;
      sampler.height = exportH;
      const sCtx = sampler.getContext('2d');
      if (!sCtx) return null;

      const useTransparent = overrides?.transparent ?? settings.transparentBg;

      sCtx.clearRect(0, 0, exportW, exportH);
      drawSourceToCanvas(sCtx, source, sourceW, sourceH, exportW, exportH, mediaLayer, canvas);

      const imgData = sCtx.getImageData(0, 0, exportW, exportH);
      const needsFilters = settings.brightness !== 0 || settings.contrast !== 0 || settings.edgeEnhancement > 0;
      if (needsFilters) {
        applyImageFilters(imgData, {
          brightness: settings.brightness,
          contrast: settings.contrast,
          edgeEnhancement: settings.edgeEnhancement,
        });
      }

      if (useTransparent) {
        ctx.clearRect(0, 0, exportW, exportH);
      } else {
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, exportW, exportH);
      }

      // Background blur layer for export (copies from sampler to avoid redundant source draw)
      if (settings.bgBlur > 0) {
        if (!exportBlurRef.current) exportBlurRef.current = document.createElement('canvas');
        const blurCanvas = exportBlurRef.current;
        blurCanvas.width = exportW;
        blurCanvas.height = exportH;
        const bCtx = blurCanvas.getContext('2d');
        if (bCtx) {
          bCtx.filter = `blur(${settings.bgBlur}px)`;
          bCtx.clearRect(0, 0, exportW, exportH);
          bCtx.drawImage(sampler, 0, 0);
          bCtx.filter = 'none';
          ctx.globalAlpha = settings.bgBlurOpacity / 100;
          ctx.drawImage(blurCanvas, 0, 0);
          ctx.globalAlpha = 1;
        }
      }

      renderAsciiToCtx(ctx, imgData, exportW, exportH, settings);

      if (settings.halftoneOverlay) {
        applyHalftoneOverlay(
          ctx, exportW, exportH,
          settings.halftoneDotSize ?? 4,
          settings.halftoneDotSpacing ?? 6,
        );
      }

      applyColorOverlay(ctx, exportW, exportH, settings.overlayColor, settings.overlayOpacity, settings.overlayBlendMode);

      return target;
    },
    [videoRef, imageRef, canvasRef, settings, mediaLayer],
  );

  const generateSVGAtSize = useCallback(
    (
      exportW: number,
      exportH: number,
      overrides?: { transparent?: boolean; responsive?: boolean },
    ): string | null => {
      const canvas = canvasRef.current;
      const resolved = resolveSource(videoRef, imageRef);
      if (!resolved) return null;
      const { source, sourceW, sourceH } = resolved;

      const offscreen = document.createElement('canvas');
      offscreen.width = exportW;
      offscreen.height = exportH;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return null;
      offCtx.clearRect(0, 0, exportW, exportH);

      drawSourceToCanvas(offCtx, source, sourceW, sourceH, exportW, exportH, mediaLayer, canvas);

      const imgData = offCtx.getImageData(0, 0, exportW, exportH);
      const needsFilters = settings.brightness !== 0 || settings.contrast !== 0 || settings.edgeEnhancement > 0;
      if (needsFilters) {
        applyImageFilters(imgData, {
          brightness: settings.brightness,
          contrast: settings.contrast,
          edgeEnhancement: settings.edgeEnhancement,
        });
      }

      const useTransparent = overrides?.transparent ?? settings.transparentBg;
      const responsive = overrides?.responsive ?? false;

      const cellW = settings.gridDensity;
      const cellH = Math.floor(cellW * 1.8);
      const escXml = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      const opacity = settings.charOpacity < 100 ? ` opacity="${(settings.charOpacity / 100).toFixed(2)}"` : '';

      let svg = responsive
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${exportW} ${exportH}">\n`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}">\n`;

      if (!useTransparent) {
        svg += `  <rect width="${exportW}" height="${exportH}" fill="${escXml(settings.bgColor)}"/>\n`;
      }

      if (settings.mode === 'dotGrid') {
        const dots = generateDotGrid(imgData, exportW, exportH, cellW, settings.invertMapping);
        svg += `  <g fill="${escXml(settings.textColor)}"${opacity}>\n`;
        const cov = settings.coverage;
        for (const dot of dots) {
          if (cov < 100 && coverageHash(Math.floor(dot.cx), Math.floor(dot.cy)) >= cov) continue;
          svg += `    <circle cx="${dot.cx.toFixed(1)}" cy="${dot.cy.toFixed(1)}" r="${dot.radius.toFixed(1)}"/>\n`;
        }
        svg += `  </g>\n`;
      } else {
        svg += `  <g fill="${escXml(settings.textColor)}" font-family="${escXml(settings.fontFamily)}" font-size="${settings.fontSize}" dominant-baseline="text-before-edge"${opacity}>\n`;

        if (settings.mode === 'charGrid') {
          const cols = Math.floor(exportW / cellW);
          const rows = Math.floor(exportH / cellH);
          const useSolidBg = settings.solidBackground ?? false;
          const threshold = settings.brightnessThreshold;
          const cov = settings.coverage;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              if (cov < 100 && coverageHash(col, row) >= cov) continue;
              const brightness = sampleBrightness(imgData, col * cellW, row * cellH, cellW, cellH);
              if (useSolidBg && brightness > threshold) continue;
              const char = getCharForBrightness(brightness, settings.charSet, settings.invertMapping);
              if (char === ' ') continue;
              svg += `    <text x="${col * cellW}" y="${row * cellH}">${escXml(char)}</text>\n`;
            }
          }
        } else {
          const chars = generateWordFill(
            imgData, exportW, exportH, settings.fillerText, cellW, cellH,
            settings.brightnessThreshold, settings.fontSize, settings.invertMapping,
          );
          for (const c of chars) {
            svg += `    <text x="${c.x}" y="${c.y}" font-size="${c.fontSize}">${escXml(c.char)}</text>\n`;
          }
        }
        svg += `  </g>\n`;
      }

      // Color overlay as SVG rect with blend mode
      if (settings.overlayOpacity > 0) {
        svg += `  <rect width="${exportW}" height="${exportH}" fill="${escXml(settings.overlayColor)}" opacity="${(settings.overlayOpacity / 100).toFixed(2)}" style="mix-blend-mode: ${settings.overlayBlendMode}"/>\n`;
      }

      svg += `</svg>`;
      return svg;
    },
    [videoRef, imageRef, canvasRef, settings, mediaLayer],
  );

  const generateSVG = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return generateSVGAtSize(canvas.width, canvas.height);
  }, [canvasRef, generateSVGAtSize]);

  useEffect(() => {
    const shouldAnimate = isPlaying || settings.animate;
    if (!shouldAnimate) {
      renderFrame();
      return;
    }

    const loop = () => {
      renderFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, settings.animate, renderFrame]);

  return { renderFrame, generateSVG, renderExportFrame, generateSVGAtSize };
}
