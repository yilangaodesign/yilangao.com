"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/mixpanel";

const IOS_DEDUP_MS = 300_000; // 5 minutes

/**
 * Tracks authenticated session counts per company and fires a "Repeat Session"
 * event when a returning visitor (session_count > 1) performs a qualifying
 * action (3 s dwell OR navigates to a second page).
 *
 * Session detection uses sessionStorage (cleared on tab close) with a
 * localStorage timestamp fallback to avoid over-counting on iOS Safari,
 * which clears sessionStorage on app-switch.
 */
export function useSessionTracker(companySlug: string | null) {
  const pathname = usePathname();
  const sessionCountRef = useRef(0);
  const repeatFired = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialPathRef = useRef<string | null>(null);

  // Session counting — runs once when companySlug becomes available
  useEffect(() => {
    if (!companySlug) return;

    const sessionKey = `yg_session_id_${companySlug}`;
    const countKey = `yg_session_count_${companySlug}`;
    const lastSessionKey = `yg_last_session_${companySlug}`;
    const lastActiveKey = `yg_last_active_${companySlug}`;

    const existingSessionId = sessionStorage.getItem(sessionKey);
    const lastActiveStr = localStorage.getItem(lastActiveKey);
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

    if (!existingSessionId) {
      const gap = Date.now() - lastActive;
      if (lastActive > 0 && gap < IOS_DEDUP_MS) {
        // iOS reload — reuse previous session, no increment
        const prevId = localStorage.getItem(lastSessionKey) ?? crypto.randomUUID();
        sessionStorage.setItem(sessionKey, prevId);
      } else {
        // Genuine new session
        const newId = crypto.randomUUID();
        sessionStorage.setItem(sessionKey, newId);
        const prevCount = parseInt(localStorage.getItem(countKey) ?? "0", 10);
        const newCount = prevCount + 1;
        localStorage.setItem(countKey, String(newCount));
        localStorage.setItem(lastSessionKey, newId);
        sessionCountRef.current = newCount;
      }
    }

    // Always read the current count (covers the reuse path above)
    if (sessionCountRef.current === 0) {
      sessionCountRef.current = parseInt(localStorage.getItem(countKey) ?? "1", 10);
    }

    localStorage.setItem(lastActiveKey, String(Date.now()));
  }, [companySlug]);

  // Capture the initial pathname so we can detect navigation
  useEffect(() => {
    if (initialPathRef.current === null) {
      initialPathRef.current = pathname;
    }
  }, [pathname]);

  // Qualifying action: 3-second dwell timer
  useEffect(() => {
    if (!companySlug || sessionCountRef.current <= 1) return;

    timerRef.current = setTimeout(() => {
      if (!repeatFired.current) {
        repeatFired.current = true;
        track("Repeat Session", { session_number: sessionCountRef.current });
      }
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [companySlug]);

  // Qualifying action: pathname change (navigation to a second page)
  useEffect(() => {
    if (!companySlug || sessionCountRef.current <= 1) return;
    if (initialPathRef.current === null || pathname === initialPathRef.current) return;

    if (!repeatFired.current) {
      repeatFired.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      track("Repeat Session", { session_number: sessionCountRef.current });
    }
  }, [pathname, companySlug]);
}
