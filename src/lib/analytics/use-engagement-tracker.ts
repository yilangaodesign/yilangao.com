"use client";

import { useEffect, useRef } from "react";
import { track, canonicalSlug } from "@/lib/analytics/mixpanel";

// Module-level state survives SPA navigation, resets on full page reload.
const engagedSlugs = new Set<string>();
let deepExplorerFired = false;

/**
 * Finds the best scroll anchor for detecting "scrolled past intro."
 * Fallback chain: #intro -> first heading with an id -> null (time-only).
 */
function findScrollAnchor(): HTMLElement | null {
  const intro = document.getElementById("intro");
  if (intro) return intro;

  const firstHeading = document.querySelector<HTMLElement>(
    "h2[id], h3[id]"
  );
  return firstHeading;
}

/**
 * Tracks case study engagement depth (Tier 4), cross-study exploration
 * (Tier 5), and dwell time on unmount.
 *
 * Tier 4 — Case Study Engaged: fires once per slug per session when the
 *   visitor has 5+ seconds of active time AND has scrolled past the intro.
 * Tier 5 — Deep Explorer: fires once per session when 2+ slugs reach Tier 4.
 * Case Study Dwell: fires on unmount with total active time.
 */
export function useEngagementTracker(
  slug: string,
  contentFormat: "caseStudy" | "essay"
) {
  const activeMsRef = useRef(0);
  const lastResumedRef = useRef(Date.now());
  const scrolledPastIntroRef = useRef(false);
  const engagedFiredRef = useRef(false);
  const dwellFiredRef = useRef(false);
  const timerElapsedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slugRef = useRef(slug);
  const formatRef = useRef(contentFormat);
  slugRef.current = slug;
  formatRef.current = contentFormat;

  useEffect(() => {
    // Reset per-mount state
    activeMsRef.current = 0;
    lastResumedRef.current = Date.now();
    scrolledPastIntroRef.current = false;
    engagedFiredRef.current = false;
    dwellFiredRef.current = false;
    timerElapsedRef.current = false;

    function getActiveMs(): number {
      const sinceResume = document.hidden ? 0 : Date.now() - lastResumedRef.current;
      return activeMsRef.current + sinceResume;
    }

    function tryFireEngaged() {
      if (engagedFiredRef.current) return;
      if (!timerElapsedRef.current || !scrolledPastIntroRef.current) return;

      engagedFiredRef.current = true;
      const dwellSeconds = Math.round(getActiveMs() / 1000);

      track("Case Study Engaged", {
        case_study: canonicalSlug(slugRef.current),
        content_format: formatRef.current,
        dwell_seconds: dwellSeconds,
      });

      engagedSlugs.add(canonicalSlug(slugRef.current));

      if (engagedSlugs.size >= 2 && !deepExplorerFired) {
        deepExplorerFired = true;
        track("Deep Explorer", {
          case_studies_engaged: Array.from(engagedSlugs).join(","),
          total_count: engagedSlugs.size,
        });
      }
    }

    // Visibility change: pause/resume active time tracking
    function handleVisibilityChange() {
      if (document.hidden) {
        activeMsRef.current += Date.now() - lastResumedRef.current;
      } else {
        lastResumedRef.current = Date.now();
      }
    }

    // 5-second engagement timer
    timeoutRef.current = setTimeout(() => {
      timerElapsedRef.current = true;
      tryFireEngaged();
    }, 5000);

    // Scroll observer
    const anchor = findScrollAnchor();
    if (anchor) {
      let hasBeenVisible = false;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              hasBeenVisible = true;
            } else if (hasBeenVisible && !entry.isIntersecting) {
              // Element was visible then left viewport — user scrolled past
              scrolledPastIntroRef.current = true;
              tryFireEngaged();
              observerRef.current?.disconnect();
            }
          }
        },
        { threshold: 0 }
      );
      observerRef.current.observe(anchor);
    } else {
      // No anchor found — time-only trigger at 5s
      scrolledPastIntroRef.current = true;
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      observerRef.current?.disconnect();

      // Fire dwell event on unmount
      if (!dwellFiredRef.current) {
        dwellFiredRef.current = true;
        const totalMs = getActiveMs();
        track("Case Study Dwell", {
          case_study: canonicalSlug(slugRef.current),
          content_format: formatRef.current,
          dwell_seconds: Math.round(totalMs / 1000),
        });
      }
    };
  }, [slug]);
}
