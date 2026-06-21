import type { ReactNode } from "react";
import { Badge, type BadgeAppearance } from "../Badge";
import { Button, type ButtonAppearance } from "../Button";
import { Input, type InputStatus } from "../Input";
import { ProgressBar } from "../ProgressBar";
import styles from "./DataGrid.module.scss";

/**
 * Content renderers for the GS cell archetypes. Each composes an existing Élan
 * primitive - the DataGrid never reimplements them. Use these inside a
 * TanStack `ColumnDef.cell`. They render the inner content only; the cell shell
 * (role, alignment, status) is supplied by `DataGridCell`.
 */

export function TextCell({ children }: { children: ReactNode }) {
  return <span className={styles.textCell}>{children}</span>;
}

export function MultiLineTextCell({ children }: { children: ReactNode }) {
  return <span className={styles.multiLineCell}>{children}</span>;
}

export function ProgressCell({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div className={styles.progressCell}>
      <ProgressBar value={value} max={max} size="sm" showValue />
    </div>
  );
}

export function BadgeCell({
  children,
  appearance = "neutral",
}: {
  children: ReactNode;
  appearance?: BadgeAppearance;
}) {
  return (
    <Badge appearance={appearance} emphasis="subtle" size="sm" shape="squared">
      {children}
    </Badge>
  );
}

export function ButtonCell({
  children,
  appearance = "neutral",
  onClick,
}: {
  children: ReactNode;
  appearance?: ButtonAppearance;
  onClick?: () => void;
}) {
  return (
    <Button appearance={appearance} emphasis="regular" size="xs" onClick={onClick}>
      {children}
    </Button>
  );
}

export function InputCell({
  value,
  defaultValue,
  status = "none",
  placeholder,
  readOnly,
  disabled,
  onChange,
}: {
  value?: string;
  defaultValue?: string;
  status?: InputStatus;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={styles.inputCell}>
      <Input
        size="xs"
        status={status}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

export function SlotCell({ children }: { children: ReactNode }) {
  return <div className={styles.slotCell}>{children}</div>;
}
