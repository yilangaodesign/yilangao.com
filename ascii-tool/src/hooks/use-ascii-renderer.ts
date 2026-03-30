"use client";
import { useRef, useCallback, useEffect } from 'react';
import { getCharForBrightness, sampleBrightness } from '@/engine/ascii-map';
import { generateWordFill } from '@/engine/word-fill';
import { applyHalftoneOverlay } from '@/engine/halftone';
import type { MediaLayer } from './use-video-transform';

export interface AsciiSettings {
  mode: 'charGrid' | 'wordFill';
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
};

interface UseAsciiRendererParams {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  settings: AsciiSettings;
  isPlaying: boolean;
  mediaLayer?: MediaLayer;
  renderScale?: number;
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
  const rafRef = useRef<number>(0);

  const getOffscreen = useCallback(() => {
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }
    return offscreenRef.current;
  }, []);

  const getHires = useCallback(() => {
    if (!hiresRef.current) {
      hiresRef.current = document.createElement('canvas');
    }
    return hiresRef.current;
  }, []);

  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const image = imageRef?.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    type MediaSource = HTMLVideoElement | HTMLImageElement;
    let source: MediaSource | null = null;
    let sourceW = 0;
    let sourceH = 0;

    if (image && image.naturalWidth > 0) {
      source = image;
      sourceW = image.naturalWidth;
      sourceH = image.naturalHeight;
    } else if (video && video.readyState >= 2) {
      source = video;
      sourceW = video.videoWidth;
      sourceH = video.videoHeight;
    }

    if (!source) return;

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

    const offscreen = getOffscreen();
    offscreen.width = renderW;
    offscreen.height = renderH;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.fillStyle = settings.transparentBg ? 'rgba(0,0,0,0)' : settings.bgColor;
    if (settings.transparentBg) {
      offCtx.clearRect(0, 0, renderW, renderH);
    } else {
      offCtx.fillRect(0, 0, renderW, renderH);
    }

    if (mediaLayer) {
      offCtx.drawImage(
        source,
        mediaLayer.x * rScale,
        mediaLayer.y * rScale,
        mediaLayer.w * rScale,
        mediaLayer.h * rScale,
      );
    } else {
      const mediaAR = sourceW / sourceH;
      const canvasAR = renderW / renderH;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (mediaAR > canvasAR) {
        drawW = renderW; drawH = renderW / mediaAR; drawX = 0; drawY = (renderH - drawH) / 2;
      } else {
        drawH = renderH; drawW = renderH * mediaAR; drawX = (renderW - drawW) / 2; drawY = 0;
      }
      offCtx.drawImage(source, drawX, drawY, drawW, drawH);
    }
    const imageData = offCtx.getImageData(0, 0, renderW, renderH);

    if (settings.transparentBg) {
      renderCtx.clearRect(0, 0, renderW, renderH);
    } else {
      renderCtx.fillStyle = settings.bgColor;
      renderCtx.fillRect(0, 0, renderW, renderH);
    }

    const cellW = settings.gridDensity;
    const cellH = Math.floor(cellW * 1.8);

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
          const brightness = sampleBrightness(
            imageData,
            col * cellW,
            row * cellH,
            cellW,
            cellH
          );
          if (useSolidBg && brightness > threshold) continue;
          const char = getCharForBrightness(brightness, settings.charSet);
          renderCtx.fillText(char, col * cellW, row * cellH);
        }
      }
    } else {
      const chars = generateWordFill(
        imageData,
        renderW,
        renderH,
        settings.fillerText,
        cellW,
        cellH,
        settings.brightnessThreshold,
        settings.fontSize
      );

      renderCtx.fillStyle = settings.textColor;
      renderCtx.textBaseline = 'top';

      for (const c of chars) {
        renderCtx.font = `${c.fontSize}px ${settings.fontFamily}`;
        renderCtx.fillText(c.char, c.x, c.y);
      }
    }

    if (settings.halftoneOverlay) {
      applyHalftoneOverlay(
        renderCtx,
        renderW,
        renderH,
        settings.halftoneDotSize ?? 4,
        settings.halftoneDotSpacing ?? 6
      );
    }

    if (useHires) {
      ctx.clearRect(0, 0, displayW, displayH);
      ctx.drawImage(getHires(), 0, 0, rw, rh, 0, 0, displayW, displayH);
    }
  }, [videoRef, imageRef, canvasRef, settings, getOffscreen, getHires, mediaLayer, renderScale]);

  const renderExportFrame = useCallback(
    (
      exportW: number,
      exportH: number,
      overrides?: { transparent?: boolean },
    ): HTMLCanvasElement | null => {
      const video = videoRef.current;
      const image = imageRef?.current;
      const canvas = canvasRef.current;

      type MediaSource = HTMLVideoElement | HTMLImageElement;
      let source: MediaSource | null = null;
      let sourceW = 0;
      let sourceH = 0;

      if (image && image.naturalWidth > 0) {
        source = image;
        sourceW = image.naturalWidth;
        sourceH = image.naturalHeight;
      } else if (video && video.readyState >= 2) {
        source = video;
        sourceW = video.videoWidth;
        sourceH = video.videoHeight;
      }
      if (!source) return null;

      const target = document.createElement('canvas');
      target.width = exportW;
      target.height = exportH;
      const ctx = target.getContext('2d');
      if (!ctx) return null;

      const sampler = document.createElement('canvas');
      sampler.width = exportW;
      sampler.height = exportH;
      const sCtx = sampler.getContext('2d');
      if (!sCtx) return null;

      const useTransparent = overrides?.transparent ?? settings.transparentBg;

      if (useTransparent) {
        sCtx.clearRect(0, 0, exportW, exportH);
      } else {
        sCtx.fillStyle = settings.bgColor;
        sCtx.fillRect(0, 0, exportW, exportH);
      }

      if (mediaLayer && canvas) {
        const scaleX = exportW / canvas.width;
        const scaleY = exportH / canvas.height;
        sCtx.drawImage(
          source,
          mediaLayer.x * scaleX,
          mediaLayer.y * scaleY,
          mediaLayer.w * scaleX,
          mediaLayer.h * scaleY,
        );
      } else {
        const mediaAR = sourceW / sourceH;
        const canvasAR = exportW / exportH;
        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (mediaAR > canvasAR) {
          drawW = exportW; drawH = exportW / mediaAR; drawX = 0; drawY = (exportH - drawH) / 2;
        } else {
          drawH = exportH; drawW = exportH * mediaAR; drawX = (exportW - drawW) / 2; drawY = 0;
        }
        sCtx.drawImage(source, drawX, drawY, drawW, drawH);
      }

      const imgData = sCtx.getImageData(0, 0, exportW, exportH);

      if (useTransparent) {
        ctx.clearRect(0, 0, exportW, exportH);
      } else {
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, exportW, exportH);
      }

      const cellW = settings.gridDensity;
      const cellH = Math.floor(cellW * 1.8);

      if (settings.mode === 'charGrid') {
        ctx.font = `${settings.fontSize}px ${settings.fontFamily}`;
        ctx.fillStyle = settings.textColor;
        ctx.textBaseline = 'top';
        const cols = Math.floor(exportW / cellW);
        const rows = Math.floor(exportH / cellH);
        const useSolidBg = settings.solidBackground ?? false;
        const threshold = settings.brightnessThreshold;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const brightness = sampleBrightness(imgData, col * cellW, row * cellH, cellW, cellH);
            if (useSolidBg && brightness > threshold) continue;
            const char = getCharForBrightness(brightness, settings.charSet);
            ctx.fillText(char, col * cellW, row * cellH);
          }
        }
      } else {
        const chars = generateWordFill(
          imgData, exportW, exportH, settings.fillerText, cellW, cellH,
          settings.brightnessThreshold, settings.fontSize,
        );
        ctx.fillStyle = settings.textColor;
        ctx.textBaseline = 'top';
        for (const c of chars) {
          ctx.font = `${c.fontSize}px ${settings.fontFamily}`;
          ctx.fillText(c.char, c.x, c.y);
        }
      }

      if (settings.halftoneOverlay) {
        applyHalftoneOverlay(
          ctx, exportW, exportH,
          settings.halftoneDotSize ?? 4,
          settings.halftoneDotSpacing ?? 6,
        );
      }

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
      const video = videoRef.current;
      const image = imageRef?.current;
      const canvas = canvasRef.current;

      type MediaSource = HTMLVideoElement | HTMLImageElement;
      let source: MediaSource | null = null;
      let sourceW = 0;
      let sourceH = 0;

      if (image && image.naturalWidth > 0) {
        source = image;
        sourceW = image.naturalWidth;
        sourceH = image.naturalHeight;
      } else if (video && video.readyState >= 2) {
        source = video;
        sourceW = video.videoWidth;
        sourceH = video.videoHeight;
      }
      if (!source) return null;

      const offscreen = document.createElement('canvas');
      offscreen.width = exportW;
      offscreen.height = exportH;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return null;
      offCtx.clearRect(0, 0, exportW, exportH);

      if (mediaLayer && canvas) {
        const scaleX = exportW / canvas.width;
        const scaleY = exportH / canvas.height;
        offCtx.drawImage(
          source,
          mediaLayer.x * scaleX,
          mediaLayer.y * scaleY,
          mediaLayer.w * scaleX,
          mediaLayer.h * scaleY,
        );
      } else {
        const mediaAR = sourceW / sourceH;
        const canvasAR = exportW / exportH;
        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (mediaAR > canvasAR) {
          drawW = exportW; drawH = exportW / mediaAR; drawX = 0; drawY = (exportH - drawH) / 2;
        } else {
          drawH = exportH; drawW = exportH * mediaAR; drawX = (exportW - drawW) / 2; drawY = 0;
        }
        offCtx.drawImage(source, drawX, drawY, drawW, drawH);
      }

      const imgData = offCtx.getImageData(0, 0, exportW, exportH);
      const useTransparent = overrides?.transparent ?? settings.transparentBg;
      const responsive = overrides?.responsive ?? false;

      const cellW = settings.gridDensity;
      const cellH = Math.floor(cellW * 1.8);
      const escXml = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      let svg = responsive
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${exportW} ${exportH}">\n`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}">\n`;

      if (!useTransparent) {
        svg += `  <rect width="${exportW}" height="${exportH}" fill="${escXml(settings.bgColor)}"/>\n`;
      }

      svg += `  <g fill="${escXml(settings.textColor)}" font-family="${escXml(settings.fontFamily)}" font-size="${settings.fontSize}" dominant-baseline="text-before-edge">\n`;

      if (settings.mode === 'charGrid') {
        const cols = Math.floor(exportW / cellW);
        const rows = Math.floor(exportH / cellH);
        const useSolidBg = settings.solidBackground ?? false;
        const threshold = settings.brightnessThreshold;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const brightness = sampleBrightness(imgData, col * cellW, row * cellH, cellW, cellH);
            if (useSolidBg && brightness > threshold) continue;
            const char = getCharForBrightness(brightness, settings.charSet);
            if (char === ' ') continue;
            svg += `    <text x="${col * cellW}" y="${row * cellH}">${escXml(char)}</text>\n`;
          }
        }
      } else {
        const chars = generateWordFill(
          imgData, exportW, exportH, settings.fillerText, cellW, cellH,
          settings.brightnessThreshold, settings.fontSize,
        );
        for (const c of chars) {
          svg += `    <text x="${c.x}" y="${c.y}" font-size="${c.fontSize}">${escXml(c.char)}</text>\n`;
        }
      }

      svg += `  </g>\n</svg>`;
      return svg;
    },
    [videoRef, imageRef, canvasRef, settings, mediaLayer],
  );

  const generateSVG = useCallback((): string | null => {
    const video = videoRef.current;
    const image = imageRef?.current;
    const canvas = canvasRef.current;
    if (!canvas) return null;

    type MediaSource = HTMLVideoElement | HTMLImageElement;
    let source: MediaSource | null = null;
    let sourceW = 0;
    let sourceH = 0;

    if (image && image.naturalWidth > 0) {
      source = image;
      sourceW = image.naturalWidth;
      sourceH = image.naturalHeight;
    } else if (video && video.readyState >= 2) {
      source = video;
      sourceW = video.videoWidth;
      sourceH = video.videoHeight;
    }

    if (!source) return null;

    const w = canvas.width;
    const h = canvas.height;

    const offscreen = getOffscreen();
    offscreen.width = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return null;

    offCtx.clearRect(0, 0, w, h);

    if (mediaLayer) {
      offCtx.drawImage(source, mediaLayer.x, mediaLayer.y, mediaLayer.w, mediaLayer.h);
    } else {
      const mediaAR = sourceW / sourceH;
      const canvasAR = w / h;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (mediaAR > canvasAR) {
        drawW = w; drawH = w / mediaAR; drawX = 0; drawY = (h - drawH) / 2;
      } else {
        drawH = h; drawW = h * mediaAR; drawX = (w - drawW) / 2; drawY = 0;
      }
      offCtx.drawImage(source, drawX, drawY, drawW, drawH);
    }
    const imageData = offCtx.getImageData(0, 0, w, h);

    const cellW = settings.gridDensity;
    const cellH = Math.floor(cellW * 1.8);
    const escXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n`;

    if (!settings.transparentBg) {
      svgContent += `  <rect width="${w}" height="${h}" fill="${escXml(settings.bgColor)}"/>\n`;
    }

    svgContent += `  <g fill="${escXml(settings.textColor)}" font-family="${escXml(settings.fontFamily)}" font-size="${settings.fontSize}" dominant-baseline="text-before-edge">\n`;

    if (settings.mode === 'charGrid') {
      const cols = Math.floor(w / cellW);
      const rows = Math.floor(h / cellH);
      const useSolidBg = settings.solidBackground ?? false;
      const threshold = settings.brightnessThreshold;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const brightness = sampleBrightness(imageData, col * cellW, row * cellH, cellW, cellH);
          if (useSolidBg && brightness > threshold) continue;
          const char = getCharForBrightness(brightness, settings.charSet);
          if (char === ' ') continue;
          svgContent += `    <text x="${col * cellW}" y="${row * cellH}">${escXml(char)}</text>\n`;
        }
      }
    } else {
      const chars = generateWordFill(
        imageData, w, h, settings.fillerText, cellW, cellH,
        settings.brightnessThreshold, settings.fontSize
      );
      for (const c of chars) {
        svgContent += `    <text x="${c.x}" y="${c.y}" font-size="${c.fontSize}">${escXml(c.char)}</text>\n`;
      }
    }

    svgContent += `  </g>\n</svg>`;
    return svgContent;
  }, [videoRef, imageRef, canvasRef, settings, getOffscreen, mediaLayer]);

  useEffect(() => {
    if (!isPlaying) {
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
  }, [isPlaying, renderFrame]);

  return { renderFrame, generateSVG, renderExportFrame, generateSVGAtSize };
}
