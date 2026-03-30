"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, ImageIcon, Video, FileWarning } from "lucide-react";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];
const VIDEO_TYPES_PREFIX = "video/";
const ACCEPT = "video/*,image/jpeg,image/png,image/svg+xml";

interface MediaDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
  className?: string;
}

export function MediaDropzone({
  onFilesSelected,
  compact = false,
  className,
}: MediaDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).filter(
        (f) =>
          IMAGE_TYPES.includes(f.type) ||
          f.type.startsWith(VIDEO_TYPES_PREFIX),
      );
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      e.target.value = "";
    },
    [processFiles],
  );

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-sm border-2 border-dashed transition-colors cursor-pointer select-none",
        isDragging
          ? "border-accent bg-accent/5 border-solid"
          : "border-border hover:border-muted-foreground hover:bg-muted/30",
        compact ? "p-6" : "p-12",
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileInput}
        className="hidden"
        tabIndex={-1}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        {isDragging ? (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-sm bg-accent/10">
              <Upload className="w-7 h-7 text-accent" />
            </div>
            <p className="text-sm font-medium text-accent">Drop to upload</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-sm bg-muted">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drag and drop media here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            {!compact && (
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-muted text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  JPG, PNG, SVG
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-muted text-xs text-muted-foreground">
                  <Video className="w-3 h-3" />
                  MP4, WebM
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
