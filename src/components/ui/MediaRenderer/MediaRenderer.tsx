"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { MediaMuteToggle } from "../MediaMuteToggle";
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
  playbackMode?: 'loop' | 'player' | null;
  /**
   * Capability axis: when `true`, the viewer sees a mute/unmute toggle and
   * the video's starting state is read from `muted`. When `false`, the
   * video plays silently and no toggle is rendered (decorative loops).
   * See ENG-170 for the capability-vs-default split.
   */
  audioEnabled?: boolean | null;
  /**
   * Default-state axis: only meaningful when `audioEnabled === true`.
   * `true` → video starts muted (viewer can unmute).
   * `false` → video starts with sound (viewer can mute).
   */
  muted?: boolean | null;
  posterUrl?: string | null;
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
  playbackMode,
  audioEnabled,
  muted,
  posterUrl,
}: MediaRendererProps) {
  const hasDimensions = !!(width && height);
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isVideo = mimeType?.startsWith('video/');
  const isAnimatedImage = mimeType === 'image/gif';
  const isPlayerMode = isVideo && playbackMode === 'player';

  // Two axes (ENG-170):
  //   audioEnabled (capability) — does the viewer have any audio UI?
  //   muted        (default)    — only when audioEnabled: starts muted?
  // Player-mode videos use the browser's native <video controls> UI, which
  // always exposes a volume slider; the audioEnabled axis doesn't gate them.
  const audioOn = isPlayerMode ? true : audioEnabled === true;
  // Initial playback mute state. When capability is off, force muted (browser
  // autoplay policy + "no audio for viewers" semantic). When capability is
  // on, honor the editor's default. `muted` defaults to true when unset.
  const initialMuted = audioOn
    ? (typeof muted === 'boolean' ? muted : true)
    : true;

  const [localMuted, setLocalMuted] = useState(initialMuted);
  useEffect(() => {
    setLocalMuted(initialMuted);
  }, [initialMuted]);

  // Viewer mute toggle only appears for loop videos whose editor turned
  // audio on. Player videos already have native controls; decorative loops
  // (audio off) intentionally hide any audio affordance.
  const showViewerMuteToggle = isVideo && !isPlayerMode && audioOn;

  // Recover the "already loaded before hydration" case. The SSR'd <video>
  // starts fetching immediately; with a CDN-cached URL the `loadeddata` event
  // often fires before React attaches the JSX `onLoadedData` handler, which
  // would leave the skeleton up forever (and the media at opacity: 0). Check
  // readyState on mount, and also listen for `loadedmetadata` as a fallback so
  // `preload="metadata"` is enough to dismiss the skeleton for loop clips.
  useEffect(() => {
    if (!isVideo) return;
    const el = videoRef.current;
    if (!el) return;
    // HAVE_CURRENT_DATA or better → first frame is decoded.
    if (el.readyState >= 2) {
      setLoaded(true);
      return;
    }
    const reveal = () => setLoaded(true);
    el.addEventListener('loadeddata', reveal, { once: true });
    el.addEventListener('loadedmetadata', reveal, { once: true });
    return () => {
      el.removeEventListener('loadeddata', reveal);
      el.removeEventListener('loadedmetadata', reveal);
    };
  }, [isVideo, src]);

  return (
    <div
      className={`${styles.wrapper} ${loaded ? styles.loaded : ''} ${className ?? ''}`}
      style={hasDimensions ? { aspectRatio: `${width} / ${height}` } : undefined}
    >
      {!loaded && (
        <div className={styles.skeleton} aria-hidden="true" />
      )}
      {isVideo ? (
        isPlayerMode ? (
          <video
            ref={videoRef}
            src={src}
            className={styles.media}
            controls
            playsInline
            preload="metadata"
            poster={posterUrl ?? undefined}
            aria-label={alt}
            onLoadedData={onLoad}
            muted={localMuted}
          />
        ) : (
          <video
            ref={videoRef}
            src={src}
            className={styles.media}
            autoPlay
            loop
            playsInline
            preload="metadata"
            poster={posterUrl ?? undefined}
            aria-label={alt}
            onLoadedData={onLoad}
            muted={localMuted}
          />
        )
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized || isAnimatedImage}
          className={styles.media}
          onLoad={onLoad}
        />
      )}

      {showViewerMuteToggle ? (
        <MediaMuteToggle
          className={styles.muteToggle}
          muted={localMuted}
          onMutedChange={setLocalMuted}
          mediaLabel={alt || "video"}
        />
      ) : null}
    </div>
  );
}
