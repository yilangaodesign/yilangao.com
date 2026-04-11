"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { PreloadManager } from "@/lib/preload-manager";
import type { AssetEntry } from "@/lib/extract-content-urls";

// Mirrors $portfolio-spacer-2x (16px) — see src/styles/tokens/_spacing.scss
const OFFSET = 16;
// Mirrors $portfolio-spacer-2x (16px)
const EDGE_PAD = 16;
const LERP_FACTOR = 0.25;
const FLIP_EASING = 0.12;
const NUDGE_EASING = 0.3;
const NUDGE_PAD = 8;
const LERP_THRESHOLD = 0.5;
const TRANSITION_GRACE_MS = 150;

type MediaKind = "image" | "video";
type CaseStudyWithThumb = { thumbnailUrl?: string; thumbnailKind?: MediaKind };

interface PointerHandlers {
  onPointerEnter: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
}

const NOOP_HANDLERS: PointerHandlers = {
  onPointerEnter: () => {},
  onPointerMove: () => {},
  onPointerLeave: () => {},
};

export function useCursorThumbnail(items: CaseStudyWithThumb[]) {
  const [src, setSrc] = useState<string>("");
  const [kind, setKind] = useState<MediaKind>("image");
  const [visible, setVisible] = useState(false);

  const prefersReduced = useReducedMotion();

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const thumbSizeRef = useRef({ w: 0, h: 0 });
  const appliedOffsetRef = useRef({ x: OFFSET, y: OFFSET });
  const textRectsRef = useRef<DOMRect[]>([]);
  const nudgeRef = useRef(0);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeElRef = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(false);

  const easing = prefersReduced ? 1.0 : LERP_FACTOR;
  const flipEasing = prefersReduced ? 1.0 : FLIP_EASING;
  const nudgeEasing = prefersReduced ? 1.0 : NUDGE_EASING;

  const tick = useCallback(() => {
    const cur = currentRef.current;
    const tgt = targetRef.current;

    cur.x += (tgt.x - cur.x) * easing;
    cur.y += (tgt.y - cur.y) * easing;

    if (thumbSizeRef.current.w === 0 && thumbRef.current) {
      thumbSizeRef.current.w = thumbRef.current.offsetWidth;
      thumbSizeRef.current.h = thumbRef.current.offsetHeight;
    }

    const tw = thumbSizeRef.current.w;
    const th = thumbSizeRef.current.h;

    const elRect = activeElRef.current?.getBoundingClientRect() ?? null;

    const targetOffsetX =
      cur.x + OFFSET + tw + EDGE_PAD > window.innerWidth ? -OFFSET - tw : OFFSET;
    // Prefer below the header element; only go above when viewport has no room
    const targetOffsetY =
      elRect && th > 0
        ? elRect.bottom + th + EDGE_PAD > window.innerHeight
          ? -OFFSET - th
          : OFFSET
        : cur.y + OFFSET + th + EDGE_PAD > window.innerHeight
          ? -OFFSET - th
          : OFFSET;

    const ao = appliedOffsetRef.current;
    ao.x += (targetOffsetX - ao.x) * flipEasing;
    ao.y += (targetOffsetY - ao.y) * flipEasing;

    const naturalX = cur.x + ao.x;
    let naturalY = cur.y + ao.y;

    // Hard clamp: thumbnail must never overlap the header it belongs to
    if (elRect && th > 0) {
      const fitsBelow = elRect.bottom + th + EDGE_PAD <= window.innerHeight;
      if (fitsBelow) {
        naturalY = Math.max(naturalY, elRect.bottom);
      } else {
        naturalY = Math.min(naturalY, elRect.top - th);
      }
    }

    let targetNudge = 0;
    if (tw > 0 && th > 0) {
      for (const rect of textRectsRef.current) {
        if (naturalX + tw <= rect.left || naturalX >= rect.right) continue;
        if (naturalY + th <= rect.top || naturalY >= rect.bottom) continue;
        const pushDown = rect.bottom + NUDGE_PAD - naturalY;
        const pushUp = naturalY + th - rect.top + NUDGE_PAD;
        targetNudge = pushDown <= pushUp ? pushDown : -pushUp;
        break;
      }
    }
    nudgeRef.current += (targetNudge - nudgeRef.current) * nudgeEasing;
    if (Math.abs(nudgeRef.current) < LERP_THRESHOLD) nudgeRef.current = 0;

    if (thumbRef.current) {
      const originX = targetOffsetX >= 0 ? "left" : "right";
      const originY = targetOffsetY >= 0 ? "top" : "bottom";
      thumbRef.current.style.transformOrigin = `${originX} ${originY}`;
      thumbRef.current.style.translate = `${naturalX}px ${naturalY + nudgeRef.current}px`;
    }

    const deltaX = Math.abs(tgt.x - cur.x);
    const deltaY = Math.abs(tgt.y - cur.y);
    const flipDeltaX = Math.abs(targetOffsetX - ao.x);
    const flipDeltaY = Math.abs(targetOffsetY - ao.y);
    const nudgeDelta = Math.abs(targetNudge - nudgeRef.current);

    if (
      visibleRef.current ||
      deltaX > LERP_THRESHOLD ||
      deltaY > LERP_THRESHOLD ||
      flipDeltaX > LERP_THRESHOLD ||
      flipDeltaY > LERP_THRESHOLD ||
      nudgeDelta > LERP_THRESHOLD
    ) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
    }
  }, [easing, flipEasing, nudgeEasing]);

  const startLoop = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (leaveTimerRef.current !== null) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const entries: AssetEntry[] = items
      .filter((item): item is CaseStudyWithThumb & { thumbnailUrl: string } => !!item.thumbnailUrl)
      .map((item) => ({
        url: item.thumbnailUrl,
        kind: item.thumbnailKind ?? "image",
      }));
    if (entries.length > 0) {
      PreloadManager.seedThumbnails(entries);
    }
  }, [items]);

  // Ensure video plays when it mounts or becomes visible
  useEffect(() => {
    if (visible && kind === "video" && !prefersReduced) {
      const video = thumbRef.current?.querySelector("video");
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    }
  }, [visible, kind, prefersReduced]);

  const pauseVideoIfActive = useCallback(() => {
    const video = thumbRef.current?.querySelector("video");
    if (video) video.pause();
  }, []);

  const hideThumb = useCallback(() => {
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    textRectsRef.current = [];
    activeElRef.current = null;
    visibleRef.current = false;
    setVisible(false);
    pauseVideoIfActive();
  }, [pauseVideoIfActive]);

  useEffect(() => {
    const handleDocLeave = () => hideThumb();
    document.addEventListener("pointerleave", handleDocLeave);
    return () => document.removeEventListener("pointerleave", handleDocLeave);
  }, [hideThumb]);

  const measureThumb = useCallback(() => {
    if (thumbRef.current) {
      thumbSizeRef.current.w = thumbRef.current.offsetWidth;
      thumbSizeRef.current.h = thumbRef.current.offsetHeight;
    }
  }, []);

  const handleError = useCallback(() => {
    visibleRef.current = false;
    setVisible(false);
  }, []);

  const getBlockHandlers = useCallback(
    (index: number): PointerHandlers => {
      const item = items[index];
      const url = item?.thumbnailUrl;
      if (!url) return NOOP_HANDLERS;

      const itemKind = item.thumbnailKind ?? "image";

      return {
        onPointerEnter: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          activeElRef.current = e.currentTarget as HTMLElement;

          const quickTransition = leaveTimerRef.current !== null;
          if (quickTransition) {
            clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = null;
          }

          const textEls = document.querySelectorAll("[data-cursor-text]");
          textRectsRef.current = Array.from(textEls, (el) => el.getBoundingClientRect());

          setSrc(url);
          setKind(itemKind);

          if (quickTransition) {
            // Slide smoothly — keep current position, let lerp move to new target
            targetRef.current.x = e.clientX;
            targetRef.current.y = e.clientY;
          } else {
            nudgeRef.current = 0;
            thumbSizeRef.current = { w: 0, h: 0 };

            targetRef.current.x = e.clientX;
            targetRef.current.y = e.clientY;
            currentRef.current.x = e.clientX;
            currentRef.current.y = e.clientY;

            const tw = thumbSizeRef.current.w;
            const th = thumbSizeRef.current.h;
            const flipX = e.clientX + OFFSET + tw + EDGE_PAD > window.innerWidth;
            const flipY = e.clientY + OFFSET + th + EDGE_PAD > window.innerHeight;
            appliedOffsetRef.current.x = flipX ? -OFFSET - tw : OFFSET;
            appliedOffsetRef.current.y = flipY ? -OFFSET - th : OFFSET;

            const el = thumbRef.current;
            if (el) {
              el.style.transformOrigin = `${flipX ? "right" : "left"} ${flipY ? "bottom" : "top"}`;
              el.style.translate = `${e.clientX + appliedOffsetRef.current.x}px ${e.clientY + appliedOffsetRef.current.y}px`;
            }

            visibleRef.current = true;
            setVisible(true);
          }

          startLoop();
        },

        onPointerMove: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          targetRef.current.x = e.clientX;
          targetRef.current.y = e.clientY;
          startLoop();
        },

        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          leaveTimerRef.current = setTimeout(() => {
            leaveTimerRef.current = null;
            hideThumb();
          }, TRANSITION_GRACE_MS);
        },
      };
    },
    [items, startLoop, hideThumb],
  );

  return {
    thumbRef,
    thumbSrc: src,
    thumbKind: kind,
    isVisible: visible,
    handleError,
    handleMediaReady: measureThumb,
    getBlockHandlers,
  };
}
