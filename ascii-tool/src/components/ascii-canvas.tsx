"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  useAsciiRenderer,
  type AsciiSettings,
} from "@/hooks/use-ascii-renderer";
import type {
  VideoTransformHook,
  ResizeCorner,
  SnapGuide,
} from "@/hooks/use-video-transform";
import { cn } from "@/lib/utils";

interface AsciiCanvasProps {
  videoSrc: string | null;
  imageSrc: string | null;
  settings: AsciiSettings;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  onTimeUpdate: (time: number, duration: number) => void;
  width?: number;
  height?: number;
  videoTransform?: VideoTransformHook;
  renderScale?: number;
  onMediaLoaded?: (width: number, height: number) => void;
}

export interface AsciiCanvasHandle {
  seekTo: (time: number) => void;
  exportBlob: (
    width: number,
    height: number,
    format: "image/png" | "image/jpeg",
    quality: number,
    transparent: boolean,
  ) => Promise<Blob | null>;
  exportSVG: (
    width: number,
    height: number,
    transparent: boolean,
    responsive: boolean,
  ) => string | null;
  play: () => void;
  pause: () => void;
}

const CORNERS: ResizeCorner[] = ["nw", "ne", "sw", "se"];

const cornerPositionClasses: Record<ResizeCorner, string> = {
  nw: "-top-1 -left-1 cursor-nw-resize",
  ne: "-top-1 -right-1 cursor-ne-resize",
  sw: "-bottom-1 -left-1 cursor-sw-resize",
  se: "-bottom-1 -right-1 cursor-se-resize",
};

export const AsciiCanvas = forwardRef<AsciiCanvasHandle, AsciiCanvasProps>(
  function AsciiCanvas(
    {
      videoSrc,
      imageSrc,
      settings,
      isPlaying,
      onPlayStateChange,
      onTimeUpdate,
      width = 640,
      height = 360,
      videoTransform,
      renderScale = 1,
      onMediaLoaded,
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const mediaLoadedSrcRef = useRef<string | null>(null);

    const { renderFrame, renderExportFrame, generateSVGAtSize } =
      useAsciiRenderer({
        videoRef,
        imageRef,
        canvasRef,
        settings,
        isPlaying,
        mediaLayer: videoTransform?.layer,
        renderScale,
      });

    useEffect(() => {
      const el = stageRef.current;
      if (!el || !videoTransform) return;
      const update = () => {
        const displayWidth = el.clientWidth;
        if (displayWidth > 0 && width > 0) {
          videoTransform.setDisplayScale(displayWidth / width);
        }
      };
      const observer = new ResizeObserver(update);
      observer.observe(el);
      update();
      return () => observer.disconnect();
    }, [width, videoTransform]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () =>
        onTimeUpdate(video.currentTime, video.duration || 0);
      const handleEnded = () => onPlayStateChange(false);
      const handleLoadedData = () => {
        renderFrame();
        if (
          onMediaLoaded &&
          video.videoWidth > 0 &&
          mediaLoadedSrcRef.current !== videoSrc
        ) {
          mediaLoadedSrcRef.current = videoSrc;
          onMediaLoaded(video.videoWidth, video.videoHeight);
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("loadeddata", handleLoadedData);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("loadeddata", handleLoadedData);
      };
    }, [videoSrc, onTimeUpdate, onPlayStateChange, renderFrame, onMediaLoaded]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !videoSrc) return;
      if (isPlaying) {
        video.play().catch(() => onPlayStateChange(false));
      } else {
        video.pause();
      }
    }, [isPlaying, videoSrc, onPlayStateChange]);

    useEffect(() => {
      const img = imageRef.current;
      if (!img || !imageSrc) return;
      const handleLoad = () => {
        renderFrame();
        if (
          onMediaLoaded &&
          img.naturalWidth > 0 &&
          mediaLoadedSrcRef.current !== imageSrc
        ) {
          mediaLoadedSrcRef.current = imageSrc;
          onMediaLoaded(img.naturalWidth, img.naturalHeight);
        }
      };
      img.addEventListener("load", handleLoad);
      if (img.complete && img.naturalWidth > 0) handleLoad();
      return () => img.removeEventListener("load", handleLoad);
    }, [imageSrc, renderFrame, onMediaLoaded]);

    useImperativeHandle(
      ref,
      () => ({
        seekTo: (time: number) => {
          const video = videoRef.current;
          if (video) {
            video.currentTime = time;
            setTimeout(renderFrame, 50);
          }
        },
        exportBlob: (w, h, format, quality, transparent) => {
          return new Promise<Blob | null>((resolve) => {
            const target = renderExportFrame(w, h, { transparent });
            if (!target) {
              resolve(null);
              return;
            }
            target.toBlob((blob) => resolve(blob), format, quality);
          });
        },
        exportSVG: (w, h, transparent, responsive) => {
          return generateSVGAtSize(w, h, { transparent, responsive });
        },
        play: () => {
          videoRef.current?.play();
          onPlayStateChange(true);
        },
        pause: () => {
          videoRef.current?.pause();
          onPlayStateChange(false);
        },
      }),
      [onPlayStateChange, renderFrame, renderExportFrame, generateSVGAtSize],
    );

    const layer = videoTransform?.layer;
    const hasTransform = !!videoTransform;

    return (
      <div className="relative flex flex-col items-center">
        <div
          ref={stageRef}
          className="relative bg-canvas-bg rounded-sm overflow-hidden shadow-md"
          style={{ aspectRatio: `${width}/${height}` }}
        >
          <video
            ref={videoRef}
            src={videoSrc || undefined}
            muted
            playsInline
            crossOrigin="anonymous"
            className="hidden"
          />
          <img
            ref={imageRef}
            src={imageSrc || undefined}
            crossOrigin="anonymous"
            className="hidden"
            alt=""
          />
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
            width={width}
            height={height}
          />

          {videoTransform?.snapGuides?.map((guide: SnapGuide, i: number) => (
            <div
              key={`${guide.axis}-${i}`}
              className={cn(
                "absolute pointer-events-none",
                guide.axis === "x"
                  ? "top-0 bottom-0 w-px bg-accent/60"
                  : "left-0 right-0 h-px bg-accent/60",
              )}
              style={
                guide.axis === "x"
                  ? { left: `${(guide.position / width) * 100}%` }
                  : { top: `${(guide.position / height) * 100}%` }
              }
            />
          ))}

          {hasTransform && layer && (
            <div
              className={cn(
                "absolute",
                videoTransform.isSelected ? "cursor-grab" : "cursor-pointer",
              )}
              style={{
                left: `${(layer.x / width) * 100}%`,
                top: `${(layer.y / height) * 100}%`,
                width: `${(layer.w / width) * 100}%`,
                height: `${(layer.h / height) * 100}%`,
              }}
              {...videoTransform.handlers}
            >
              <div
                className={cn(
                  "absolute inset-0 border transition-colors",
                  videoTransform.isSelected
                    ? "border-accent"
                    : "border-transparent hover:border-accent/40",
                )}
              />
              {videoTransform.isSelected &&
                CORNERS.map((corner) => (
                  <div
                    key={corner}
                    className={cn(
                      "absolute w-2.5 h-2.5 rounded-sm bg-accent border border-accent-foreground",
                      cornerPositionClasses[corner],
                    )}
                    data-resize-handle="true"
                    onPointerDown={(e) =>
                      videoTransform.handleResizeStart(e, corner)
                    }
                  />
                ))}
            </div>
          )}
        </div>

        {videoTransform?.isSelected && (
          <div className="mt-2 px-2 py-0.5 rounded-sm bg-muted text-muted-foreground text-xs font-mono">
            {width} &times; {height}
            {renderScale > 1 && (
              <span className="ml-1 text-accent">@ {renderScale}x</span>
            )}
          </div>
        )}
      </div>
    );
  },
);
