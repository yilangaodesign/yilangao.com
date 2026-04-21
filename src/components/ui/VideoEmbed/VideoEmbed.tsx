"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./VideoEmbed.module.scss";
import type { EmbedProvider } from "../../../lib/parse-video-embed";

export interface VideoEmbedProps {
  provider: EmbedProvider;
  embedUrl: string;
  autoplayUrl: string;
  posterUrl?: string | null;
  autoThumbnailUrl?: string | null;
  isVertical?: boolean;
  caption?: string | null;
  className?: string;
}

const PROVIDER_LABEL: Record<EmbedProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
};

export function VideoEmbed({
  provider,
  embedUrl,
  autoplayUrl,
  posterUrl,
  autoThumbnailUrl,
  isVertical,
  caption,
  className,
}: VideoEmbedProps) {
  const [activated, setActivated] = useState(false);

  const displayPoster = posterUrl || autoThumbnailUrl || null;
  const providerLabel = PROVIDER_LABEL[provider];
  const accessibleName = caption ? `Play: ${caption}` : `Play ${providerLabel} video`;
  const iframeTitle = caption || `${providerLabel} video player`;
  const iframeSrc = activated ? autoplayUrl : embedUrl;

  const wrapperClass = [
    styles.wrapper,
    isVertical ? styles.vertical : styles.horizontal,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass} data-provider={provider}>
      {activated ? (
        <iframe
          className={styles.iframe}
          src={iframeSrc}
          title={iframeTitle}
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className={styles.poster}
          aria-label={accessibleName}
          onClick={() => setActivated(true)}
        >
          {displayPoster ? (
            <Image
              src={displayPoster}
              alt=""
              fill
              sizes="100vw"
              className={styles.posterImage}
              unoptimized={provider !== "youtube"}
            />
          ) : (
            <span className={styles.posterFallback} aria-hidden="true">
              {providerLabel}
            </span>
          )}
          <span className={styles.playAffordance} aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

export default VideoEmbed;
