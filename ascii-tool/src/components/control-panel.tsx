"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { AsciiSettings } from "@/hooks/use-ascii-renderer";
import { ButtonSelect, ButtonSelectItem } from "@/components/ui/button-select";
import { ColorPicker } from "@/components/ui/color-picker";
import { Slider } from "@/components/ui/slider";
import { ScrubInput } from "@/components/ui/scrub-input";
import { FONT_OPTIONS, loadGoogleFont } from "@/lib/fonts";

interface ControlPanelProps {
  settings: AsciiSettings;
  onSettingsChange: (settings: AsciiSettings) => void;
  className?: string;
}

const MODE_OPTIONS = [
  { value: "charGrid", label: "Characters" },
  { value: "wordFill", label: "Word Fill" },
];

export function ControlPanel({ settings, onSettingsChange, className }: ControlPanelProps) {
  const update = <K extends keyof AsciiSettings>(key: K, value: AsciiSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  useEffect(() => {
    FONT_OPTIONS.forEach((f) => {
      if ("googleFont" in f && f.googleFont) loadGoogleFont(f.googleFont);
    });
  }, []);

  const handleFontChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      const option = FONT_OPTIONS.find((f) => f.value === val);
      if (option && "googleFont" in option && option.googleFont) loadGoogleFont(option.googleFont);
      update("fontFamily", val);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings],
  );

  return (
    <div className={cn("flex flex-col gap-0 overflow-y-auto h-full", className)}>
      <div className="px-4 py-3 border-b border-panel-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Controls</h3>
      </div>

      {/* Mode */}
      <Section label="Mode">
        <ButtonSelect
          value={settings.mode}
          onValueChange={(v) => update("mode", v as AsciiSettings["mode"])}
          fullWidth
          size="sm"
        >
          {MODE_OPTIONS.map((opt) => (
            <ButtonSelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </ButtonSelectItem>
          ))}
        </ButtonSelect>
      </Section>

      {/* Text Settings */}
      <Section label={settings.mode === "charGrid" ? "Character Set" : "Filler Text"}>
        {settings.mode === "charGrid" ? (
          <input
            type="text"
            value={settings.charSet}
            onChange={(e) => update("charSet", e.target.value)}
            placeholder="Characters dark → light"
            className="w-full h-8 px-3 text-sm font-mono text-foreground bg-surface border border-border rounded-sm transition-colors hover:border-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        ) : (
          <textarea
            value={settings.fillerText}
            onChange={(e) => update("fillerText", e.target.value)}
            placeholder="Enter text to fill..."
            rows={3}
            className="w-full px-3 py-2 text-sm font-mono text-foreground bg-surface border border-border rounded-sm resize-none transition-colors hover:border-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        )}
      </Section>

      {/* Colors */}
      <Section label="Colors">
        <div className="flex gap-4">
          <ColorPicker label="Text" value={settings.textColor} onChange={(c) => update("textColor", c)} />
          {!settings.transparentBg && (
            <ColorPicker label="Background" value={settings.bgColor} onChange={(c) => update("bgColor", c)} />
          )}
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.transparentBg ?? false}
            onChange={(e) => update("transparentBg", e.target.checked)}
            className="w-4 h-4 rounded-sm border-border accent-accent"
          />
          <span className="text-sm text-foreground">Transparent</span>
        </label>
      </Section>

      {/* Background */}
      <Section label="Background">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.solidBackground ?? false}
            onChange={(e) => update("solidBackground", e.target.checked)}
            className="w-4 h-4 rounded-sm border-border accent-accent"
          />
          <span className="text-sm text-foreground">Solid background</span>
        </label>
        {settings.solidBackground && (
          <p className="text-xs text-muted-foreground mt-1">
            Bright areas are left as the solid background color.
          </p>
        )}
      </Section>

      {/* Brightness Threshold */}
      {(settings.solidBackground || settings.mode === "wordFill") && (
        <Section label="Brightness Threshold">
          <Slider
            value={settings.brightnessThreshold}
            onChange={(v) => update("brightnessThreshold", v)}
            min={0}
            max={255}
            step={1}
            showValue
          />
        </Section>
      )}

      {/* Font */}
      <Section label="Font">
        <select
          value={settings.fontFamily}
          onChange={handleFontChange}
          className="w-full h-8 px-3 text-sm text-foreground bg-surface border border-border rounded-sm cursor-pointer transition-colors hover:border-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </Section>

      {/* Font Size + Grid */}
      <Section label="Size & Density">
        <div className="flex gap-3">
          <ScrubInput
            label="Size"
            value={settings.fontSize}
            onChange={(v) => update("fontSize", v)}
            min={4}
            max={32}
            step={1}
            suffix="px"
          />
          <ScrubInput
            label="Grid"
            value={settings.gridDensity}
            onChange={(v) => update("gridDensity", v)}
            min={3}
            max={24}
            step={1}
            suffix="px"
          />
        </div>
      </Section>

      {/* Post Effects */}
      <Section label="Post Effects">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.halftoneOverlay ?? false}
            onChange={(e) => update("halftoneOverlay", e.target.checked)}
            className="w-4 h-4 rounded-sm border-border accent-accent"
          />
          <span className="text-sm text-foreground">Halftone Overlay</span>
        </label>
        {settings.halftoneOverlay && (
          <div className="flex flex-col gap-3 mt-3">
            <Slider
              label="Dot Size"
              value={settings.halftoneDotSize ?? 4}
              onChange={(v) => update("halftoneDotSize", v)}
              min={2}
              max={16}
              step={1}
              showValue
              suffix="px"
            />
            <Slider
              label="Dot Spacing"
              value={settings.halftoneDotSpacing ?? 6}
              onChange={(v) => update("halftoneDotSpacing", v)}
              min={3}
              max={24}
              step={1}
              showValue
              suffix="px"
            />
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-panel-border">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
        {label}
      </h4>
      {children}
    </div>
  );
}
