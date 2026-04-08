"use client";

import { useState, useCallback } from "react";
import styles from "./MediaRenderer.module.scss";

interface MediaRendererProps {
  src: string;
  mimeType?: string | null;
  alt?: string;
  className?: string;
  width?: number | null;
  height?: number | null;
}

export default function MediaRenderer({
  src,
  mimeType,
  alt = '',
  className,
  width,
  height,
}: MediaRendererProps) {
  const hasDimensions = !!(width && height);
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);

  const isVideo = mimeType?.startsWith('video/');

  if (!hasDimensions) {
    if (isVideo) {
      return (
        <video
          src={src}
          className={className}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
        />
      );
    }
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div
      className={`${styles.wrapper} ${loaded ? styles.loaded : ''} ${className ?? ''}`}
      style={{ aspectRatio: `${width} / ${height}` }}
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
          aria-label={alt}
          onLoadedData={onLoad}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className={styles.media}
          onLoad={onLoad}
        />
      )}
    </div>
  );
}
