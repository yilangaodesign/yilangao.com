"use client";
import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface ScrubInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}

export function ScrubInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  className,
}: ScrubInputProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, value: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step)),
    [min, max, step],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (editing) return;
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      dragStartRef.current = { x: e.clientX, value };
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [editing, value],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const range = max - min;
      const sensitivity = range > 100 ? 0.5 : range > 10 ? 1 : 2;
      onChange(clamp(dragStartRef.current.value + dx * sensitivity * step));
    },
    [dragging, min, max, step, clamp, onChange],
  );

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
    setEditValue(String(value));
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) onChange(clamp(parsed));
    setEditing(false);
  }, [editValue, onChange, clamp]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") commitEdit();
      else if (e.key === "Escape") setEditing(false);
      else if (!editing) {
        if (e.key === "ArrowUp") { e.preventDefault(); onChange(clamp(value + step)); }
        if (e.key === "ArrowDown") { e.preventDefault(); onChange(clamp(value - step)); }
      }
    },
    [editing, commitEdit, onChange, clamp, value, step],
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <div
        className={cn(
          "inline-flex items-center h-8 border rounded-sm bg-surface select-none transition-colors duration-150",
          dragging ? "border-accent ring-1 ring-accent cursor-ew-resize" : "border-border cursor-ew-resize hover:border-muted-foreground",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={editing ? -1 : 0}
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
      >
        <button
          type="button"
          className="flex items-center justify-center w-6 h-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 disabled:opacity-30"
          tabIndex={-1}
          disabled={value <= min}
          onClick={(e) => { e.stopPropagation(); onChange(clamp(value - step)); }}
          aria-label="Decrease"
        >
          <Minus className="w-3 h-3" />
        </button>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            className="flex-1 w-full min-w-[32px] h-full bg-transparent font-mono text-sm text-center text-foreground outline-none px-1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="flex-1 text-center font-mono text-sm text-foreground min-w-[32px] px-1">
            {value}
            {suffix && <span className="text-xs text-muted-foreground ml-0.5">{suffix}</span>}
          </span>
        )}
        <button
          type="button"
          className="flex items-center justify-center w-6 h-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 disabled:opacity-30"
          tabIndex={-1}
          disabled={value >= max}
          onClick={(e) => { e.stopPropagation(); onChange(clamp(value + step)); }}
          aria-label="Increase"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
