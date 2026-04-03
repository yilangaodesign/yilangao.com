import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./TextRow.module.scss";

// =============================================================================
// Types
// =============================================================================

export type TextRowSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
export type TextRowEmphasis = "subtle" | "bold";
export type TextRowElement = "span" | "label" | "legend" | "p" | "dt";

export interface TextRowProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  as?: TextRowElement;
  size?: TextRowSize;
  emphasis?: TextRowEmphasis;
  htmlFor?: string;

  children: ReactNode;
  secondaryText?: string;

  leadingContent?: ReactNode;
  trailingContent?: ReactNode;
  trailingSecondaryText?: string;

  infoTooltip?: ReactNode;
}

// =============================================================================
// TextRow — Composed inline text primitive
// =============================================================================
// A horizontal row of text parts with optional leading/trailing slots.
// Use for standalone metadata annotations, key-value pairs, card metadata,
// and composed text lines outside interactive or form components.
//
// NOT intended as a replacement for:
//   - Eyebrow / section headings (uppercase, tracked — use <Eyebrow> component)
//   - Form field labels (coupled to Input/Checkbox/Select size systems)
//   - Nav/menu item text (state-dependent color/weight transitions)
// =============================================================================

export const TextRow = forwardRef<HTMLElement, TextRowProps>(
  (
    {
      as: Element = "span",
      size = "md",
      emphasis = "subtle",
      htmlFor,
      children,
      secondaryText,
      leadingContent,
      trailingContent,
      trailingSecondaryText,
      infoTooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const cls = [
      styles.textRow,
      styles[size],
      styles[emphasis],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const elementProps: Record<string, unknown> = { ...props };
    if (Element === "label" && htmlFor) {
      elementProps.htmlFor = htmlFor;
    }

    return (
      <Element ref={ref as never} className={cls} {...elementProps}>
        <span className={styles.hStack}>
          {leadingContent && (
            <span className={styles.slot} aria-hidden="true">
              {leadingContent}
            </span>
          )}
          <span className={styles.primaryText}>{children}</span>
          {infoTooltip && (
            <span className={styles.infoSlot}>{infoTooltip}</span>
          )}
          {secondaryText && (
            <span className={styles.secondaryText}>{secondaryText}</span>
          )}
        </span>
        {trailingSecondaryText && (
          <span className={styles.trailingSecondaryText}>
            {trailingSecondaryText}
          </span>
        )}
        {trailingContent && (
          <span className={styles.slot} aria-hidden="true">
            {trailingContent}
          </span>
        )}
      </Element>
    );
  },
);

TextRow.displayName = "TextRow";
