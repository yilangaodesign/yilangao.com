"use client";

import { cn } from "@/lib/utils";
import type { AsciiSettings } from "@/hooks/use-ascii-renderer";

interface Preset {
  name: string;
  description: string;
  settings: Partial<AsciiSettings>;
  preview: { textColor: string; bgColor: string; char: string };
}

// Presets specify only non-default fields + explicit resets for fields
// that other presets set to non-default values.
// handlePresetApply merges these on top of current settings.
const PRESETS: Preset[] = [
  {
    name: "Matrix",
    description: "Classic green-on-black terminal",
    settings: {
      mode: "charGrid",
      textColor: "#00ff00",
      bgColor: "#000000",
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
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
      contrast: 10,
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
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
      edgeEnhancement: 30,
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
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
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
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
      fontSize: 8,
      gridDensity: 6,
      solidBackground: true,
      brightnessThreshold: 200,
      halftoneOverlay: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
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
      fontSize: 12,
      gridDensity: 10,
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
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
      halftoneOverlay: true,
      halftoneDotSize: 5,
      halftoneDotSpacing: 8,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
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
      fontFamily: '"Space Mono", monospace',
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
    },
    preview: { textColor: "#ffb000", bgColor: "#1a1000", char: "%" },
  },
  {
    name: "Dreamy",
    description: "Soft blur with transparent text",
    settings: {
      mode: "charGrid",
      textColor: "#e0d0ff",
      bgColor: "#1a1028",
      brightness: 10,
      contrast: -10,
      charOpacity: 45,
      bgBlur: 18,
      bgBlurOpacity: 80,
      overlayColor: "#6030a0",
      overlayOpacity: 15,
      overlayBlendMode: "screen",
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
    },
    preview: { textColor: "#e0d0ff", bgColor: "#1a1028", char: "~" },
  },
  {
    name: "Film Noir",
    description: "High contrast with strong edges",
    settings: {
      mode: "charGrid",
      textColor: "#d0d0d0",
      bgColor: "#0a0a0a",
      fontSize: 9,
      gridDensity: 7,
      brightness: -10,
      contrast: 50,
      edgeEnhancement: 70,
      invertMapping: true,
      halftoneOverlay: false,
      solidBackground: false,
      bgBlur: 0,
      overlayOpacity: 0,
    },
    preview: { textColor: "#d0d0d0", bgColor: "#0a0a0a", char: "#" },
  },
  {
    name: "Scatter",
    description: "Sparse dots with edge detection",
    settings: {
      mode: "dotGrid",
      textColor: "#ffffff",
      bgColor: "#111111",
      gridDensity: 10,
      contrast: 20,
      edgeEnhancement: 60,
      coverage: 50,
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
      bgBlur: 0,
      overlayOpacity: 0,
    },
    preview: { textColor: "#ffffff", bgColor: "#111111", char: "·" },
  },
  {
    name: "Neon Glow",
    description: "Color overlay with glow effect",
    settings: {
      mode: "charGrid",
      textColor: "#00ffaa",
      bgColor: "#050510",
      charSet: " .:*#@",
      fontFamily: '"Fira Code", monospace',
      contrast: 15,
      charOpacity: 80,
      bgBlur: 12,
      bgBlurOpacity: 40,
      overlayColor: "#00ff88",
      overlayOpacity: 20,
      overlayBlendMode: "screen",
      halftoneOverlay: false,
      solidBackground: false,
      invertMapping: false,
    },
    preview: { textColor: "#00ffaa", bgColor: "#050510", char: "*" },
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
