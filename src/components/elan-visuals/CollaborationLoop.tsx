"use client";

import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/DropdownMenu/DropdownMenu";
import styles from "./collaboration-loop.module.scss";

// ── Step metadata ────────────────────────────────────────────────────────────

type Step = {
  step: number;
  label: string;
  file: string;
  subtitle: string;
  footer: string;
};

const STEPS: Step[] = [
  {
    step: 1,
    label: "Designer Feedback",
    file: "Round 5 of 5",
    subtitle: "The same component, the fifth correction",
    footer:
      "Sidebar nav items have been through 4 rounds already. Each round fixed one state and broke another. The designer flags it again.",
  },
  {
    step: 2,
    label: "Pre-Flight Routing",
    file: "AGENTS.md",
    subtitle: "Classify the feedback and activate the right skill",
    footer:
      "The agent routes to design-iteration. But this time it also detects a signal: 5 rounds on the same component means the root cause is architectural.",
  },
  {
    step: 3,
    label: "Read Existing Knowledge",
    file: "docs/design-anti-patterns.md",
    subtitle: "Search the anti-pattern catalog for a match",
    footer:
      "The agent scans 45 documented anti-patterns. Nothing matches. This is a new failure mode the system hasn't seen before.",
  },
  {
    step: 4,
    label: "Diagnose",
    file: "design-iteration skill",
    subtitle: "Why did 4 correct fixes still produce a broken component?",
    footer:
      "Each round was locally correct but globally incoherent. Active looked right until hover was fixed. Hover looked right until expanded was fixed. No state table existed.",
  },
  {
    step: 5,
    label: "Implement Fix",
    file: "sidebar.tsx",
    subtitle: "Replace 4 ad-hoc conditionals with one state model",
    footer:
      "The fix isn't a CSS tweak. It's a four-state table that defines every visual property for every state before writing a single line of conditional logic.",
  },
  {
    step: 6,
    label: "Feedback Log Entry",
    file: "docs/design-feedback-log.md",
    subtitle: "Record the complete state model as the resolution",
    footer:
      "FB-075 documents not just what changed, but the four-state table itself. Future agents can copy the model for any interactive component.",
  },
  {
    step: 7,
    label: "Anti-Patterns Created",
    file: "docs/design-anti-patterns.md",
    subtitle: "One incident produces two new anti-patterns",
    footer:
      "AP-046 captures the symptom (inconsistent states across nav item types). AP-048 captures the root cause (incremental state-by-state implementation without a holistic model).",
  },
  {
    step: 8,
    label: "Principle Promoted",
    file: "docs/design.md",
    subtitle: "A new design principle enters the system",
    footer:
      "Section 7.4: 'Model All States Before Writing Any Code.' Not a guardrail the agent must obey, but a design principle every future component must follow.",
  },
];

const SPEED_OPTIONS = [
  { label: "0.5x", ms: 8000 },
  { label: "1x", ms: 4000 },
  { label: "2x", ms: 2000 },
];

// ── Step visuals ─────────────────────────────────────────────────────────────

function VisualFeedback() {
  return (
    <div className={styles.vizChat}>
      <div className={styles.vizChatRow}>
        <span className={styles.vizChatAvatar} />
        <div className={styles.vizChatContent}>
          <span className={styles.vizChatName}>Designer</span>
          <div className={styles.vizChatBubble}>
            The nav highlight doesn't persist when I navigate. Hover text still
            isn't black. And why does the expanded parent have a blue background
            when children don't?
          </div>
          <span className={styles.vizChatMeta}>Round 5 - sidebar nav items</span>
        </div>
      </div>
    </div>
  );
}

function VisualRouting() {
  const routes = [
    { label: "UI / visuals / spacing?", match: true },
    { label: "Infra / build / data?", match: false },
    { label: "Copy / labels / tone?", match: false },
    { label: "Playground files?", match: false },
    { label: "CMS fields?", match: false },
  ];
  return (
    <div className={styles.vizRouting}>
      <div className={styles.vizRoutingList}>
        {routes.map((r) => (
          <div
            key={r.label}
            className={`${styles.vizRoutingItem} ${r.match ? styles.vizRoutingMatch : ""}`}
          >
            <span className={styles.vizRoutingCheck}>{r.match ? "\u2713" : ""}</span>
            {r.label}
          </div>
        ))}
      </div>
      <div className={styles.vizRoutingArrow}>\u2192</div>
      <div className={styles.vizRoutingTarget}>
        <span className={styles.vizRoutingTargetLabel}>design-iteration</span>
        <span className={styles.vizRoutingTargetSub}>SKILL.md activated</span>
      </div>
    </div>
  );
}

function VisualKnowledge() {
  const entries = [
    { id: "AP-011", name: "Pointer-event leak through overlays", match: false },
    { id: "AP-022", name: "Focus ring suppressed on keyboard", match: false },
    { id: "AP-025", name: "Double-tap target on touch devices", match: false },
    { id: "AP-035", name: "Hover stuck on mobile viewport", match: false },
  ];
  return (
    <div className={styles.vizDoc}>
      <div className={styles.vizDocHeader}>
        design-anti-patterns.md
        <span className={styles.vizDocCount}>45 entries scanned</span>
      </div>
      <div className={styles.vizDocBody}>
        {entries.map((e) => (
          <div key={e.id} className={styles.vizDocRow}>
            <span className={styles.vizDocId}>{e.id}</span>
            <span className={styles.vizDocName}>{e.name}</span>
          </div>
        ))}
        <div className={`${styles.vizDocRow} ${styles.vizDocRowNoMatch}`}>
          <span className={styles.vizDocNoMatchLabel}>No match found</span>
          <span className={styles.vizDocBadge}>NEW PATTERN</span>
        </div>
      </div>
    </div>
  );
}

function VisualDiagnose() {
  const rounds = [
    { round: 1, fixed: "Active state", broke: "Hover contrast" },
    { round: 2, fixed: "Hover text color", broke: "Expanded bg" },
    { round: 3, fixed: "Expanded parent", broke: "Active across types" },
    { round: 4, fixed: "Type consistency", broke: "Hover background" },
    { round: 5, fixed: null, broke: null },
  ];
  return (
    <div className={styles.vizRounds}>
      <div className={styles.vizRoundsTimeline}>
        {rounds.map((r) => (
          <div
            key={r.round}
            className={`${styles.vizRoundsItem} ${r.round === 5 ? styles.vizRoundsItemFinal : ""}`}
          >
            <div className={styles.vizRoundsNum}>{r.round}</div>
            {r.fixed ? (
              <div className={styles.vizRoundsDetail}>
                <span className={styles.vizRoundsFixed}>{r.fixed}</span>
                <span className={styles.vizRoundsBroke}>{r.broke}</span>
              </div>
            ) : (
              <div className={styles.vizRoundsDetail}>
                <span className={styles.vizRoundsInsight}>Define complete state model</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.vizRoundsVerdict}>
        Root cause: no state table was defined upfront
      </div>
    </div>
  );
}

function VisualDiff() {
  const states = [
    {
      name: "Default",
      text: "dark gray",
      weight: "normal",
      bg: "none",
      hover: "gray bg",
    },
    {
      name: "Hover",
      text: "black",
      weight: "normal",
      bg: "neutral gray",
      hover: "n/a",
    },
    {
      name: "Expanded",
      text: "black",
      weight: "medium",
      bg: "none",
      hover: "gray bg",
    },
    {
      name: "Active",
      text: "accent blue",
      weight: "medium",
      bg: "none",
      hover: "blue tint",
    },
  ];
  return (
    <div className={styles.vizStateTable}>
      <div className={styles.vizStateHeader}>sidebar.tsx - Four-state model</div>
      <div className={styles.vizStateGrid}>
        <div className={styles.vizStateColHead} />
        <div className={styles.vizStateColHead}>Text</div>
        <div className={styles.vizStateColHead}>Weight</div>
        <div className={styles.vizStateColHead}>Resting bg</div>
        <div className={styles.vizStateColHead}>Hover bg</div>
        {states.map((s) => (
          <Fragment key={s.name}>
            <div className={styles.vizStateRowLabel}>{s.name}</div>
            <div className={styles.vizStateCell}>{s.text}</div>
            <div className={styles.vizStateCell}>{s.weight}</div>
            <div className={styles.vizStateCell}>{s.bg}</div>
            <div className={styles.vizStateCell}>{s.hover}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function VisualLogEntry() {
  const entries = [
    { id: "FB-073", text: "Button hover states in dark mode", isNew: false },
    { id: "FB-074", text: "Inter-button spacing too cramped", isNew: false },
    {
      id: "FB-075",
      text: "Unified four-state model for sidebar nav",
      isNew: true,
    },
  ];
  return (
    <div className={styles.vizLog}>
      <div className={styles.vizLogHeader}>design-feedback-log.md</div>
      <div className={styles.vizLogBody}>
        {[...entries].reverse().map((e) => (
          <div
            key={e.id}
            className={`${styles.vizLogRow} ${e.isNew ? styles.vizLogRowNew : styles.vizLogRowOld}`}
          >
            <span className={styles.vizLogId}>{e.id}</span>
            <span className={styles.vizLogText}>{e.text}</span>
            {e.isNew && <span className={styles.vizLogBadge}>NEW</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualCounter() {
  const aps = [
    {
      id: "AP-046",
      name: "Inconsistent Active/Hover Across Nav Types",
      type: "Symptom",
    },
    {
      id: "AP-048",
      name: "Incremental State-by-State Implementation",
      type: "Root cause",
    },
  ];
  return (
    <div className={styles.vizDualAP}>
      {aps.map((ap) => (
        <div key={ap.id} className={styles.vizDualAPCard}>
          <div className={styles.vizDualAPHeader}>
            <span className={styles.vizDualAPId}>{ap.id}</span>
            <span className={styles.vizDualAPBadge}>{ap.type}</span>
          </div>
          <span className={styles.vizDualAPName}>{ap.name}</span>
          <div className={styles.vizDualAPMeta}>
            <span className={styles.vizCounterPill}>FB-075</span>
            <span className={styles.vizDualAPNew}>NEW</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function VisualGuardrail() {
  const tiers = [
    { label: "Feedback logged", active: true },
    { label: "Anti-patterns created", active: true },
    { label: "Design principle", active: true },
  ];
  return (
    <div className={styles.vizGuardrail}>
      <div className={styles.vizGuardrailMeter}>
        {tiers.map((t, i) => (
          <div key={t.label} className={styles.vizGuardrailTier}>
            <div className={`${styles.vizGuardrailDot} ${t.active ? styles.vizGuardrailDotActive : ""}`}>
              {i + 1}
            </div>
            <span className={`${styles.vizGuardrailTierLabel} ${t.active ? styles.vizGuardrailTierLabelActive : ""}`}>
              {t.label}
            </span>
          </div>
        ))}
        <div className={styles.vizGuardrailTrack}>
          <div className={styles.vizGuardrailTrackFill} />
        </div>
      </div>
      <div className={styles.vizGuardrailRule}>
        <div className={styles.vizGuardrailRuleHeader}>design.md - Section 7.4</div>
        <div className={styles.vizGuardrailRuleText}>
          Model All States Before Writing Any Code. Before implementing any
          interactive component, enumerate every visual state and define the
          full property set for each.
        </div>
      </div>
    </div>
  );
}

const STEP_VISUALS: React.ComponentType[] = [
  VisualFeedback,
  VisualRouting,
  VisualKnowledge,
  VisualDiagnose,
  VisualDiff,
  VisualLogEntry,
  VisualCounter,
  VisualGuardrail,
];

// ── Main component ───────────────────────────────────────────────────────────

export default function CollaborationLoop() {
  const [activeStep, setActiveStep] = useState(0);
  // Auto-play by default; the reduced-motion effect below pauses for users
  // who opt out of motion. The transport button toggles pause/resume.
  const [playing, setPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(1);
  const trackFillRef = useRef<HTMLDivElement | null>(null);
  const prevActiveStepRef = useRef(activeStep);

  const current = STEPS[activeStep];
  // Initial fill (also used as the SSR / first-paint width before the
  // imperative animation effect runs).
  const initialFillPercent = STEPS.length > 1 ? (activeStep / (STEPS.length - 1)) * 100 : 0;
  const Visual = STEP_VISUALS[activeStep];

  const goNext = useCallback(() => {
    setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0));
  }, []);

  const goPrev = useCallback(() => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1));
  }, []);

  // Progress-bar animation for the track fill between step dots.
  // The fill smoothly grows from the active step's dot position to the next
  // step's dot position over the step's display duration, so the bar reads
  // as a countdown to the next auto-flip. When the progress reaches 1, we
  // advance the step, which re-runs this effect with the new fillBase /
  // fillTarget and restarts the RAF cycle.
  useEffect(() => {
    const el = trackFillRef.current;
    if (!el) return;

    const denom = STEPS.length - 1;
    const fillBase = (activeStep / denom) * 100;
    const fillTarget = Math.min(((activeStep + 1) / denom) * 100, 100);
    const ms = SPEED_OPTIONS[speedIdx].ms;

    const stepChanged = prevActiveStepRef.current !== activeStep;
    prevActiveStepRef.current = activeStep;

    if (!playing) {
      // Pause semantics: if the step changed while paused (dot / prev / next
      // click), snap to the new step's base. If only `playing` toggled off
      // mid-step, freeze the bar at its current rendered width.
      if (stepChanged) {
        el.style.transition = "";
        el.style.width = `${fillBase}%`;
      }
      return;
    }

    // Playing: disable the CSS transition (RAF drives each frame directly),
    // anchor to fillBase, then animate toward fillTarget over `ms`.
    el.style.transition = "none";
    el.style.width = `${fillBase}%`;

    let startTime: number | null = null;
    let rafId = 0;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const p = Math.min(elapsed / ms, 1);
      const fill = fillBase + (fillTarget - fillBase) * p;
      el.style.width = `${fill}%`;
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0));
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [playing, speedIdx, activeStep]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setPlaying(false);
  }, []);

  const handleDotClick = (i: number) => {
    setPlaying(false);
    setActiveStep(i);
  };

  const handlePrev = () => {
    setPlaying(false);
    goPrev();
  };

  const handleNext = () => {
    setPlaying(false);
    goNext();
  };

  return (
    <div className={styles.container} role="region" aria-label="Correction lifecycle walkthrough">
      {/* Step dots */}
      <div className={styles.stepNav}>
        <div className={styles.stepTrack} aria-hidden="true">
          <div
            ref={trackFillRef}
            className={styles.stepTrackFill}
            style={{ width: `${initialFillPercent}%` }}
          />
        </div>
        {STEPS.map((s, i) => {
          let cls = styles.stepDot;
          if (i < activeStep) cls += ` ${styles.stepDotCompleted}`;
          if (i === activeStep) cls += ` ${styles.stepDotActive}`;
          return (
            <div key={s.step} className={styles.stepDotWrap}>
              <button
                className={cls}
                onClick={() => handleDotClick(i)}
                aria-label={`Step ${s.step}: ${s.label}`}
                aria-pressed={i === activeStep}
              >
                {s.step}
              </button>
              <span className={`${styles.stepDotLabel} ${i === activeStep ? styles.stepDotLabelActive : ""}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className={styles.detailPanel} role="status" aria-live="polite">
        <div className={styles.detailHeader}>
          <div className={styles.detailHeaderLeft}>
            <span className={styles.detailTitle}>{current.label}</span>
          </div>
          <span className={styles.detailFile}>{current.file}</span>
        </div>

        <p className={styles.detailSubtitle}>{current.subtitle}</p>

        <div className={styles.vizArea}>
          <Visual />
        </div>

        <p className={styles.detailFooter}>{current.footer}</p>
      </div>

      {/* Transport bar */}
      <div className={styles.transport}>
        <div className={styles.transportLeft}>
          <button
            className={`${styles.transportBtn} ${styles.transportPlayBtn}`}
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? "\u275A\u275A" : "\u25B6"}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={styles.transportSpeedTrigger}
                aria-label={`Playback speed: ${SPEED_OPTIONS[speedIdx].label}`}
              >
                <span className={styles.transportSpeedTriggerLabel}>
                  {SPEED_OPTIONS[speedIdx].label}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className={styles.transportSpeedCaret}
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={6} size="sm">
              {SPEED_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={opt.label}
                  onSelect={() => setSpeedIdx(i)}
                  trailing={
                    i === speedIdx ? (
                      <span className={styles.transportSpeedActiveMark} aria-hidden="true">
                        {"\u2713"}
                      </span>
                    ) : null
                  }
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={styles.transportRight}>
          <button className={styles.transportBtn} onClick={handlePrev} aria-label="Previous step">{"\u2039"}</button>
          <span className={styles.transportCounter}>
            {activeStep + 1} / {STEPS.length}
          </span>
          <button className={styles.transportBtn} onClick={handleNext} aria-label="Next step">{"\u203A"}</button>
        </div>
      </div>
    </div>
  );
}
