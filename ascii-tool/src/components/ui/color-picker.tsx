"use client";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value;
      if (!v.startsWith("#")) v = "#" + v;
      setLocalValue(v);
      if (/^#([0-9a-fA-F]{3}){1,2}$/.test(v)) onChange(v);
    },
    [onChange],
  );

  const handleTextBlur = useCallback(() => {
    if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(localValue)) setLocalValue(value);
  }, [localValue, value]);

  const handleSwatchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      onChange(e.target.value);
    },
    [onChange],
  );

  if (value !== localValue && /^#([0-9a-fA-F]{3}){1,2}$/.test(value) && localValue !== value) {
    setLocalValue(value);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-sm border border-border overflow-hidden shrink-0">
          <input
            type="color"
            value={value}
            onChange={handleSwatchChange}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="w-full h-full pointer-events-none" style={{ backgroundColor: value }} />
        </div>
        <input
          type="text"
          value={localValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          className="w-full max-w-[90px] h-8 px-2.5 font-mono text-sm text-foreground bg-surface border border-border rounded-sm uppercase transition-colors duration-150 hover:border-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>
    </div>
  );
}
