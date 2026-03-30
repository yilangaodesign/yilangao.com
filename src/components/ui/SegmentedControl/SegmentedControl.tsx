"use client";
import { forwardRef, useId, useRef, useState, useLayoutEffect, useCallback } from "react";
import styles from "./SegmentedControl.module.scss";

export interface SegmentedControlItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      items,
      value,
      onChange,
      size = "md",
      fullWidth = false,
      disabled = false,
      className,
      id: idProp,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    const updateIndicator = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;
      const activeBtn = container.querySelector(`[data-value="${value}"]`) as HTMLElement | null;
      if (activeBtn) {
        setIndicator({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    }, [value]);

    useLayoutEffect(() => {
      updateIndicator();
    }, [updateIndicator, items]);

    const wrapperCls = [
      styles.wrapper,
      styles[size],
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        id={id}
        className={wrapperCls}
        role="radiogroup"
        aria-label={ariaLabel}
      >
        <div
          className={styles.indicator}
          style={{ left: indicator.left, width: indicator.width }}
        />
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={item.value === value}
            data-value={item.value}
            className={[
              styles.segment,
              item.value === value && styles.active,
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled || item.disabled}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";
