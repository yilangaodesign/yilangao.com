"use client";

import { useState, useRef, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./elan-visuals.module.scss";

type Tab = "deadZone" | "closestElement" | "transformConflict" | "pairedChannels";

const TAB_LABELS: Record<Tab, string> = {
  deadZone: "Click vs. Drag",
  closestElement: "Pointer Mapping",
  transformConflict: "FM Transform",
  pairedChannels: "Paired Channels",
};

// ── Annotation Icons ────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className={styles.annotationIcon} width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className={styles.annotationIcon} width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 5L9 9M9 5L5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ── Tab 1: Click vs. Drag (Dead Zone) ───────────────────────────────────────
// Independent state per side so the user feels the interaction difference.
// Live status indicator makes the state machine visible (idle → drag vs. idle → pending → drag/click).

type BeforeMode = "idle" | "dragging";
type AfterMode = "idle" | "pending" | "dragging" | "clicked";

function DeadZoneDiagram() {
  const [beforeY, setBeforeY] = useState(50);
  const [afterY, setAfterY] = useState(50);
  const [beforeMode, setBeforeMode] = useState<BeforeMode>("idle");
  const [afterMode, setAfterMode] = useState<AfterMode>("idle");

  const afterModeRef = useRef<AfterMode>("idle");
  const startYRef = useRef(0);
  const beforeAreaRef = useRef<HTMLDivElement>(null);
  const afterRailRef = useRef<HTMLDivElement>(null);

  const sections = ["Intro", "Tokens", "Components", "Process", "Result"];
  const beforeIndex = Math.min(Math.floor(beforeY / 20), sections.length - 1);
  const afterIndex = Math.min(Math.floor(afterY / 20), sections.length - 1);

  const setAfterModeSync = useCallback((m: AfterMode) => {
    afterModeRef.current = m;
    setAfterMode(m);
  }, []);

  // Before: no intent detection — hovering the demo area immediately scrubs
  const handleBeforeMove = useCallback((e: React.MouseEvent) => {
    setBeforeMode("dragging");
    const rect = beforeAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setBeforeY(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
  }, []);

  const handleBeforeLeave = useCallback(() => {
    setBeforeMode("idle");
  }, []);

  // After: 3px dead zone — pending → drag or click
  const handleAfterDown = useCallback((e: React.PointerEvent) => {
    setAfterModeSync("pending");
    startYRef.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [setAfterModeSync]);

  const handleAfterMove = useCallback((e: React.PointerEvent) => {
    const mode = afterModeRef.current;
    if (mode !== "pending" && mode !== "dragging") return;
    const delta = Math.abs(e.clientY - startYRef.current);
    if (mode === "pending" && delta <= 3) return;
    setAfterModeSync("dragging");
    const rect = afterRailRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAfterY(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
  }, [setAfterModeSync]);

  const handleAfterUp = useCallback((e: React.PointerEvent) => {
    if (afterModeRef.current === "pending") {
      const rect = afterRailRef.current?.getBoundingClientRect();
      if (rect) {
        const pct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        const idx = Math.min(Math.floor(pct / 20), sections.length - 1);
        setAfterY(idx * 20 + 10);
      }
      setAfterModeSync("clicked");
      setTimeout(() => setAfterModeSync("idle"), 1200);
    } else {
      setAfterModeSync("idle");
    }
  }, [sections.length, setAfterModeSync]);

  const beforeStatusClass = beforeMode === "dragging" ? styles.deadZoneDragging : "";
  const afterStatusClass =
    afterMode === "pending" ? styles.deadZonePending
    : afterMode === "dragging" ? styles.deadZoneDragging
    : afterMode === "clicked" ? styles.deadZoneClicked
    : "";

  return (
    <div className={styles.beforeAfterGrid}>
      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>Before</Eyebrow>
        <div
          ref={beforeAreaRef}
          className={styles.deadZoneContent}
          onMouseMove={handleBeforeMove}
          onMouseLeave={handleBeforeLeave}
        >
          <div className={styles.deadZoneRail}>
            <div className={styles.deadZoneTrack}>
              {sections.map((_, i) => (
                <div key={i} className={`${styles.deadZoneTick} ${i === beforeIndex ? styles.deadZoneTickActive : ""}`} />
              ))}
            </div>
            <div className={styles.deadZoneThumb} style={{ top: `${beforeY}%` }} />
          </div>
          <div className={styles.deadZoneSections}>
            {sections.map((s, i) => (
              <div key={s} className={`${styles.deadZoneSection} ${i === beforeIndex ? styles.deadZoneSectionActive : ""}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.deadZoneStatus}>
          <div className={`${styles.deadZoneIndicator} ${beforeStatusClass}`}>
            {beforeMode === "idle" && "Hover over the rail"}
            {beforeMode === "dragging" && "Dragging \u2014 no intent detection"}
          </div>
        </div>
        <div className={styles.pairedProblem}>
          <XIcon />
          <span>Every tap triggers a drag — no click detection</span>
        </div>
      </div>

      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>After</Eyebrow>
        <div className={styles.deadZoneContent}>
          <div
            ref={afterRailRef}
            className={styles.deadZoneRail}
            onPointerDown={handleAfterDown}
            onPointerMove={handleAfterMove}
            onPointerUp={handleAfterUp}
          >
            <div className={styles.deadZoneTrack}>
              {sections.map((_, i) => (
                <div key={i} className={`${styles.deadZoneTick} ${i === afterIndex ? styles.deadZoneTickActive : ""}`} />
              ))}
            </div>
            <div className={styles.deadZoneThumb} style={{ top: `${afterY}%` }} />
          </div>
          <div className={styles.deadZoneSections}>
            {sections.map((s, i) => (
              <div key={s} className={`${styles.deadZoneSection} ${i === afterIndex ? styles.deadZoneSectionActive : ""}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.deadZoneStatus}>
          <div className={`${styles.deadZoneIndicator} ${afterStatusClass}`}>
            {afterMode === "idle" && "Tap or drag the rail"}
            {afterMode === "pending" && "Waiting for intent\u2026"}
            {afterMode === "dragging" && "Drag detected \u2014 instant scrub"}
            {afterMode === "clicked" && "Click detected \u2014 smooth scroll"}
          </div>
        </div>
        <div className={styles.pairedFix}>
          <CheckIcon />
          <span>{"< 3px = click, > 3px = drag \u2014 intent detected"}</span>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Pointer Mapping (Closest Element) ────────────────────────────────
// Shared pointerY — moving on either canvas updates both,
// showing how the same position yields different results.

function ClosestElementDiagram() {
  const [pointerY, setPointerY] = useState(50);
  const linearRef = useRef<HTMLDivElement>(null);
  const closestRef = useRef<HTMLDivElement>(null);

  const itemPositions = [8, 22, 38, 62, 78, 92];
  const itemLabels = ["Intro", "Tokens", "Colors", "Spacing", "Motion", "Radius"];

  const linearIndex = Math.min(
    Math.floor((pointerY / 100) * itemPositions.length),
    itemPositions.length - 1,
  );

  let closestIndex = 0;
  let minDist = Infinity;
  itemPositions.forEach((pos, i) => {
    const dist = Math.abs(pointerY - pos);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  });

  const handleLinearMove = useCallback((e: React.MouseEvent) => {
    const rect = linearRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointerY(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
  }, []);

  const handleClosestMove = useCallback((e: React.MouseEvent) => {
    const rect = closestRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointerY(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
  }, []);

  return (
    <div className={styles.beforeAfterGrid}>
      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>Before</Eyebrow>
        <div ref={linearRef} className={styles.closestElementArea} onMouseMove={handleLinearMove}>
          <div className={styles.closestPointerLine} style={{ top: `${pointerY}%` }} />
          {itemPositions.map((pos, i) => (
            <div
              key={i}
              className={`${styles.closestItem} ${i === linearIndex ? styles.closestItemActive : ""}`}
              style={{ top: `${pos}%` }}
            >
              <span className={styles.closestItemLabel}>{itemLabels[i]}</span>
              <span className={styles.closestItemDist}>
                {Math.abs(pointerY - pos).toFixed(0)}px
              </span>
            </div>
          ))}
        </div>
        <div className={styles.pairedProblem}>
          <XIcon />
          <span>Assumes even distribution — breaks with variable gaps</span>
        </div>
      </div>

      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>After</Eyebrow>
        <div ref={closestRef} className={styles.closestElementArea} onMouseMove={handleClosestMove}>
          <div className={styles.closestPointerLine} style={{ top: `${pointerY}%` }} />
          {itemPositions.map((pos, i) => (
            <div
              key={i}
              className={`${styles.closestItem} ${i === closestIndex ? styles.closestItemActive : ""}`}
              style={{ top: `${pos}%` }}
            >
              <span className={styles.closestItemLabel}>{itemLabels[i]}</span>
              <span className={styles.closestItemDist}>
                {Math.abs(pointerY - pos).toFixed(0)}px
              </span>
            </div>
          ))}
        </div>
        <div className={styles.pairedFix}>
          <CheckIcon />
          <span>Measures actual distance — always correct</span>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: FM Transform (static before/after) ──────────────────────────────

function TransformConflictDiagram() {
  return (
    <div className={styles.beforeAfterGrid}>
      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>Before</Eyebrow>
        <div className={styles.transformDemo}>
          <div className={styles.transformTick} />
          <div
            className={styles.transformLabel}
            style={{ top: "50%", transform: "translateX(0px)" }}
          >
            Section
          </div>
        </div>
        <div className={styles.transformCode}>
          top: 50%; transform: translateY(-50%)
        </div>
        <div className={styles.pairedProblem}>
          <XIcon />
          <span>{"FM overrides translateY(-50%) \u2014 6px shift \u2193"}</span>
        </div>
      </div>

      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>After</Eyebrow>
        <div className={styles.transformDemo}>
          <div className={styles.transformTick} />
          <div className={styles.transformLabelFlex}>Section</div>
        </div>
        <div className={styles.transformCode}>
          display: flex; align-items: center
        </div>
        <div className={styles.pairedFix}>
          <CheckIcon />
          <span>{"FM animates X only \u2014 vertical position stable"}</span>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Paired Channels ──────────────────────────────────────────────────
// Shared activeIndex — hovering on either side updates both,
// making the contrast between static labels and paired labels visible.

function PairedChannelsDiagram() {
  const [activeIndex, setActiveIndex] = useState(2);

  const sections = [
    { label: "Introduction", short: "Intro" },
    { label: "Token System", short: "Tokens" },
    { label: "Components", short: "Comp" },
    { label: "Process", short: "Proc" },
    { label: "Results", short: "Results" },
  ];

  return (
    <div className={styles.beforeAfterGrid}>
      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>Before</Eyebrow>
        <div className={styles.pairedRail}>
          {sections.map((s, i) => (
            <div key={i} className={styles.pairedRow} onMouseEnter={() => setActiveIndex(i)}>
              <div className={`${styles.pairedTick} ${i === activeIndex ? styles.pairedTickActive : styles.pairedTickMuted}`} />
              <span className={styles.pairedLabelStatic}>{s.short}</span>
            </div>
          ))}
        </div>
        <div className={styles.pairedProblem}>
          <XIcon />
          <span>{"Label color static \u2014 doesn\u2019t track tick state"}</span>
        </div>
      </div>

      <div className={styles.beforeAfterCard}>
        <Eyebrow as="div" className={styles.beforeAfterLabel}>After</Eyebrow>
        <div className={styles.pairedRail}>
          {sections.map((s, i) => (
            <div
              key={i}
              className={styles.pairedRow}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className={`${styles.pairedTick} ${i === activeIndex ? styles.pairedTickActive : styles.pairedTickMuted}`} />
              <span className={`${styles.pairedLabel} ${i === activeIndex ? styles.pairedLabelActive : styles.pairedLabelMuted}`}>
                {s.short}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.pairedFix}>
          <CheckIcon />
          <span>Tick + label share same state progression</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Showcase ───────────────────────────────────────────────────────────

export default function InteractionShowcase() {
  return (
    <Tabs defaultValue="deadZone" className={styles.visualContainer}>
      <TabsList className={styles.tabList}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {TAB_LABELS[tab]}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="deadZone" className={styles.visualBody}>
        <DeadZoneDiagram />
      </TabsContent>
      <TabsContent value="closestElement" className={styles.visualBody}>
        <ClosestElementDiagram />
      </TabsContent>
      <TabsContent value="transformConflict" className={styles.visualBody}>
        <TransformConflictDiagram />
      </TabsContent>
      <TabsContent value="pairedChannels" className={styles.visualBody}>
        <PairedChannelsDiagram />
      </TabsContent>
    </Tabs>
  );
}
