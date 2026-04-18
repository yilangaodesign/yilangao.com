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
const LERP_THRESHOLD = 0.5;
const TRANSITION_GRACE_MS = 150;
// Mirrors $portfolio-spacer-1x (8px) — breathing space between headline and rail
const RAIL_GAP = 8;
const FLIP_DISSOLVE_MS = 120;

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
  const appliedOffsetRef = useRef({ x: OFFSET });
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeElRef = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(false);
  const headlineElRef = useRef<Element | null>(null);
  const railYRef = useRef({ current: 0, target: 0 });
  const flipSideRef = useRef<"below" | "above">("below");
  const dissolvingRef = useRef(false);
  const dissolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const easing = prefersReduced ? 1.0 : LERP_FACTOR;
  const flipEasing = prefersReduced ? 1.0 : FLIP_EASING;

  const tick = useCallback(() => {
    const cur = currentRef.current;
    const tgt = targetRef.current;

    cur.x += (tgt.x - cur.x) * easing;

    if (thumbSizeRef.current.w === 0 && thumbRef.current) {
      thumbSizeRef.current.w = thumbRef.current.offsetWidth;
      thumbSizeRef.current.h = thumbRef.current.offsetHeight;
    }

    const tw = thumbSizeRef.current.w;
    const th = thumbSizeRef.current.h;

    const targetOffsetX =
      cur.x + OFFSET + tw + EDGE_PAD > window.innerWidth ? -OFFSET - tw : OFFSET;

    const ao = appliedOffsetRef.current;
    ao.x += (targetOffsetX - ao.x) * flipEasing;

    const naturalX = cur.x + ao.x;

    // Rail y: determined by headline rect, not cursor
    const headlineRect = headlineElRef.current?.getBoundingClientRect() ?? null;

    if (headlineRect && th > 0) {
      const fitsBelow =
        headlineRect.bottom + RAIL_GAP + th + EDGE_PAD <= window.innerHeight;
      const newSide = fitsBelow ? "below" : "above";

      const targetRailY = fitsBelow
        ? headlineRect.bottom + RAIL_GAP
        : Math.max(0, headlineRect.top - RAIL_GAP - th);

      if (newSide !== flipSideRef.current && !dissolvingRef.current) {
        dissolvingRef.current = true;
        flipSideRef.current = newSide;

        if (thumbRef.current) {
          thumbRef.current.dataset.dissolving = "";
        }

        dissolveTimerRef.current = setTimeout(() => {
          dissolveTimerRef.current = null;

          const freshX = currentRef.current.x + appliedOffsetRef.current.x;

          railYRef.current.current = targetRailY;
          railYRef.current.target = targetRailY;

          if (thumbRef.current) {
            thumbRef.current.style.translate = `${freshX}px ${targetRailY}px`;
            delete thumbRef.current.dataset.dissolving;
          }

          dissolvingRef.current = false;
        }, FLIP_DISSOLVE_MS);
      } else if (!dissolvingRef.current) {
        flipSideRef.current = newSide;
        railYRef.current.target = targetRailY;
      }
    }

    const ry = railYRef.current;
    ry.current += (ry.target - ry.current) * easing;
    const naturalY = ry.current;

    if (!dissolvingRef.current && thumbRef.current) {
      const originX = targetOffsetX >= 0 ? "left" : "right";
      const originY = flipSideRef.current === "below" ? "top" : "bottom";
      thumbRef.current.style.transformOrigin = `${originX} ${originY}`;
      thumbRef.current.style.translate = `${naturalX}px ${naturalY}px`;
    }

    const deltaX = Math.abs(tgt.x - cur.x);
    const flipDeltaX = Math.abs(targetOffsetX - ao.x);
    const railDeltaY = Math.abs(ry.target - ry.current);

    if (
      visibleRef.current ||
      deltaX > LERP_THRESHOLD ||
      flipDeltaX > LERP_THRESHOLD ||
      railDeltaY > LERP_THRESHOLD
    ) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
    }
  }, [easing, flipEasing]);

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
      if (dissolveTimerRef.current !== null) {
        clearTimeout(dissolveTimerRef.current);
        dissolveTimerRef.current = null;
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
    if (dissolveTimerRef.current !== null) {
      clearTimeout(dissolveTimerRef.current);
      dissolveTimerRef.current = null;
    }
    dissolvingRef.current = false;
    if (thumbRef.current) {
      delete thumbRef.current.dataset.dissolving;
    }
    headlineElRef.current = null;
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
          headlineElRef.current =
            e.currentTarget.querySelector("[data-cursor-text]");

          // Cancel any pending dissolve from a previous interaction
          if (dissolveTimerRef.current) {
            clearTimeout(dissolveTimerRef.current);
            dissolveTimerRef.current = null;
            dissolvingRef.current = false;
            if (thumbRef.current) {
              delete thumbRef.current.dataset.dissolving;
            }
          }

          const quickTransition = leaveTimerRef.current !== null;
          if (quickTransition) {
            clearTimeout(leaveTimerRef.current!);
            leaveTimerRef.current = null;
          }

          setSrc(url);
          setKind(itemKind);

          // Compute rail y from headline rect
          const headlineRect =
            headlineElRef.current?.getBoundingClientRect() ?? null;
          const th = thumbSizeRef.current.h;
          const fitsBelow =
            headlineRect && th > 0
              ? headlineRect.bottom + RAIL_GAP + th + EDGE_PAD <=
                window.innerHeight
              : true;
          const railY =
            headlineRect && th > 0
              ? fitsBelow
                ? headlineRect.bottom + RAIL_GAP
                : Math.max(0, headlineRect.top - RAIL_GAP - th)
              : e.clientY + OFFSET;
          flipSideRef.current = fitsBelow ? "below" : "above";

          if (quickTransition) {
            targetRef.current.x = e.clientX;
            // Only update rail target — current stays at old position for curved arc
            railYRef.current.target = railY;
          } else {
            thumbSizeRef.current = { w: 0, h: 0 };

            targetRef.current.x = e.clientX;
            currentRef.current.x = e.clientX;

            // Snap rail y (no lerp on first appear)
            railYRef.current.current = railY;
            railYRef.current.target = railY;

            const tw = thumbSizeRef.current.w;
            const flipX =
              e.clientX + OFFSET + tw + EDGE_PAD > window.innerWidth;
            appliedOffsetRef.current.x = flipX ? -OFFSET - tw : OFFSET;

            const el = thumbRef.current;
            if (el) {
              el.style.transformOrigin = `${flipX ? "right" : "left"} ${fitsBelow ? "top" : "bottom"}`;
              el.style.translate = `${e.clientX + appliedOffsetRef.current.x}px ${railY}px`;
            }

            visibleRef.current = true;
            setVisible(true);
          }

          startLoop();
        },

        onPointerMove: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          targetRef.current.x = e.clientX;
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
