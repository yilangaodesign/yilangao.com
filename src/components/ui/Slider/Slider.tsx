"use client";
import {
  forwardRef,
  useId,
  type CSSProperties,
  type InputHTMLAttributes,
} from "react";
import styles from "./Slider.module.scss";

function sliderProgressStyle(
  value: InputHTMLAttributes<HTMLInputElement>["value"],
  min: number,
  max: number,
): CSSProperties {
  let valueNum: number;
  if (typeof value === "number") {
    valueNum = Number.isFinite(value) ? value : min;
  } else if (value === undefined || value === "") {
    valueNum = min;
  } else {
    const n = Number(value);
    valueNum = Number.isFinite(n) ? n : min;
  }
  const span = max - min;
  const pct = span === 0 ? 0 : ((valueNum - min) / span) * 100;
  const clamped = Math.min(100, Math.max(0, pct));
  return { "--slider-progress": `${clamped}%` } as CSSProperties;
}

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  showValue?: boolean;
  suffix?: string;
  onChange?: (value: number) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      showValue = false,
      suffix,
      onChange,
      className,
      id: idProp,
      value,
      min = 0,
      max = 100,
      style: styleProp,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const minNum = typeof min === "number" ? min : Number(min) || 0;
    const maxNum = typeof max === "number" ? max : Number(max) || 100;
    const progressStyle = sliderProgressStyle(value, minNum, maxNum);
    const inputStyle: CSSProperties = {
      ...(styleProp && typeof styleProp === "object" ? styleProp : {}),
      ...progressStyle,
    };

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        {(label || showValue) && (
          <div className={styles.header}>
            {label && (
              <label htmlFor={id} className={styles.label}>
                {label}
              </label>
            )}
            {showValue && (
              <span className={styles.value}>
                {value}
                {suffix}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type="range"
          className={styles.range}
          style={inputStyle}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange?.(Number(e.target.value))}
          {...props}
        />
      </div>
    );
  },
);

Slider.displayName = "Slider";
