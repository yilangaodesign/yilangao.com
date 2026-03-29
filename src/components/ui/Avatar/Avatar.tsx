"use client";

import { forwardRef, useState, type ImgHTMLAttributes } from "react";
import styles from "./Avatar.module.scss";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  size?: AvatarSize;
  name?: string;
  src?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = "md", name, src, alt, className, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    const showImage = src && !imgError;

    const cls = [styles.avatar, styles[size], className]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={cls} aria-label={name ?? alt}>
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? ""}
            className={styles.image}
            onError={() => setImgError(true)}
            {...props}
          />
        ) : (
          <span aria-hidden="true">{name ? getInitials(name) : "?"}</span>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
