"use client";
import { cn } from "@/lib/utils";
import { Undo2, Redo2, RotateCcw, Shuffle } from "lucide-react";
import { ButtonSelect, ButtonSelectItem } from "@/components/ui/button-select";

const ASPECT_PRESETS = [
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
  { value: "custom", label: "Custom" },
];

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canvasWidth: number;
  canvasHeight: number;
  aspectPreset: string;
  onAspectPresetChange: (value: string) => void;
  onCanvasWidthChange: (w: number) => void;
  onCanvasHeightChange: (h: number) => void;
  hasMedia: boolean;
  onResetLayer: () => void;
  onRandomize?: () => void;
  className?: string;
}

export function Toolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  canvasWidth,
  canvasHeight,
  aspectPreset,
  onAspectPresetChange,
  onCanvasWidthChange,
  onCanvasHeightChange,
  hasMedia,
  onResetLayer,
  onRandomize,
  className,
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-toolbar border-b border-border",
        className,
      )}
    >
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      <ButtonSelect
        value={aspectPreset}
        onValueChange={onAspectPresetChange}
        size="sm"
      >
        {ASPECT_PRESETS.map((p) => (
          <ButtonSelectItem key={p.value} value={p.value}>
            {p.label}
          </ButtonSelectItem>
        ))}
      </ButtonSelect>

      <div className="flex items-center gap-1.5 ml-2">
        <label className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">W</span>
          <input
            type="number"
            min={100}
            max={3840}
            value={canvasWidth}
            onChange={(e) => onCanvasWidthChange(Number(e.target.value))}
            className="w-16 h-7 px-2 text-xs font-mono text-foreground bg-surface border border-border rounded-sm text-center focus:outline-none focus:border-accent"
          />
        </label>
        <span className="text-xs text-muted-foreground">×</span>
        <label className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">H</span>
          <input
            type="number"
            min={100}
            max={3840}
            value={canvasHeight}
            onChange={(e) => onCanvasHeightChange(Number(e.target.value))}
            className="w-16 h-7 px-2 text-xs font-mono text-foreground bg-surface border border-border rounded-sm text-center focus:outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {onRandomize && (
          <button
            type="button"
            onClick={onRandomize}
            className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
            title="Randomize parameters"
          >
            <Shuffle className="w-3 h-3" />
            Randomize
          </button>
        )}
        {hasMedia && (
          <button
            type="button"
            onClick={onResetLayer}
            className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
