"use client";

import { forwardRef, useId } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import styles from "./Toggle.module.scss";

export interface ToggleProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
  id?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    { label, checked, defaultChecked, onCheckedChange, disabled, name, className, id: idProp },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        <SwitchPrimitive.Root
          ref={ref}
          id={id}
          className={styles.switch}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          name={name}
        >
          <SwitchPrimitive.Thumb className={styles.thumb} />
        </SwitchPrimitive.Root>
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

Toggle.displayName = "Toggle";
