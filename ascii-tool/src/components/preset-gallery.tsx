"use client";

import { cn } from "@/lib/utils";
import type { AsciiSettings } from "@/hooks/use-ascii-renderer";

interface Preset {
  name: string;
  description: string;
  settings: Partial<AsciiSettings>;
  preview: { textColor: string; bgColor: string; char: string };
}

const PRESETS: Preset[] = [
  {
    name: "Matrix",
    description: "Classic green-on-black terminal",
    settings: {
      mode: "charGrid",
      textColor: "#00ff00",
      bgColor: "#000000",
      charSet: " .:-=+*#%@",
      fontFamily: '"Geist Mono", monospace',
      fontSize: 10,
      gridDensity: 8,
      transparentBg: false,
      solidBackground: false,
    },
    preview: { textColor: "#00ff00", bgColor: "#000000", char: "@" },
  },
  {
    name: "Typewriter",
    description: "Warm sepia tones, classic feel",
    settings: {
      mode: "charGrid",
      textColor: "#3d2b1f",
      bgColor: "#f5e6d3",
      charSet: " .,;:!?-~=+*#%@",
      fontFamily: '"Courier New", monospace',
      fontSize: 11,
      gridDensity: 9,
      transparentBg: false,
      solidBackground: false,
    },
    preview: { textColor: "#3d2b1f", bgColor: "#f5e6d3", char: "#" },
  },
  {
    name: "Blueprint",
    description: "Technical white-on-blue",
    settings: {
      mode: "charGrid",
      textColor: "#e0e8ff",
      bgColor: "#1a2744",
      charSet: " .:-+*#",
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 9,
      gridDensity: 7,
      transparentBg: false,
      solidBackground: false,
    },
    preview: { textColor: "#e0e8ff", bgColor: "#1a2744", char: "+" },
  },
  {
    name: "Neon",
    description: "Vibrant pink on dark",
    settings: {
      mode: "charGrid",
      textColor: "#ff00ff",
      bgColor: "#0a0012",
      charSet: " .:*#@",
      fontFamily: '"Fira Code", monospace',
      fontSize: 10,
      gridDensity: 8,
      transparentBg: false,
      solidBackground: false,
    },
    preview: { textColor: "#ff00ff", bgColor: "#0a0012", char: "*" },
  },
  {
    name: "Minimal",
    description: "Subtle gray on white",
    settings: {
      mode: "charGrid",
      textColor: "#393939",
      bgColor: "#ffffff",
      charSet: " .:-=+*#%@",
      fontFamily: '"Geist Mono", monospace',
      fontSize: 8,
      gridDensity: 6,
      transparentBg: false,
      solidBackground: true,
      brightnessThreshold: 200,
    },
    preview: { textColor: "#393939", bgColor: "#ffffff", char: "." },
  },
  {
    name: "Word Art",
    description: "Fill shapes with custom text",
    settings: {
      mode: "wordFill",
      textColor: "#161616",
      bgColor: "#f4f4f4",
      fillerText: "HELLO WORLD ",
      fontFamily: '"Geist Mono", monospace',
      fontSize: 12,
      gridDensity: 10,
      brightnessThreshold: 128,
      transparentBg: false,
    },
    preview: { textColor: "#161616", bgColor: "#f4f4f4", char: "A" },
  },
  {
    name: "Halftone",
    description: "Dot overlay effect",
    settings: {
      mode: "charGrid",
      textColor: "#ffffff",
      bgColor: "#000000",
      charSet: " .:-=+*#%@",
      fontFamily: '"Geist Mono", monospace',
      fontSize: 10,
      gridDensity: 8,
      halftoneOverlay: true,
      halftoneDotSize: 5,
      halftoneDotSpacing: 8,
      transparentBg: false,
      solidBackground: false,
    },
    preview: { textColor: "#ffffff", bgColor: "#000000", char: "●" },
  },
  {
    name: "Amber",
    description: "Retro amber monitor",
    settings: {
      mode: "charGrid",
      textColor: "#ffb000",
      bgColor: "#1a1000",
      charSet: " .:-=+*#%@",
      fontFamily: '"Space Mono", monospace',
      fontSize: 10,
      gridDensity: 8,
      transparentBg: false,
      solidBackground: false,
    },
    preview: { textColor: "#ffb000", bgColor: "#1a1000", char: "%" },
  },
];

interface PresetGalleryProps {
  onApply: (settings: Partial<AsciiSettings>) => void;
  className?: string;
}

export function PresetGallery({ onApply, className }: PresetGalleryProps) {
  return (
    <div className={cn("px-4 py-3 border-b border-panel-border", className)}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
        Presets
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onApply(preset.settings)}
            className="group flex items-center gap-2.5 p-2 rounded-sm border border-border hover:border-muted-foreground transition-colors text-left"
            title={preset.description}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-sm text-xs font-mono font-bold shrink-0"
              style={{
                backgroundColor: preset.preview.bgColor,
                color: preset.preview.textColor,
              }}
            >
              {preset.preview.char}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {preset.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {preset.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
