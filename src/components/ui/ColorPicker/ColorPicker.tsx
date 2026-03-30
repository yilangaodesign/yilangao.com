"use client";
import { forwardRef, useId, useState, useCallback } from "react";
import styles from "./ColorPicker.module.scss";

export interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ label, value, onChange, disabled, className, id: idProp }, ref) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const [localValue, setLocalValue] = useState(value);

    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value;
        if (!v.startsWith("#")) v = "#" + v;
        setLocalValue(v);
        if (/^#([0-9a-fA-F]{3}){1,2}$/.test(v)) {
          onChange(v);
        }
      },
      [onChange],
    );

    const handleTextBlur = useCallback(() => {
      if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(localValue)) {
        setLocalValue(value);
      }
    }, [localValue, value]);

    const handleSwatchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setLocalValue(v);
        onChange(v);
      },
      [onChange],
    );

    // Sync external value changes
    if (value !== localValue && /^#([0-9a-fA-F]{3}){1,2}$/.test(value)) {
      if (localValue !== value) setLocalValue(value);
    }

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.row}>
          <input
            type="color"
            className={styles.swatch}
            value={value}
            onChange={handleSwatchChange}
            disabled={disabled}
            tabIndex={-1}
            aria-label={label ? `${label} color swatch` : "Color swatch"}
          />
          <input
            ref={ref}
            id={id}
            type="text"
            className={styles.textInput}
            value={localValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            maxLength={7}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
