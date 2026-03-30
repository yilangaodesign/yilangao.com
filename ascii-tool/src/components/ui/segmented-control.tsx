"use client";
import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl({
  items,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  className,
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-value="${value}"]`) as HTMLElement | null;
    if (activeBtn) {
      setIndicator({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
    }
  }, [value]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, items]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex bg-muted rounded-sm p-0.5 gap-0.5",
        fullWidth && "flex w-full",
        className,
      )}
      role="radiogroup"
    >
      <div
        className="absolute top-0.5 h-[calc(100%-4px)] rounded-sm bg-background shadow-sm transition-all duration-150 ease-out pointer-events-none z-0"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="radio"
          aria-checked={item.value === value}
          data-value={item.value}
          className={cn(
            "relative z-[1] flex-1 inline-flex items-center justify-center font-medium whitespace-nowrap rounded-sm transition-colors duration-150",
            size === "sm" ? "h-7 px-3 text-xs" : "h-8 px-4 text-sm",
            item.value === value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            item.disabled && "opacity-50 pointer-events-none",
          )}
          disabled={item.disabled}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
