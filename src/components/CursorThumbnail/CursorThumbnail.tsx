"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import styles from "./CursorThumbnail.module.scss";

type MediaKind = "image" | "video";

interface CursorThumbnailProps {
  src: string;
  kind: MediaKind;
  visible: boolean;
  thumbRef: React.RefObject<HTMLDivElement | null>;
  onError: () => void;
  onMediaReady: () => void;
}

function MediaLayer({
  src,
  kind,
  className,
  onError,
  onLoadReady,
  onAnimationEnd,
}: {
  src: string;
  kind: MediaKind;
  className: string;
  onError?: () => void;
  onLoadReady?: () => void;
  onAnimationEnd?: () => void;
}) {
  if (kind === "video") {
    return (
      <video
        className={className}
        src={src || undefined}
        autoPlay
        muted
        loop
        playsInline
        onError={onError}
        onLoadedMetadata={onLoadReady}
        onAnimationEnd={onAnimationEnd}
      />
    );
  }
  return (
    <img
      className={className}
      src={src || undefined}
      alt=""
      onError={onError}
      onLoad={onLoadReady}
      onAnimationEnd={onAnimationEnd}
    />
  );
}

export function CursorThumbnail({ src, kind, visible, thumbRef, onError, onMediaReady }: CursorThumbnailProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevSrcRef = useRef("");
  const prevKindRef = useRef<MediaKind>("image");
  const [outgoing, setOutgoing] = useState<{ src: string; kind: MediaKind } | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-cursor-thumbnail-portal", "");
    document.body.appendChild(el);
    containerRef.current = el;
    setContainer(el);

    return () => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      containerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (visible && src && prevSrcRef.current && prevSrcRef.current !== src) {
      setOutgoing({ src: prevSrcRef.current, kind: prevKindRef.current });
    }
    prevSrcRef.current = src;
    prevKindRef.current = kind;
  }, [src, kind, visible]);

  if (!container) return null;

  const className = `${styles.cursorThumb}${visible && src ? ` ${styles.isVisible}` : ""}`;

  return createPortal(
    <div ref={thumbRef} className={className} aria-hidden="true">
      {outgoing && (
        <MediaLayer
          src={outgoing.src}
          kind={outgoing.kind}
          className={`${styles.cursorThumbMedia} ${styles.fadeOut}`}
          onAnimationEnd={() => setOutgoing(null)}
        />
      )}
      <MediaLayer
        src={src}
        kind={kind}
        className={`${styles.cursorThumbMedia}${outgoing ? ` ${styles.fadeIn}` : ""}`}
        onError={onError}
        onLoadReady={onMediaReady}
      />
    </div>,
    container,
  );
}
