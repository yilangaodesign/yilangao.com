import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Eyebrow.module.scss";

// =============================================================================
// Types
// =============================================================================

export type EyebrowSize = "sm" | "md";
export type EyebrowEmphasis = "subtle" | "bold";
export type EyebrowElement = "span" | "p" | "div" | "dt" | "legend" | "h2" | "h3" | "h4";

export interface EyebrowProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  as?: EyebrowElement;
  size?: EyebrowSize;
  emphasis?: EyebrowEmphasis;
  metric?: boolean;
  children: ReactNode;
}

// =============================================================================
// Eyebrow — Uppercase tracked text primitive
// =============================================================================
// Canonical component for small uppercase section headings, group labels,
// and metric annotations. Codifies the @include label / label-sm mixin
// pattern into a composable React primitive.
//
// Font defaults to sans. Pass `metric` when the eyebrow labels a
// statistic or KPI — switches to monospace for tabular scanability.
//
// Use for: nav section dividers, menu/command group headings, form group
// headings, metric annotations, card metadata categories, DL labels.
//
// NOT for: form <label> elements (coupled to Input size systems),
// nav/menu item text (state-dependent transitions), or body text
// annotations (use TextRow).
// =============================================================================

export const Eyebrow = forwardRef<HTMLElement, EyebrowProps>(
  (
    {
      as: Element = "span",
      size = "md",
      emphasis = "subtle",
      metric,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const cls = [
      styles.eyebrow,
      styles[size],
      styles[emphasis],
      metric && styles.metric,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Element ref={ref as never} className={cls} {...props}>
        {children}
      </Element>
    );
  },
);

Eyebrow.displayName = "Eyebrow";
