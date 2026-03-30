"use client";
import {
  forwardRef,
  useId,
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import styles from "./ScrubInput.module.scss";

export interface ScrubInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const ScrubInput = forwardRef<HTMLInputElement, ScrubInputProps>(
  (
    {
      label,
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      suffix,
      disabled,
      className,
      id: idProp,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
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
        if (disabled || editing) return;
        if ((e.target as HTMLElement).tagName === "BUTTON") return;
        e.preventDefault();
        dragStartRef.current = { x: e.clientX, value };
        setDragging(true);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      },
      [disabled, editing, value],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const range = max - min;
        const sensitivity = range > 100 ? 0.5 : range > 10 ? 1 : 2;
        const newVal = clamp(dragStartRef.current.value + dx * sensitivity * step);
        onChange(newVal);
      },
      [dragging, min, max, step, clamp, onChange],
    );

    const handlePointerUp = useCallback(() => {
      setDragging(false);
    }, []);

    const handleDoubleClick = useCallback(() => {
      if (disabled) return;
      setEditing(true);
      setEditValue(String(value));
    }, [disabled, value]);

    useEffect(() => {
      if (editing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [editing]);

    const commitEdit = useCallback(() => {
      const parsed = parseFloat(editValue);
      if (!isNaN(parsed)) {
        onChange(clamp(parsed));
      }
      setEditing(false);
    }, [editValue, onChange, clamp]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          commitEdit();
        } else if (e.key === "Escape") {
          setEditing(false);
        } else if (!editing) {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            onChange(clamp(value + step));
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onChange(clamp(value - step));
          }
        }
      },
      [editing, commitEdit, onChange, clamp, value, step],
    );

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div
          className={[styles.control, dragging && styles.dragging]
            .filter(Boolean)
            .join(" ")}
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
            className={styles.stepper}
            tabIndex={-1}
            disabled={disabled || value <= min}
            onClick={(e) => {
              e.stopPropagation();
              onChange(clamp(value - step));
            }}
            aria-label="Decrease"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {editing ? (
            <input
              ref={inputRef}
              id={id}
              type="text"
              inputMode="numeric"
              className={styles.editInput}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span className={styles.display}>
              {value}
              {suffix && <span className={styles.suffix}>{suffix}</span>}
            </span>
          )}

          <button
            type="button"
            className={styles.stepper}
            tabIndex={-1}
            disabled={disabled || value >= max}
            onClick={(e) => {
              e.stopPropagation();
              onChange(clamp(value + step));
            }}
            aria-label="Increase"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    );
  },
);

ScrubInput.displayName = "ScrubInput";
