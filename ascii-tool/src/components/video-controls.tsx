"use client";
import { cn } from "@/lib/utils";
import { Play, Pause, Upload } from "lucide-react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  hasMedia: boolean;
  mediaType: "video" | "image" | null;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onUploadNew: () => void;
  className?: string;
}

export function VideoControls({
  isPlaying,
  currentTime,
  duration,
  hasMedia,
  mediaType,
  onPlayPause,
  onSeek,
  onUploadNew,
  className,
}: VideoControlsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-toolbar border-t border-border min-h-[44px]",
        className,
      )}
    >
      {hasMedia && mediaType === "video" && (
        <>
          <button
            type="button"
            onClick={onPlayPause}
            className="flex items-center justify-center w-8 h-8 rounded-sm text-foreground hover:bg-muted transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <input
            type="range"
            className="flex-1 h-1 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
          />
        </>
      )}
      <div className="flex-1" />
      {hasMedia && (
        <button
          type="button"
          onClick={onUploadNew}
          className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground rounded-sm transition-colors"
        >
          <Upload className="w-3 h-3" />
          Upload New
        </button>
      )}
    </div>
  );
}
