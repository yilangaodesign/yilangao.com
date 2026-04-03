import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Input.module.scss";

export type InputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type InputEmphasis = "regular" | "minimal";
export type InputStatus = "none" | "loading" | "success" | "error" | "warning" | "brand";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  emphasis?: InputEmphasis;
  size?: InputSize;
  status?: InputStatus;
  label?: string;
  helperText?: string;
  feedbackMessage?: string;
  /** @deprecated Use `status="error"` + `feedbackMessage` instead. Kept for backward compat. */
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  trailing?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  description?: string;
}

function StatusIcon({ status }: { status: InputStatus }) {
  const cls = [styles.statusIcon, styles[`statusIcon-${status}`]]
    .filter(Boolean)
    .join(" ");

  if (status === "loading") {
    return <span className={cls} aria-hidden="true" />;
  }

  if (status === "error") {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V5Zm.75 6.75a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
      </svg>
    );
  }

  if (status === "success") {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm3.22 5.47a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.75-1.75a.75.75 0 1 1 1.06-1.06L7.19 9.44l2.97-2.97a.75.75 0 0 1 1.06 0Z" />
      </svg>
    );
  }

  if (status === "warning") {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M7.134 1.498a1 1 0 0 1 1.732 0l6.062 10.5A1 1 0 0 1 14.062 13.5H1.938a1 1 0 0 1-.866-1.502l6.062-10.5ZM7.25 6a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0V6Zm.75 5.75a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
      </svg>
    );
  }

  return null;
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      emphasis = "regular",
      size = "lg",
      status: statusProp = "none",
      label,
      helperText,
      feedbackMessage,
      error,
      leadingIcon,
      trailingIcon,
      trailing,
      prefix,
      suffix,
      clearable = false,
      onClear,
      description,
      className,
      id: idProp,
      disabled,
      readOnly,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const helperId = `${id}-helper`;
    const feedbackId = `${id}-feedback`;

    const status = error ? "error" : statusProp;
    const resolvedFeedback = error || feedbackMessage;

    const hasValue =
      value !== undefined ? String(value).length > 0 : undefined;

    const wrapperCls = [
      styles.wrapper,
      styles[emphasis],
      styles[size],
      status !== "none" && styles[status],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const containerCls = [
      styles.inputContainer,
      disabled && styles.disabled,
      readOnly && styles.readOnly,
    ]
      .filter(Boolean)
      .join(" ");

    const showClear = clearable && hasValue !== false && !disabled && !readOnly;
    const showStatusIcon = status !== "none" && status !== "brand";

    const describedBy = [
      resolvedFeedback ? feedbackId : null,
      !resolvedFeedback && helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className={wrapperCls}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <div className={containerCls}>
          {leadingIcon && (
            <span className={styles.iconWrap} aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          {prefix && (
            <span className={styles.affix} aria-hidden="true">
              {prefix}
            </span>
          )}
          <div className={styles.inputArea}>
            <input
              ref={ref}
              id={id}
              className={styles.input}
              disabled={disabled}
              readOnly={readOnly}
              value={value}
              defaultValue={defaultValue}
              aria-invalid={status === "error" ? true : undefined}
              aria-describedby={describedBy}
              {...props}
            />
            {description && (
              <span className={styles.description}>{description}</span>
            )}
          </div>
          {suffix && (
            <span className={styles.affix} aria-hidden="true">
              {suffix}
            </span>
          )}
          {showClear && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onClear}
              aria-label="Clear input"
              tabIndex={-1}
            >
              <ClearIcon />
            </button>
          )}
          {showStatusIcon && <StatusIcon status={status} />}
          {trailing && (
            <span className={styles.trailingSlot}>{trailing}</span>
          )}
          {trailingIcon && (
            <span className={styles.iconWrap} aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </div>
        {resolvedFeedback && (
          <span
            id={feedbackId}
            className={styles.feedbackText}
            role={status === "error" ? "alert" : undefined}
          >
            {resolvedFeedback}
          </span>
        )}
        {!resolvedFeedback && helperText && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
