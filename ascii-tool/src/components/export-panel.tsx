"use client";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import type { AsciiCanvasHandle } from "@/components/ascii-canvas";
import type { FFmpegProgress } from "@/hooks/use-ffmpeg";

type ExportFormat = "png" | "jpeg" | "svg" | "mp4";

interface ExportPanelProps {
  canvasHandle: React.RefObject<AsciiCanvasHandle | null>;
  canvasWidth: number;
  canvasHeight: number;
  hasMedia: boolean;
  mediaType: "video" | "image" | null;
  ffmpegProgress: FFmpegProgress | null;
  ffmpegLoading: boolean;
  onExportMp4: () => void;
  className?: string;
}

export function ExportPanel({
  canvasHandle,
  canvasWidth,
  canvasHeight,
  hasMedia,
  mediaType,
  ffmpegProgress,
  ffmpegLoading,
  onExportMp4,
  className,
}: ExportPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [exporting, setExporting] = useState(false);

  const handleExportImage = useCallback(async () => {
    const handle = canvasHandle.current;
    if (!handle) return;
    setExporting(true);

    try {
      if (format === "svg") {
        const svg = handle.exportSVG(canvasWidth, canvasHeight, false, false);
        if (!svg) return;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        downloadBlob(blob, `ascii-art.svg`);
      } else {
        const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
        const quality = format === "jpeg" ? 0.92 : 1;
        const blob = await handle.exportBlob(
          canvasWidth,
          canvasHeight,
          mimeType,
          quality,
          false,
        );
        if (!blob) return;
        downloadBlob(blob, `ascii-art.${format}`);
      }
    } finally {
      setExporting(false);
    }
  }, [canvasHandle, canvasWidth, canvasHeight, format]);

  if (!hasMedia) return null;

  const formats: { value: ExportFormat; label: string }[] = [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "svg", label: "SVG" },
    ...(mediaType === "video"
      ? [{ value: "mp4" as ExportFormat, label: "MP4" }]
      : []),
  ];

  return (
    <div className={cn("border-t border-panel-border", className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        Export
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-1 p-0.5 bg-muted rounded-sm">
            {formats.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value)}
                className={cn(
                  "flex-1 h-7 text-xs font-medium rounded-sm transition-colors",
                  format === f.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            {canvasWidth} × {canvasHeight}px
          </div>

          {format === "mp4" ? (
            <div className="space-y-2">
              {ffmpegProgress && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300"
                      style={{ width: `${ffmpegProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ffmpegProgress.percent < 100
                      ? `Encoding... ${ffmpegProgress.percent}%`
                      : "Complete!"}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={onExportMp4}
                disabled={ffmpegLoading || !!ffmpegProgress}
                className="flex items-center justify-center gap-2 w-full h-9 text-sm font-medium bg-accent text-accent-foreground rounded-sm hover:brightness-95 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {ffmpegLoading ? "Loading encoder..." : "Export MP4"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleExportImage}
              disabled={exporting}
              className="flex items-center justify-center gap-2 w-full h-9 text-sm font-medium bg-accent text-accent-foreground rounded-sm hover:brightness-95 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
