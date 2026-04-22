"use client";

import { useState, useMemo, useRef } from "react";
import { treemap, treemapSquarify, hierarchy } from "d3-hierarchy";
import styles from "./skill-map.module.scss";

// ── Skill card data (sourced from .cursor/skills/*/SKILL.md) ─────────────────

type SkillData = {
  name: string;
  trigger: string;
  description: string;
};

type Category = {
  label: string;
  skills: SkillData[];
};

const CATEGORIES: Category[] = [
  {
    label: "Iteration",
    skills: [
      { name: "design-iteration", trigger: "visual / spacing / layout feedback", description: "Processes design feedback through a 5-step loop: parse intent, check existing knowledge, diagnose root cause, implement fix, document." },
      { name: "engineering-iteration", trigger: "data / build / infra issues", description: "Processes engineering incidents through a 5-step loop: parse, check existing knowledge, reproduce, fix, document." },
      { name: "content-iteration", trigger: "copy / label / tone feedback", description: "Processes content feedback through a structured loop: parse, check existing knowledge, diagnose, implement, close the loop with documentation." },
    ],
  },
  {
    label: "Quality",
    skills: [
      { name: "cross-app-parity", trigger: "modifying src/ components", description: "Cross-app synchronization checklist for the monorepo's three apps. Covers component parity, token sync, component registry." },
      { name: "cms-parity", trigger: "adding / renaming CMS fields", description: "Ensures Payload schema, data fetch, frontend types, and inline edit fields stay in sync after field changes." },
      { name: "playground", trigger: "touching playground/ files", description: "Architecture rules for playground component pages. Covers import paths, composition rules, and validation checklists." },
      { name: "doc-audit", trigger: "\"docs health\"", description: "Periodic health check for the agent knowledge base. Runs static checks and semantic analysis for contradictions and redundancies." },
      { name: "stress-test", trigger: "\"content stress test\"", description: "Re-runs all review checks and anti-pattern tests against existing case studies using the current knowledge base." },
      { name: "password-gate", trigger: "modifying proxy / auth files", description: "Protects the visitor access boundary. Incorrect changes can expose the site publicly or lock out all visitors." },
    ],
  },
  {
    label: "Planning",
    skills: [
      { name: "orchestrator", trigger: "3+ distinct tasks detected", description: "Coordinates multi-task requests by decomposing, dispatching to helpers, collecting results, and synthesizing documentation." },
      { name: "plan-audit", trigger: "\"pressure test plan\"", description: "Adversarial audit comparing a proposed plan against the existing codebase. Finds misplacement, conflicts, edge cases, noise." },
      { name: "plan-structure", trigger: "\"meta audit plan\"", description: "Meta-audit evaluating a plan's organization, sequencing, context sufficiency, and proportionality from an executing agent's perspective." },
    ],
  },
  {
    label: "Creation",
    skills: [
      { name: "case-study-authoring", trigger: "\"write up\" / \"draft this\"", description: "Writes new case studies from raw materials or rebuilds existing ones. 4-phase workflow: Analyze, Plan, Write+Materialize, Review." },
    ],
  },
  {
    label: "Operations",
    skills: [
      { name: "checkpoint", trigger: "\"checkpoint\" / merge to main", description: "Handles version bumps, releases, and merges to main. Every checkpoint is a versioned release." },
      { name: "ship-it", trigger: "\"ship it\" / \"go live\"", description: "Full release pipeline: analyzes uncommitted changes, batches into dependency-ordered commits, pushes, hands off to checkpoint." },
      { name: "boot-up", trigger: "\"boot up\" / \"start servers\"", description: "Probes ports, starts missing dev servers, waits for HTTP 200, and updates the port registry." },
    ],
  },
];

// ── Treemap data (from Category Index tables) ────────────────────────────────

type TreemapDomain = {
  name: string;
  domain: "design" | "engineering" | "content";
  children: { name: string; count: number }[];
};

const TREEMAP_DATA: TreemapDomain[] = [
  {
    name: "Design (56)",
    domain: "design",
    children: [
      { name: "CSS Cascade & Build", count: 6 },
      { name: "Spacing & Layout", count: 10 },
      { name: "Positioning & Transforms", count: 3 },
      { name: "Theming & Dark Mode", count: 5 },
      { name: "Interaction & Pointer", count: 5 },
      { name: "Navigation & Menus", count: 6 },
      { name: "Visual Hierarchy", count: 16 },
      { name: "Form & Input UX", count: 4 },
      { name: "Admin UI Patterns", count: 2 },
    ],
  },
  {
    name: "Engineering (52)",
    domain: "engineering",
    children: [
      { name: "Cross-App Parity", count: 6 },
      { name: "Playground", count: 5 },
      { name: "CMS / Schema", count: 8 },
      { name: "CMS / Inline Edit", count: 3 },
      { name: "Save Flow / Errors", count: 4 },
      { name: "Hydration / SSR", count: 5 },
      { name: "Build / Toolchain", count: 9 },
      { name: "Documentation Process", count: 4 },
      { name: "Dev Workflow", count: 5 },
      { name: "Interaction / DOM", count: 3 },
      { name: "Deployment / CI", count: 2 },
    ],
  },
  {
    name: "Content (28)",
    domain: "content",
    children: [
      { name: "Narrative Structure", count: 5 },
      { name: "Voice & Tone", count: 5 },
      { name: "Positioning & Claims", count: 6 },
      { name: "Information Architecture", count: 5 },
      { name: "Specificity & Evidence", count: 4 },
      { name: "UX Microcopy", count: 3 },
    ],
  },
];

const DOMAIN_STYLES: Record<string, { block: string; dot: string }> = {
  design: { block: styles.domainDesign, dot: styles.legendDotDesign },
  engineering: { block: styles.domainEngineering, dot: styles.legendDotEngineering },
  content: { block: styles.domainContent, dot: styles.legendDotContent },
};

const DOMAIN_LABELS: Record<string, string> = {
  design: "Design",
  engineering: "Engineering",
  content: "Content",
};

// ── Operations view ──────────────────────────────────────────────────────────

function OperationsGrid() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className={styles.operationsGrid} role="list" aria-label="16 skills organized by function">
      {CATEGORIES.map((cat) => (
        <div key={cat.label} className={styles.categoryColumn} role="listitem">
          <div className={styles.categoryHeader}>
            {cat.label}
            <span className={styles.categoryCount}>{cat.skills.length} skills</span>
          </div>
          {cat.skills.map((skill) => {
            const isExpanded = expanded === skill.name;
            return (
              <button
                key={skill.name}
                className={`${styles.skillCard} ${isExpanded ? styles.skillCardExpanded : ""}`}
                onClick={() => setExpanded(isExpanded ? null : skill.name)}
                aria-expanded={isExpanded}
              >
                <span className={styles.skillName}>{skill.name}</span>
                <span className={styles.skillTrigger}>{skill.trigger}</span>
                {isExpanded && (
                  <span className={styles.skillDetail}>{skill.description}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Knowledge treemap ────────────────────────────────────────────────────────

type TooltipState = {
  x: number;
  y: number;
  domain: string;
  category: string;
  count: number;
} | null;

const FLAT_CATEGORIES = TREEMAP_DATA.flatMap((d) =>
  d.children.map((c) => ({
    name: c.name,
    domain: d.domain,
    value: c.count,
  }))
);

function KnowledgeTreemap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const layout = useMemo(() => {
    const root = hierarchy({
      name: "root",
      children: FLAT_CATEGORIES,
    }).sum((d: any) => d.value || 0);

    const tm = treemap<any>()
      .size([1, 1])
      .tile(treemapSquarify)
      .round(false)
      .padding(0);

    tm(root);
    return root.leaves();
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        className={styles.treemapContainer}
        onMouseLeave={() => {
          setTooltip(null);
          setHoveredKey(null);
        }}
        role="img"
        aria-label="Anti-pattern distribution across design, engineering, and content domains. Design: 56, Engineering: 52, Content: 28."
      >
        {layout.map((leaf: any, i: number) => {
          const domain = leaf.data.domain as string;
          const x0 = leaf.x0 * 100;
          const y0 = leaf.y0 * 100;
          const w = (leaf.x1 - leaf.x0) * 100;
          const h = (leaf.y1 - leaf.y0) * 100;
          const key = `${domain}-${leaf.data.name}-${i}`;
          const isHovered = hoveredKey === key;
          const isDimmed = hoveredKey !== null && !isHovered;

          return (
            <div
              key={key}
              className={`${styles.treemapBlock} ${DOMAIN_STYLES[domain]?.block ?? ""} ${isHovered ? styles.treemapBlockHovered : ""} ${isDimmed ? styles.treemapBlockDimmed : ""}`}
              style={{
                left: `${x0}%`,
                top: `${y0}%`,
                width: `${w}%`,
                height: `${h}%`,
              }}
              onMouseEnter={(e) => {
                setHoveredKey(key);
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  domain: DOMAIN_LABELS[domain] ?? domain,
                  category: leaf.data.name,
                  count: leaf.data.value,
                });
              }}
              onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip((prev) =>
                  prev
                    ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top }
                    : null
                );
              }}
              onMouseLeave={() => {
                setHoveredKey(null);
                setTooltip(null);
              }}
            >
              <span className={styles.treemapLabel}>
                {leaf.data.name}
              </span>
              {w > 5 && h > 5 && (
                <span className={styles.treemapCount}>
                  {leaf.data.value} anti-patterns
                </span>
              )}
            </div>
          );
        })}

        {tooltip && (
          <div
            className={styles.treemapTooltip}
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <span className={styles.treemapTooltipName}>{tooltip.category}</span>
            <span className={styles.treemapTooltipMeta}>
              {tooltip.domain} / {tooltip.count} anti-patterns
            </span>
          </div>
        )}
      </div>

      <div className={styles.legend}>
        {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
          <span key={key} className={styles.legendItem}>
            <span className={`${styles.legendDot} ${DOMAIN_STYLES[key]?.dot ?? ""}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Composed component ───────────────────────────────────────────────────────

export default function SkillMap() {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h3 className={styles.sectionHeader}>Operations (16 skills)</h3>
        <OperationsGrid />
      </section>
      <section className={styles.section}>
        <h3 className={styles.sectionHeader}>Knowledge (136 anti-patterns)</h3>
        <KnowledgeTreemap />
      </section>
    </div>
  );
}
