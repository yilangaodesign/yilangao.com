import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import styles from "./Button.module.scss";

export type ButtonAppearance =
  | "neutral"
  | "highlight"
  | "positive"
  | "negative"
  | "warning"
  | "inverse"
  | "always-dark"
  | "always-light";

export type ButtonEmphasis = "bold" | "regular" | "subtle" | "minimal";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonShape = "default" | "soft";

type SharedProps = {
  appearance?: ButtonAppearance;
  emphasis?: ButtonEmphasis;
  size?: ButtonSize;
  shape?: ButtonShape;
  onColor?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  trailingSlot?: ReactNode;
};

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps> & {
    href?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function isLinkProps(props: ButtonProps): props is ButtonAsLink {
  return typeof props.href === "string";
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      appearance = "neutral",
      emphasis = "bold",
      size = "lg",
      shape = "default",
      onColor = false,
      iconOnly = false,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      trailingSlot,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const cls = [
      styles.button,
      styles[appearance],
      styles[emphasis],
      styles[size],
      shape !== "default" && styles[shape],
      onColor && styles.onColor,
      iconOnly && styles.iconOnly,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <>
        {leadingIcon && (
          <span className={styles.iconWrap} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        {children && (
          <span className={iconOnly ? styles.iconWrap : styles.label}>
            {children}
          </span>
        )}
        {trailingIcon && (
          <span className={styles.iconWrap} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
        {trailingSlot && (
          <span className={styles.trailingSlot}>{trailingSlot}</span>
        )}
      </>
    );

    if (isLinkProps({ ...rest, appearance, emphasis, size, onColor, iconOnly, fullWidth, leadingIcon, trailingIcon, trailingSlot, className, children })) {
      const { href, ...linkRest } = rest as ButtonAsLink;
      const isExternal = href.startsWith("http") || href.startsWith("//");

      if (isExternal) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={cls}
            target="_blank"
            rel="noopener noreferrer"
            {...linkRest}
          >
            {inner}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          {...linkRest}
        >
          {inner}
        </Link>
      );
    }

    const { type = "button", ...buttonRest } = rest as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={cls}
        {...buttonRest}
      >
        {inner}
      </button>
    );
  },
);

Button.displayName = "Button";
