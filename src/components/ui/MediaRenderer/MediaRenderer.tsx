"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import styles from "./MediaRenderer.module.scss";

interface MediaRendererProps {
  src: string;
  mimeType?: string | null;
  alt?: string;
  className?: string;
  width?: number | null;
  height?: number | null;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
}

export default function MediaRenderer({
  src,
  mimeType,
  alt = '',
  className,
  width,
  height,
  priority,
  sizes = '100vw',
  unoptimized,
}: MediaRendererProps) {
  const hasDimensions = !!(width && height);
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);

  const isVideo = mimeType?.startsWith('video/');

  return (
    <div
      className={`${styles.wrapper} ${loaded ? styles.loaded : ''} ${className ?? ''}`}
      style={hasDimensions ? { aspectRatio: `${width} / ${height}` } : undefined}
    >
      {!loaded && (
        <div className={styles.skeleton} aria-hidden="true" />
      )}
      {isVideo ? (
        <video
          src={src}
          className={styles.media}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          onLoadedData={onLoad}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          className={styles.media}
          onLoad={onLoad}
        />
      )}
    </div>
  );
}
