"use client";

/**
 * MediaMuteToggle — viewer-facing mute/unmute control for videos.
 *
 * Renders as an icon-only button with a translucent overlay background so it
 * stays legible over any media. Designed to be composed by media surfaces
 * (MediaRenderer and any future player chrome) and positioned by the parent
 * via absolute positioning on the wrapping element.
 *
 * Controlled component: the consumer owns `muted` state and reacts to
 * `onMutedChange`. The toggle itself has no side effects on the underlying
 * `<video>` element — the consumer should pass the same state to the video's
 * `muted` prop so React remains the source of truth.
 *
 * Zero border-radius (branding §1.1). Icons are inline SVGs to match the
 * existing inline-edit overlay pattern (no lucide barrel dependency).
 */

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./MediaMuteToggle.module.scss";

export type MediaMuteToggleSize = "sm" | "md";

export interface MediaMuteToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  muted: boolean;
  onMutedChange: (next: boolean) => void;
  size?: MediaMuteToggleSize;
  /** Accessible label prefix; the action verb ("Mute"/"Unmute") is appended. */
  mediaLabel?: string;
}

function VolumeOnIcon(): ReactNode {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3.5 4.5 6H2v4h2.5L8 12.5v-9Z"
        fill="currentColor"
      />
      <path
        d="M10.5 6c.6.5 1 1.2 1 2s-.4 1.5-1 2M12.5 4c1.2.9 2 2.4 2 4s-.8 3.1-2 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VolumeOffIcon(): ReactNode {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3.5 4.5 6H2v4h2.5L8 12.5v-9Z"
        fill="currentColor"
      />
      <path
        d="m10.5 6.5 4 4M14.5 6.5l-4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const MediaMuteToggle = forwardRef<
  HTMLButtonElement,
  MediaMuteToggleProps
>(
  (
    {
      muted,
      onMutedChange,
      size = "md",
      mediaLabel,
      className,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const action = muted ? "Unmute" : "Mute";
    const ariaLabel = mediaLabel ? `${action} ${mediaLabel}` : action;
    const classes = [styles.root, styles[size], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        aria-label={ariaLabel}
        aria-pressed={muted}
        title={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
          if (!e.defaultPrevented) onMutedChange(!muted);
        }}
        {...rest}
      >
        <span className={styles.icon} aria-hidden="true">
          {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
        </span>
      </button>
    );
  },
);

MediaMuteToggle.displayName = "MediaMuteToggle";

export default MediaMuteToggle;
