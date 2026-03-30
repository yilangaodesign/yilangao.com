"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./elan-visuals.module.scss";

type Tab = "architecture" | "escalation" | "timeline";

const TAB_LABELS: Record<Tab, string> = {
  architecture: "Harness Architecture",
  escalation: "3-Strike Escalation",
  timeline: "Incident Timeline",
};

const CANVAS_W = 880;
const CANVAS_H = 620;

type DagNode = {
  id: string;
  label: string;
  desc: string;
  tier: "input" | "process" | "skill" | "step" | "doc" | "escalation";
};

const TIERS: DagNode[][] = [
  [{ id: "feedback", label: "Human Feedback", desc: "Task, bug report, or design critique enters the system", tier: "input" }],
  [
    { id: "audience-model", label: "Audience Model", desc: "AI pre-evaluates every action against accumulated user simulation — content strategy, design principles, anti-patterns — before generating output", tier: "process" },
    { id: "generator", label: "Generator", desc: "Builds features, writes code, implements designs — constrained by pre-evaluation and accumulated guardrails", tier: "process" },
    { id: "evaluator", label: "Evaluator (Human)", desc: "Critiques output against intent — the adversarial check that models cannot reliably self-provide", tier: "step" },
  ],
  [{ id: "classify", label: "Multi-Category Routing", desc: "Every piece of feedback classified into Design, Engineering, Content — or all three simultaneously", tier: "process" }],
  [
    { id: "design-skill", label: "Design Iteration", desc: "5-step loop: parse → check existing knowledge → diagnose → fix → document across all 3 layers", tier: "skill" },
    { id: "eng-skill", label: "Engineering Iteration", desc: "5-step loop: parse → check existing knowledge → reproduce → fix → document across all 3 layers", tier: "skill" },
    { id: "content-skill", label: "Content Iteration", desc: "Full doc read → implement changes → close the loop across all 3 layers", tier: "skill" },
  ],
  [
    { id: "logs", label: "Feedback Logs", desc: "Chronological incident history — what happened and why (3 domain-specific logs)", tier: "doc" },
    { id: "antipatterns", label: "Anti-Pattern Catalogs", desc: "Patterns to never repeat — indexed by ID, cross-referenced across domains (3 catalogs)", tier: "doc" },
    { id: "principles", label: "Accumulated Principles", desc: "Living knowledge base — design.md, engineering.md, content.md — grows after every session", tier: "doc" },
  ],
  [{ id: "guardrail", label: "Adaptive Guardrails", desc: "3× same failure category → promoted from documentation to hard constraint in AGENTS.md. The harness tightens with each incident.", tier: "escalation" }],
];

const EDGES: [string, string][] = [
  ["feedback", "audience-model"],
  ["audience-model", "generator"],
  ["generator", "evaluator"],
  ["evaluator", "classify"],
  ["classify", "design-skill"], ["classify", "eng-skill"], ["classify", "content-skill"],
  ["design-skill", "logs"], ["eng-skill", "antipatterns"], ["content-skill", "principles"],
  ["logs", "guardrail"], ["antipatterns", "guardrail"], ["principles", "guardrail"],
];

const LOOP_EDGES: [string, string][] = [
  ["guardrail", "generator"],
  ["principles", "audience-model"],
];

const TIER_Y = [32, 108, 196, 290, 404, 514];
const NODE_H = 44;

function getNodeRect(nodeId: string): { cx: number; cy: number } {
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const idx = tier.findIndex((n) => n.id === nodeId);
    if (idx === -1) continue;
    const totalW = tier.length * 200 + (tier.length - 1) * 32;
    const startX = (CANVAS_W - totalW) / 2;
    const cx = startX + idx * (200 + 32) + 100;
    const cy = TIER_Y[ti] + NODE_H / 2;
    return { cx, cy };
  }
  return { cx: 0, cy: 0 };
}

function getNodeTier(nodeId: string): number {
  return TIERS.findIndex((t) => t.some((n) => n.id === nodeId));
}

function ArchitectureDag() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.dagNodeBox}`)) return;
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 40;
    if (e.key === "ArrowLeft") setPan((p) => ({ ...p, x: p.x + step }));
    else if (e.key === "ArrowRight") setPan((p) => ({ ...p, x: p.x - step }));
    else if (e.key === "ArrowUp") setPan((p) => ({ ...p, y: p.y + step }));
    else if (e.key === "ArrowDown") setPan((p) => ({ ...p, y: p.y - step }));
    else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.15, 2));
    else if (e.key === "-") setZoom((z) => Math.max(z - 0.15, 0.5));
    else return;
    e.preventDefault();
  }, []);

  // No wheel handler — scroll pass-through to page. Pan via drag only.
  // Zoom via +/- buttons and keyboard only.

  const tierStyles: Record<string, string> = {
    input: styles.dagTierInput,
    process: styles.dagTierProcess,
    skill: styles.dagTierSkill,
    step: styles.dagTierStep,
    doc: styles.dagTierDoc,
    escalation: styles.dagTierEscalation,
  };

  const allNodes = TIERS.flat();
  const selectedDesc = selectedNode ? allNodes.find((n) => n.id === selectedNode)?.desc : null;

  return (
    <div className={styles.dagWrapper}>
      <div className={styles.dagControls}>
        <button
          className={styles.dagZoomBtn}
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
          aria-label="Zoom in"
        >+</button>
        <button
          className={styles.dagZoomBtn}
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          aria-label="Zoom out"
        >&minus;</button>
        <button
          className={styles.dagZoomBtn}
          onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
          aria-label="Reset view"
        >&#8634;</button>
      </div>

      <div
        ref={viewportRef}
        className={styles.dagViewport}
        role="figure"
        aria-label="Agent harness architecture diagram. Use arrow keys to pan, +/- to zoom. Click nodes for details."
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div
          className={styles.dagCanvas}
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <svg
            className={styles.dagEdges}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            width={CANVAS_W}
            height={CANVAS_H}
          >
            <defs>
              <marker id="dagArrow" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="8" markerHeight="6" orient="auto">
                <path d="M0,0.5 L7,3 L0,5.5" fill="none" stroke="var(--dag-edge, rgba(51,54,255,0.18))" strokeWidth="1" />
              </marker>
              <marker id="dagLoopArrow" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="8" markerHeight="6" orient="auto">
                <path d="M0,0.5 L7,3 L0,5.5" fill="none" stroke="rgba(51,54,255,0.4)" strokeWidth="1" />
              </marker>
            </defs>
            {EDGES.map(([fromId, toId]) => {
              const from = getNodeRect(fromId);
              const to = getNodeRect(toId);
              const sameTier = getNodeTier(fromId) === getNodeTier(toId);
              if (sameTier) {
                const left = Math.min(from.cx, to.cx);
                const right = Math.max(from.cx, to.cx);
                return (
                  <line
                    key={`${fromId}-${toId}`}
                    x1={left + 102} y1={from.cy}
                    x2={right - 102} y2={to.cy}
                    stroke="var(--dag-edge, rgba(51,54,255,0.18))"
                    strokeWidth="1.5"
                    markerEnd="url(#dagArrow)"
                  />
                );
              }
              return (
                <line
                  key={`${fromId}-${toId}`}
                  x1={from.cx} y1={from.cy + NODE_H / 2 + 2}
                  x2={to.cx} y2={to.cy - NODE_H / 2 - 2}
                  stroke="var(--dag-edge, rgba(51,54,255,0.18))"
                  strokeWidth="1.5"
                />
              );
            })}
            {LOOP_EDGES.map(([fromId, toId]) => {
              const from = getNodeRect(fromId);
              const to = getNodeRect(toId);
              const useRight = from.cx > CANVAS_W / 2;
              const startX = useRight ? from.cx + 100 : from.cx - 100;
              const endX = useRight ? to.cx + 100 : to.cx - 100;
              const startY = from.cy;
              const endY = to.cy;
              const mx = useRight ? CANVAS_W - 26 : 36;
              const midY = (startY + endY) / 2;
              const textX = useRight ? mx + 10 : mx - 10;
              const label = useRight ? "knowledge informs" : "harness constrains";
              return (
                <g key={`loop-${fromId}-${toId}`}>
                  <path
                    d={`M ${startX},${startY} C ${mx},${startY} ${mx},${endY} ${endX},${endY}`}
                    fill="none"
                    stroke="rgba(51,54,255,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    markerEnd="url(#dagLoopArrow)"
                  />
                  <text
                    x={textX}
                    y={midY}
                    fill="rgba(51,54,255,0.3)"
                    fontSize="9"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(-90, ${textX}, ${midY})`}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>

          {TIERS.map((tier, ti) => {
            const totalW = tier.length * 200 + (tier.length - 1) * 32;
            const startX = (CANVAS_W - totalW) / 2;
            return tier.map((node, ni) => {
              const x = startX + ni * (200 + 32);
              const y = TIER_Y[ti];
              return (
                <button
                  key={node.id}
                  className={`${styles.dagNodeBox} ${tierStyles[node.tier]} ${selectedNode === node.id ? styles.dagNodeSelected : ""}`}
                  style={{ left: x, top: y, width: 200, height: NODE_H }}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  aria-pressed={selectedNode === node.id}
                  aria-label={`${node.label}: ${node.desc}`}
                >
                  {node.label}
                </button>
              );
            });
          })}
        </div>

        {!selectedDesc && (
          <div className={styles.dagHint}>
            Drag to pan &middot; Scroll to navigate &middot; Click a node for details
          </div>
        )}
      </div>

      {selectedDesc && (
        <div className={styles.dagDetail} role="status" aria-live="polite">
          {selectedDesc}
        </div>
      )}
    </div>
  );
}

function EscalationExample() {
  const [step, setStep] = useState(0);

  const strikes = [
    {
      id: "ENG-002",
      title: "Geist fonts missing from playground",
      response: "Documented cross-app parity checklist",
      level: "Documentation",
    },
    {
      id: "ENG-003",
      title: "Fonts still missing — inline overrides in 5 files",
      response: "Codebase-wide audit, removed all overrides",
      level: "Audit",
    },
    {
      id: "ENG-004",
      title: "ScrollSpy created without playground preview",
      response: "Promoted to hard guardrail in AGENTS.md",
      level: "Guardrail",
    },
  ];

  return (
    <div className={styles.escalationExample}>
      <div className={styles.escalationStrikes}>
        {strikes.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.escalationStrike} ${i <= step ? styles.escalationStrikeActive : ""} ${i === step ? styles.escalationStrikeCurrent : ""}`}
            onClick={() => setStep(i)}
            aria-pressed={i === step}
            aria-label={`Strike ${i + 1}: ${s.title}. Response: ${s.response}`}
          >
            <div className={styles.escalationStrikeHeader}>
              <span className={styles.escalationStrikeNum}>Strike {i + 1}</span>
              <span className={styles.timelineId}>{s.id}</span>
            </div>
            <span className={styles.timelineTitle}>{s.title}</span>
            {i <= step && (
              <div className={styles.escalationResponse}>
                <span className={styles.escalationResponseLabel}>{s.level}</span>
                <span className={styles.timelineFix}>{s.response}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.escalationMeter}>
        <div className={styles.escalationMeterTrack}>
          <div
            className={styles.escalationMeterFill}
            style={{ height: `${((step + 1) / 3) * 100}%` }}
          />
        </div>
        <div className={styles.escalationMeterLabels}>
          <span className={step >= 0 ? styles.escalationMeterLabelActive : ""}>Doc</span>
          <span className={step >= 1 ? styles.escalationMeterLabelActive : ""}>Audit</span>
          <span className={step >= 2 ? styles.escalationMeterLabelActive : ""}>Guardrail</span>
        </div>
      </div>
    </div>
  );
}

const INCIDENTS = [
  { id: "ENG-001", title: "Playground token drift", cause: "Manual data duplication without sync", fix: "Created codegen pipeline (sync-tokens.mjs)", escalated: false },
  { id: "ENG-002", title: "Geist fonts missing from playground", cause: "Infrastructure added to one app only", fix: "Documented cross-app parity checklist", escalated: false },
  { id: "ENG-003", title: "Geist fonts still missing (3rd report)", cause: "Inline fontFamily overrides in 5 files", fix: "Codebase-wide audit, removed all overrides", escalated: true },
  { id: "ENG-004", title: "ScrollSpy missing from playground", cause: "Component created without preview page", fix: "Promoted to hard guardrail in AGENTS.md", escalated: true },
  { id: "ENG-012", title: "3 fixes without documentation", cause: "Agent prioritizes fix over process", fix: "Documentation became blocking gate (Guardrail #1)", escalated: true },
  { id: "ENG-030", title: "Panel 'Done' didn't save", cause: "Stale React closure + two-step save flow", fix: "flushSync + dirtyRef pattern, 'Save & Close'", escalated: false },
  { id: "ENG-036", title: "Drag re-grab broken after reorder", cause: "index-as-key on draggable list", fix: "Stable key array synced with mutations", escalated: false },
];

function IncidentTimeline() {
  return (
    <div className={styles.timeline}>
      {INCIDENTS.map((inc, i) => (
        <div key={inc.id} className={`${styles.timelineItem} ${inc.escalated ? styles.timelineEscalated : ""}`}>
          <div className={styles.timelineRail}>
            <div className={`${styles.timelineDot} ${inc.escalated ? styles.timelineDotEscalated : ""}`} />
            {i < INCIDENTS.length - 1 && <div className={styles.timelineLine} />}
          </div>
          <div className={styles.timelineContent}>
            <div className={styles.timelineHeader}>
              <span className={styles.timelineId}>{inc.id}</span>
              {inc.escalated && <span className={styles.escalationBadge}>3-strike escalation</span>}
            </div>
            <span className={styles.timelineTitle}>{inc.title}</span>
            <span className={styles.timelineCause}>{inc.cause}</span>
            <span className={styles.timelineFix}>{inc.fix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EscalationTimeline() {
  const [activeTab, setActiveTab] = useState<Tab>("architecture");
  const tabs = Object.keys(TAB_LABELS) as Tab[];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = tabs.indexOf(activeTab);
      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault();
      setActiveTab(tabs[next]);
      tabRefs.current[next]?.focus();
    },
    [activeTab, tabs],
  );

  return (
    <div className={styles.visualContainer}>
      <div className={styles.tabBar} role="tablist" aria-label="Agent harness architecture views" onKeyDown={handleTabKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            id={`escalation-tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`escalation-panel-${tab}`}
            tabIndex={activeTab === tab ? 0 : -1}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "architecture" && (
        <div className={styles.visualBody} role="tabpanel" id="escalation-panel-architecture" aria-labelledby="escalation-tab-architecture">
          <ArchitectureDag />
        </div>
      )}
      {activeTab === "escalation" && (
        <div className={styles.visualBody} role="tabpanel" id="escalation-panel-escalation" aria-labelledby="escalation-tab-escalation">
          <EscalationExample />
        </div>
      )}
      {activeTab === "timeline" && (
        <div role="tabpanel" id="escalation-panel-timeline" aria-labelledby="escalation-tab-timeline">
          <IncidentTimeline />
        </div>
      )}
    </div>
  );
}
