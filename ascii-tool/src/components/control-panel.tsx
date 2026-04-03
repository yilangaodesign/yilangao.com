"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { AsciiSettings, BlendMode } from "@/hooks/use-ascii-renderer";
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
  { value: "dotGrid", label: "Dot Grid" },
];

const BLEND_MODE_OPTIONS: { value: BlendMode; label: string }[] = [
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "soft-light", label: "Soft Light" },
  { value: "hard-light", label: "Hard Light" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
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

  const showTextSettings = settings.mode !== "dotGrid";

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

      {/* Text Settings (hidden for dotGrid) */}
      {showTextSettings && (
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
      )}

      {/* Image Adjustments */}
      <Section label="Image Adjustments">
        <div className="flex flex-col gap-3">
          <Slider
            label="Brightness"
            value={settings.brightness}
            onChange={(v) => update("brightness", v)}
            min={-100}
            max={100}
            step={1}
            showValue
          />
          <Slider
            label="Contrast"
            value={settings.contrast}
            onChange={(v) => update("contrast", v)}
            min={-100}
            max={100}
            step={1}
            showValue
          />
          <Slider
            label="Edge Enhancement"
            value={settings.edgeEnhancement}
            onChange={(v) => update("edgeEnhancement", v)}
            min={0}
            max={100}
            step={1}
            showValue
          />
        </div>
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

      {/* Rendering */}
      <Section label="Rendering">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.invertMapping}
              onChange={(e) => update("invertMapping", e.target.checked)}
              className="w-4 h-4 rounded-sm border-border accent-accent"
            />
            <span className="text-sm text-foreground">Invert Mapping</span>
          </label>
          <Slider
            label="Coverage"
            value={settings.coverage}
            onChange={(v) => update("coverage", v)}
            min={0}
            max={100}
            step={1}
            showValue
            suffix="%"
          />
          <Slider
            label="Character Opacity"
            value={settings.charOpacity}
            onChange={(v) => update("charOpacity", v)}
            min={0}
            max={100}
            step={1}
            showValue
            suffix="%"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.solidBackground ?? false}
              onChange={(e) => update("solidBackground", e.target.checked)}
              className="w-4 h-4 rounded-sm border-border accent-accent"
            />
            <span className="text-sm text-foreground">Solid background</span>
          </label>
          {(settings.solidBackground || settings.mode === "wordFill") && (
            <Slider
              label="Brightness Threshold"
              value={settings.brightnessThreshold}
              onChange={(v) => update("brightnessThreshold", v)}
              min={0}
              max={255}
              step={1}
              showValue
            />
          )}
        </div>
      </Section>

      {/* Size & Density */}
      <Section label="Size & Density">
        <div className="flex gap-3">
          {showTextSettings && (
            <ScrubInput
              label="Size"
              value={settings.fontSize}
              onChange={(v) => update("fontSize", v)}
              min={4}
              max={32}
              step={1}
              suffix="px"
            />
          )}
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

      {/* Font (hidden for dotGrid) */}
      {showTextSettings && (
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
      )}

      {/* Background Layer */}
      <Section label="Background Layer">
        <div className="flex flex-col gap-3">
          <Slider
            label="Blur"
            value={settings.bgBlur}
            onChange={(v) => update("bgBlur", v)}
            min={0}
            max={40}
            step={1}
            showValue
            suffix="px"
          />
          {settings.bgBlur > 0 && (
            <Slider
              label="Blur Opacity"
              value={settings.bgBlurOpacity}
              onChange={(v) => update("bgBlurOpacity", v)}
              min={0}
              max={100}
              step={1}
              showValue
              suffix="%"
            />
          )}
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

      {/* Color Overlay */}
      <Section label="Color Overlay">
        <div className="flex flex-col gap-3">
          <Slider
            label="Opacity"
            value={settings.overlayOpacity}
            onChange={(v) => update("overlayOpacity", v)}
            min={0}
            max={100}
            step={1}
            showValue
            suffix="%"
          />
          {settings.overlayOpacity > 0 && (
            <>
              <div className="flex items-center gap-3">
                <ColorPicker label="Color" value={settings.overlayColor} onChange={(c) => update("overlayColor", c)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Blend Mode</label>
                <select
                  value={settings.overlayBlendMode}
                  onChange={(e) => update("overlayBlendMode", e.target.value as BlendMode)}
                  className="w-full h-8 px-3 text-sm text-foreground bg-surface border border-border rounded-sm cursor-pointer transition-colors hover:border-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  {BLEND_MODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Animation */}
      <Section label="Animation">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.animate}
            onChange={(e) => update("animate", e.target.checked)}
            className="w-4 h-4 rounded-sm border-border accent-accent"
          />
          <span className="text-sm text-foreground">Animate</span>
        </label>
        {settings.animate && (
          <div className="mt-3">
            <Slider
              label="Intensity"
              value={settings.animationIntensity}
              onChange={(v) => update("animationIntensity", v)}
              min={0}
              max={100}
              step={1}
              showValue
              suffix="%"
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
