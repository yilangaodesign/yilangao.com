"use client";

import styles from "@/components/smart-suggestion-toast.module.scss";
import { X } from "lucide-react";

const RING_RADIUS = 11;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function ToastPreviewPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <p className="text-sm opacity-60 font-sans">
        Toast preview — hover to pause countdown
      </p>

      {/* Inline version so you can see it mid-page */}
      <div style={{ position: "relative", width: "100%", maxWidth: 560 }}>
        <div className={styles.toast} style={{ position: "relative", animation: "none" }}>
          <div className={styles.body}>
            <span className={styles.primary}>
              3 more docs also tagged &ldquo;Onboarding&rdquo; — move to
              New Hire Setup?
            </span>
            <span className={styles.secondary}>
              Based on the 4 you just reorganized
            </span>
          </div>

          <div className={styles.actions}>
            <button className={styles.close} aria-label="Dismiss suggestion">
              <svg className={styles.ring} viewBox="0 0 28 28">
                <circle
                  className={styles.ringTrack}
                  cx="14"
                  cy="14"
                  r={RING_RADIUS}
                />
                <circle
                  className={styles.ringProgress}
                  cx="14"
                  cy="14"
                  r={RING_RADIUS}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={0}
                  style={{ "--ring-circumference": `${RING_CIRCUMFERENCE}px` } as React.CSSProperties}
                />
              </svg>
              <X className={styles.icon} />
            </button>

            <button className={styles.cta}>Move</button>
          </div>
        </div>
      </div>

      {/* Fixed-position version at the bottom (real placement) */}
      <div className={styles.wrapper}>
        <div className={styles.toast} style={{ animation: "none" }}>
          <div className={styles.body}>
            <span className={styles.primary}>
              2 more docs unrelated to &ldquo;Q4 Planning&rdquo; — move to
              Uncategorized?
            </span>
            <span className={styles.secondary}>
              Based on the 3 you just reorganized
            </span>
          </div>

          <div className={styles.actions}>
            <button className={styles.close} aria-label="Dismiss suggestion">
              <svg className={styles.ring} viewBox="0 0 28 28">
                <circle
                  className={styles.ringTrack}
                  cx="14"
                  cy="14"
                  r={RING_RADIUS}
                />
                <circle
                  className={styles.ringProgress}
                  cx="14"
                  cy="14"
                  r={RING_RADIUS}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={0}
                  style={{ "--ring-circumference": `${RING_CIRCUMFERENCE}px` } as React.CSSProperties}
                />
              </svg>
              <X className={styles.icon} />
            </button>

            <button className={styles.cta}>Move</button>
          </div>
        </div>
      </div>
    </div>
  );
}
