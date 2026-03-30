"use client";
import { forwardRef, useCallback, useRef, useState } from "react";
import styles from "./Dropzone.module.scss";

export interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  maxSize?: number;
}

export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      accept,
      multiple = false,
      onFiles,
      disabled = false,
      className,
      children,
      maxSize,
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        dragCounter.current++;
        if (dragCounter.current === 1) setIsDragging(true);
      },
      [disabled],
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragging(false);
    }, []);

    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) e.dataTransfer.dropEffect = "copy";
      },
      [disabled],
    );

    const processFiles = useCallback(
      (fileList: FileList) => {
        let files = Array.from(fileList);
        if (accept) {
          const types = accept.split(",").map((t) => t.trim());
          files = files.filter((f) =>
            types.some((t) => {
              if (t.endsWith("/*")) return f.type.startsWith(t.replace("/*", "/"));
              return f.type === t || f.name.endsWith(t);
            }),
          );
        }
        if (maxSize) {
          files = files.filter((f) => f.size <= maxSize);
        }
        if (!multiple) files = files.slice(0, 1);
        if (files.length > 0) onFiles(files);
      },
      [accept, multiple, maxSize, onFiles],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);
        if (disabled) return;
        processFiles(e.dataTransfer.files);
      },
      [disabled, processFiles],
    );

    const handleClick = useCallback(() => {
      if (disabled) return;
      fileInputRef.current?.click();
    }, [disabled]);

    const handleFileInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
        e.target.value = "";
      },
      [processFiles],
    );

    const wrapperCls = [
      styles.wrapper,
      isDragging && styles.dragging,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={wrapperCls}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
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
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className={styles.hiddenInput}
          tabIndex={-1}
        />
        {children || (
          <div className={styles.defaultContent}>
            <svg
              className={styles.icon}
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M20 6v20M12 14l8-8 8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 28v4a2 2 0 002 2h24a2 2 0 002-2v-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className={styles.prompt}>
              Drag and drop files here, or click to browse
            </p>
            {accept && (
              <p className={styles.hint}>
                Accepted: {accept}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Dropzone.displayName = "Dropzone";
