"use client";

import { forwardRef, useId } from "react";
import type { CheckedState as RadixCheckedState } from "@radix-ui/react-checkbox";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import styles from "./Checkbox.module.scss";

/** Radix checkbox value: `true`, `false`, or `"indeterminate"` (partial / mixed). */
export type CheckboxCheckedState = RadixCheckedState;

export interface CheckboxProps {
  label?: string;
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    { label, checked, defaultChecked, onCheckedChange, disabled, name, value, className, id: idProp },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        <CheckboxPrimitive.Root
          ref={ref}
          id={id}
          className={styles.checkbox}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          name={name}
          value={value}
        >
          <CheckboxPrimitive.Indicator className={styles.indicator}>
            {/* Icons follow Indicator `data-state` (Radix context), not the `checked` prop — required when uncontrolled + defaultChecked indeterminate */}
            <span className={styles.iconChecked} aria-hidden="true">
              <CheckIcon />
            </span>
            <span className={styles.iconIndeterminate} aria-hidden="true">
              <MinusIcon />
            </span>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label
            htmlFor={id}
            className={styles.label}
            data-disabled={disabled || undefined}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
