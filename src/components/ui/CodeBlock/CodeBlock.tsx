"use client";
import { forwardRef, useState, useCallback } from "react";
import styles from "./CodeBlock.module.scss";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showCopy?: boolean;
  showDownload?: boolean;
  onDownload?: () => void;
  maxHeight?: number;
  className?: string;
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      filename,
      showCopy = true,
      showDownload = false,
      onDownload,
      maxHeight,
      className,
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [code]);

    const handleDownloadClick = useCallback(() => {
      if (onDownload) {
        onDownload();
        return;
      }
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "code.txt";
      a.click();
      URL.revokeObjectURL(url);
    }, [code, filename, onDownload]);

    return (
      <div
        ref={ref}
        className={[styles.wrapper, className].filter(Boolean).join(" ")}
      >
        {(filename || showCopy || showDownload) && (
          <div className={styles.header}>
            {filename && <span className={styles.filename}>{filename}</span>}
            <div className={styles.actions}>
              {showCopy && (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
              {showDownload && (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleDownloadClick}
                >
                  Download
                </button>
              )}
            </div>
          </div>
        )}
        <div
          className={styles.codeWrap}
          style={maxHeight ? { maxHeight } : undefined}
        >
          <pre className={styles.pre}>
            <code className={styles.code} data-language={language}>
              {code}
            </code>
          </pre>
        </div>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";
