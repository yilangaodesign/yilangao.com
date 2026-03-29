"use client";

import { forwardRef, useId, type ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import styles from "./Select.module.scss";

// ---------------------------------------------------------------------------
// Root wrapper with label / helper / error
// ---------------------------------------------------------------------------

export interface SelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      placeholder = "Select…",
      children,
      value,
      defaultValue,
      onValueChange,
      disabled,
      className,
      id: idProp,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    const wrapperCls = [styles.wrapper, error && styles.error, className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperCls}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectPrimitive.Trigger ref={ref} id={id} className={styles.trigger}>
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon className={styles.icon}>
              <ChevronDown />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={styles.content}
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className={styles.viewport}>
                {children}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

        {error && (
          <span className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

// ---------------------------------------------------------------------------
// Sub-components (re-exports with styling)
// ---------------------------------------------------------------------------

export interface SelectItemProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, ...props }, ref) => (
    <SelectPrimitive.Item ref={ref} className={styles.item} {...props}>
      <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
);

SelectItem.displayName = "SelectItem";

export const SelectGroup = SelectPrimitive.Group;

export const SelectLabel = forwardRef<
  HTMLDivElement,
  { children: ReactNode }
>(({ children, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={styles.groupLabel} {...props}>
    {children}
  </SelectPrimitive.Label>
));

SelectLabel.displayName = "SelectLabel";

export const SelectSeparator = () => (
  <SelectPrimitive.Separator className={styles.separator} />
);

// ---------------------------------------------------------------------------
// Inline SVG icons (avoids icon library dependency)
// ---------------------------------------------------------------------------

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M11.5 3.5L5.5 9.5L2.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
