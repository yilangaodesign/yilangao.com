"use client";

import { forwardRef, useId } from "react";
import type { CheckedState as RadixCheckedState } from "@radix-ui/react-checkbox";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import styles from "./Checkbox.module.scss";

/** Radix checkbox value: `true`, `false`, or `"indeterminate"` (partial / mixed). */
export type CheckboxCheckedState = RadixCheckedState;

export type CheckboxAppearance =
  | "neutral"
  | "highlight"
  | "positive"
  | "negative"
  | "warning"
  | "inverse"
  | "always-dark"
  | "always-light";

export type CheckboxSize = "sm" | "md" | "lg" | "xl";

export type CheckboxLabelPlacement = "right" | "left";

export interface CheckboxProps {
  appearance?: CheckboxAppearance;
  size?: CheckboxSize;
  label?: string;
  description?: string;
  error?: string;
  labelPlacement?: CheckboxLabelPlacement;
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
    {
      appearance = "highlight",
      size = "md",
      label,
      description,
      error,
      labelPlacement = "right",
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      name,
      value,
      className,
      id: idProp,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const hasError = !!error;
    const hasContent = !!(label || description || error);

    const wrapperCls = [
      styles.wrapper,
      styles[size],
      styles[appearance],
      styles[labelPlacement],
      hasError && styles.error,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperCls}>
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
          <span className={styles.iconChecked} aria-hidden="true">
            <span className={styles.iconWrap}>
              <CheckIcon />
            </span>
          </span>
          <span className={styles.iconIndeterminate} aria-hidden="true">
            <span className={styles.iconWrap}>
              <MinusIcon />
            </span>
          </span>
        </CheckboxPrimitive.Root>
        {hasContent && (
          <div className={styles.content}>
            {label && (
              <label
                htmlFor={id}
                className={styles.label}
                data-disabled={disabled || undefined}
              >
                {label}
              </label>
            )}
            {hasError ? (
              <span
                className={styles.errorMessage}
                data-disabled={disabled || undefined}
                role="alert"
              >
                {error}
              </span>
            ) : description ? (
              <span
                className={styles.description}
                data-disabled={disabled || undefined}
              >
                {description}
              </span>
            ) : null}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M10 3L4.5 8.5L2 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6H9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
