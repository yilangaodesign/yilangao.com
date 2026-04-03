"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./elan-visuals.module.scss";

/* ── Palette data ───────────────────────────────────────────────────────── */

const ACCENT_SCALE = [
  { step: 10, hex: "#EFF3FF", scaling: "ramp" as const },
  { step: 20, hex: "#C5D4FF", scaling: "ramp" as const },
  { step: 30, hex: "#9BB4FF", scaling: "ramp" as const },
  { step: 40, hex: "#7392FF", scaling: "ramp" as const },
  { step: 50, hex: "#4E6CFF", scaling: "ramp" as const },
  { step: 60, hex: "#3336FF", scaling: "key" as const },
  { step: 70, hex: "#261BD5", scaling: "ramp" as const },
  { step: 80, hex: "#1A169C", scaling: "ramp" as const },
  { step: 90, hex: "#0F1560", scaling: "ramp" as const },
  { step: 100, hex: "#070D29", scaling: "ramp" as const },
];

const NEUTRAL_SCALE: { step: number | string; hex: string }[] = [
  { step: "00", hex: "#FFFFFF" },
  { step: "05", hex: "#F9F9F9" },
  { step: 10, hex: "#F4F4F4" },
  { step: 20, hex: "#E0E0E0" },
  { step: 30, hex: "#C6C6C6" },
  { step: 40, hex: "#A8A8A8" },
  { step: 50, hex: "#8D8D8D" },
  { step: 60, hex: "#6F6F6F" },
  { step: 70, hex: "#525252" },
  { step: 80, hex: "#393939" },
  { step: 90, hex: "#262626" },
  { step: 100, hex: "#161616" },
];

const EXTENDED_FAMILIES = [
  {
    name: "Red", prefix: "red",
    steps: [
      { step: 10, hex: "#FFF1F1" }, { step: 20, hex: "#FFD7D9" }, { step: 30, hex: "#FFB3B8" },
      { step: 40, hex: "#FF8389" }, { step: 50, hex: "#FA4D56" }, { step: 60, hex: "#DA1E28" },
      { step: 70, hex: "#A2191F" }, { step: 80, hex: "#750E13" }, { step: 90, hex: "#520408" }, { step: 100, hex: "#2D0709" },
    ],
  },
  {
    name: "Green", prefix: "green",
    steps: [
      { step: 10, hex: "#DEFBE6" }, { step: 20, hex: "#A7F0BA" }, { step: 30, hex: "#6FDC8C" },
      { step: 40, hex: "#42BE65" }, { step: 50, hex: "#24A148" }, { step: 60, hex: "#198038" },
      { step: 70, hex: "#0E6027" }, { step: 80, hex: "#044317" }, { step: 90, hex: "#022D0D" }, { step: 100, hex: "#071908" },
    ],
  },
  {
    name: "Yellow", prefix: "yellow",
    steps: [
      { step: 10, hex: "#FCF4D6" }, { step: 20, hex: "#FDDC69" }, { step: 30, hex: "#F1C21B" },
      { step: 40, hex: "#D2A106" }, { step: 50, hex: "#B28600" }, { step: 60, hex: "#8E6A00" },
      { step: 70, hex: "#684E00" }, { step: 80, hex: "#483700" }, { step: 90, hex: "#302400" }, { step: 100, hex: "#1C1500" },
    ],
  },
  {
    name: "Teal", prefix: "teal",
    steps: [
      { step: 10, hex: "#D9FBFB" }, { step: 20, hex: "#9EF0F0" }, { step: 30, hex: "#3DDBD9" },
      { step: 40, hex: "#08BDBA" }, { step: 50, hex: "#009D9A" }, { step: 60, hex: "#007D79" },
      { step: 70, hex: "#005D5D" }, { step: 80, hex: "#004144" }, { step: 90, hex: "#022B30" }, { step: 100, hex: "#081A1C" },
    ],
  },
];

/* ── Semantic mapping ───────────────────────────────────────────────────── */

const ROLE_MAP: Record<string, string> = {
  accent: "brand",
  neutral: "neutral",
  red: "negative",
  green: "positive",
  yellow: "warning",
  teal: "informational",
};

const VALID_COMBINATIONS: Record<string, Record<string, string[]>> = {
  brand: {
    surface: ["bold", "subtle"],
    text: ["bold"],
    icon: ["bold"],
    border: ["bold"],
    action: ["bold", "subtle"],
  },
  neutral: {
    surface: ["regular", "subtle", "minimal"],
    text: ["bold", "regular", "subtle", "minimal"],
    icon: ["bold", "regular", "subtle", "minimal"],
    border: ["bold", "subtle"],
    action: ["bold", "regular"],
  },
  negative: {
    surface: ["bold", "subtle"],
    text: ["bold"],
    icon: ["bold"],
    border: ["bold"],
    action: ["bold"],
  },
  positive: {
    surface: ["bold", "subtle"],
    text: ["bold"],
    icon: ["bold"],
    border: ["bold"],
    action: ["bold"],
  },
  warning: {
    surface: ["bold", "subtle"],
    text: ["bold"],
    icon: ["bold"],
    border: ["bold"],
    action: ["bold"],
  },
  informational: {
    surface: ["bold", "subtle"],
    text: ["bold"],
    icon: ["bold"],
    border: ["bold"],
    action: ["bold"],
  },
};

const ALL_FAMILIES: { key: string; name: string; steps: { step: number | string; hex: string }[] }[] = [
  { key: "accent", name: "Accent (Lumen)", steps: ACCENT_SCALE.map((s) => ({ step: s.step, hex: s.hex })) },
  { key: "neutral", name: "Neutral", steps: NEUTRAL_SCALE },
  ...EXTENDED_FAMILIES.map((f) => ({ key: f.prefix, name: f.name, steps: f.steps })),
];

/* ── Dimension options ──────────────────────────────────────────────────── */

const DIMENSIONS = {
  properties: [
    { name: "surface", desc: "Background fills" },
    { name: "text", desc: "Text elements" },
    { name: "icon", desc: "Icon elements" },
    { name: "border", desc: "Borders & dividers" },
    { name: "action", desc: "Buttons & controls" },
  ],
  emphases: [
    { name: "bold", desc: "Strongest" },
    { name: "regular", desc: "Standard" },
    { name: "subtle", desc: "Recessive" },
    { name: "minimal", desc: "Lightest" },
  ],
};

const RATIONALE = {
  comparisons: [
    {
      system: "IBM Carbon",
      approach: "Flat referential: $carbon--blue-60",
      limitation: "Encodes hue + grade but not purpose — an agent must map blue-60 → brand vs. informational from external context",
    },
    {
      system: "Material Design",
      approach: "Role-based: --md-sys-color-primary",
      limitation: "Semantic but shallow — 'primary' doesn't distinguish surface vs. text vs. icon usage",
    },
    {
      system: "Goldman Sachs (One GS)",
      approach: "Property-first: property · role · emphasis",
      limitation: "Deep semantic structure — each dimension independently queryable",
    },
  ],
  decision: "Adopted the Goldman Sachs property · role · emphasis hierarchy because each token name fully describes its intent. An AI agent can parse color.surface.brand.bold without a lookup table — the name IS the documentation.",
};

/* ── Tabs ───────────────────────────────────────────────────────────────── */

type Tab = "builder" | "lumen";

const TAB_LABELS: Record<Tab, string> = {
  builder: "Token Builder",
  lumen: "Lumen Accent",
};

function composedReads(prop: string, role: string, emphasis: string): string {
  return `${emphasis.charAt(0).toUpperCase() + emphasis.slice(1)} ${role} ${prop}`;
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function TokenGrid() {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | string | null>(null);
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const [selProp, setSelProp] = useState<string | null>(null);
  const [selEmphasis, setSelEmphasis] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const derivedRole = selectedFamily ? ROLE_MAP[selectedFamily] ?? null : null;
  const validProps = derivedRole ? VALID_COMBINATIONS[derivedRole] : null;
  const validEmphases =
    derivedRole && selProp && validProps?.[selProp] ? validProps[selProp] : null;

  const hasSelection = selectedFamily || selProp || selEmphasis;
  const isComplete = derivedRole && selProp && selEmphasis;

  const formulaProp = selProp ?? "property";
  const formulaRole = derivedRole ?? "role";
  const formulaEmphasis = selEmphasis ?? "emphasis";

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropdownOpen]);

  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 6, left: rect.left });
    }
    setDropdownOpen((o) => !o);
  }, []);

  const handleSelectSwatch = (familyKey: string, step: number | string, hex: string) => {
    const prevRole = selectedFamily ? ROLE_MAP[selectedFamily] : null;
    const newRole = ROLE_MAP[familyKey];
    setSelectedFamily(familyKey);
    setSelectedStep(step);
    setSelectedHex(hex);
    setDropdownOpen(false);
    if (prevRole !== newRole) {
      setSelProp(null);
      setSelEmphasis(null);
    }
  };

  const toggleProp = (value: string) => {
    const next = selProp === value ? null : value;
    setSelProp(next);
    if (next && derivedRole) {
      const valid = VALID_COMBINATIONS[derivedRole]?.[next];
      if (selEmphasis && valid && !valid.includes(selEmphasis)) {
        setSelEmphasis(null);
      }
    }
  };

  const toggleEmphasis = (value: string) => {
    setSelEmphasis((v) => (v === value ? null : value));
  };

  const dropdownPanel = dropdownOpen
    ? createPortal(
        <div
          ref={panelRef}
          className={styles.colorDropdownPanel}
          role="listbox"
          style={{ top: panelPos.top, left: panelPos.left }}
        >
          {ALL_FAMILIES.map((family) => (
            <div key={family.key} className={styles.colorDropdownGroup}>
              <span className={styles.colorDropdownGroupName}>
                {family.name}
                <span className={styles.colorDropdownGroupRole}>
                  &rarr; {ROLE_MAP[family.key]}
                </span>
              </span>
              <div className={styles.colorDropdownRow}>
                {family.steps.map((s) => (
                  <button
                    key={s.step}
                    role="option"
                    aria-selected={selectedFamily === family.key && selectedStep === s.step}
                    className={`${styles.colorDropdownSwatch} ${
                      selectedFamily === family.key && selectedStep === s.step
                        ? styles.colorDropdownSwatchSelected
                        : ""
                    }`}
                    style={{ backgroundColor: s.hex }}
                    onClick={() => handleSelectSwatch(family.key, s.step, s.hex)}
                    title={`${family.name} ${s.step} — ${s.hex}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <Tabs defaultValue="builder" className={styles.visualContainer}>
      <TabsList className={styles.tabList}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {TAB_LABELS[tab]}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="builder" className={styles.visualBody}>
        {(
          <div className={styles.namingColumn}>
            {/* ── Interactive Token Builder ── */}
            <div className={styles.namingSection}>
              <Eyebrow size="sm" className={styles.namingSectionTitle}>Naming Formula</Eyebrow>
              <p className={styles.namingSectionDesc}>
                Pick a color swatch to begin — the role auto-fills and available dimensions filter to valid combinations.
              </p>

              <div className={styles.namingFormula}>
                <span className={styles.namingFormulaGroup}>
                  <button
                    ref={triggerRef}
                    className={styles.colorDropdownTrigger}
                    onClick={openDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="listbox"
                  >
                    {selectedHex && (
                      <span
                        className={styles.colorDropdownSwatchPreview}
                        style={{ backgroundColor: selectedHex }}
                      />
                    )}
                    <span>
                      {selectedFamily ? `${selectedFamily}-${selectedStep}` : "color \u25BE"}
                    </span>
                  </button>
                  {dropdownPanel}
                </span>

                <span className={styles.namingFormulaGroup}>
                  <span className={styles.namingDot}>.</span>
                  <span className={selProp ? styles.namingPartSelected : styles.namingPartPlaceholder}>
                    {formulaProp}
                  </span>
                </span>

                <span className={styles.namingFormulaGroup}>
                  <span className={styles.namingDot}>.</span>
                  <span className={derivedRole ? styles.namingRoleLabel : styles.namingPartPlaceholder}>
                    {formulaRole}
                  </span>
                </span>

                <span className={styles.namingFormulaGroup}>
                  <span className={styles.namingDot}>.</span>
                  <span className={selEmphasis ? styles.namingPartSelected : styles.namingPartPlaceholder}>
                    {formulaEmphasis}
                  </span>
                </span>
              </div>

              {isComplete && (
                <div className={styles.namingComposed}>
                  {selectedHex && (
                    <span
                      className={styles.namingComposedSwatch}
                      style={{ backgroundColor: selectedHex }}
                    />
                  )}
                  <span className={styles.namingComposedToken}>
                    color.{selProp}.{derivedRole}.{selEmphasis}
                  </span>
                  <span className={styles.namingComposedReads}>
                    &ldquo;{composedReads(selProp, derivedRole, selEmphasis)}&rdquo;
                  </span>
                </div>
              )}
              {hasSelection && !isComplete && (
                <div className={styles.namingComposedHint}>
                  {!selectedFamily
                    ? "Pick a color swatch to auto-fill the role"
                    : !selProp
                      ? "Now choose a property"
                      : "Pick an emphasis level to complete the token"}
                </div>
              )}

              <div className={styles.namingDimensions}>
                <div className={styles.namingDimension}>
                  <Eyebrow size="sm" className={styles.namingDimensionTitle}>Property</Eyebrow>
                  <p className={styles.namingDimensionDesc}>What element type the color applies to</p>
                  <div className={styles.namingPills}>
                    {DIMENSIONS.properties.map((p) => {
                      const disabled = validProps != null && !(p.name in validProps);
                      return (
                        <button
                          key={p.name}
                          className={`${styles.namingPill} ${selProp === p.name ? styles.namingPillActive : ""} ${disabled ? styles.namingPillDisabled : ""}`}
                          onClick={() => !disabled && toggleProp(p.name)}
                          disabled={disabled}
                          title={disabled ? `No ${p.name} tokens for ${derivedRole}` : p.desc}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.namingDimension}>
                  <Eyebrow size="sm" className={styles.namingDimensionTitle}>Emphasis</Eyebrow>
                  <p className={styles.namingDimensionDesc}>Prominence level within its group</p>
                  <div className={styles.namingPills}>
                    {DIMENSIONS.emphases.map((e) => {
                      const disabled = validEmphases != null && !validEmphases.includes(e.name);
                      return (
                        <button
                          key={e.name}
                          className={`${styles.namingPill} ${selEmphasis === e.name ? styles.namingPillActive : ""} ${disabled ? styles.namingPillDisabled : ""}`}
                          onClick={() => !disabled && toggleEmphasis(e.name)}
                          disabled={disabled}
                          title={disabled ? `No ${e.name} emphasis for ${derivedRole}/${selProp}` : e.desc}
                        >
                          {e.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Rationale ── */}
            <div className={styles.namingSection}>
              <Eyebrow size="sm" className={styles.namingSectionTitle}>Why Semantic Naming</Eyebrow>
              <div className={styles.rationaleComparisons}>
                {RATIONALE.comparisons.map((c) => (
                  <div key={c.system} className={styles.rationaleComparison}>
                    <span className={styles.rationaleSystem}>{c.system}</span>
                    <span className={styles.rationaleApproach}>{c.approach}</span>
                    <span className={styles.rationaleLimitation}>{c.limitation}</span>
                  </div>
                ))}
              </div>
              <p className={styles.rationaleDecision}>{RATIONALE.decision}</p>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="lumen" className={styles.visualBody}>
        <div className={styles.namingRationale}>
          <p className={styles.rationaleText}>
            Lumen is a custom blue-violet (<span className={styles.rationaleCode}>#3336FF</span>) in the same territory as
            ultramarine — the pigment Renaissance painters ground from lapis lazuli. Precise enough for an engineering
            interface, rooted in something older.
          </p>
          <p className={styles.rationaleText}>
            The scale is built in OKLCH — a perceptual color space where equal numeric deltas produce equal
            visual difference. Grade 60 is the anchor; all other steps are derived via an even lightness ramp
            and a sine chroma arc at constant hue 270°.
          </p>
        </div>
        <div className={styles.colorRow}>
          {ACCENT_SCALE.map((c) => (
            <div key={c.step} className={`${styles.colorCell} ${c.scaling === "key" ? styles.colorCellKey : ""}`}>
              <div className={styles.colorSwatch} style={{ backgroundColor: c.hex }} />
              <span className={styles.colorLabel}>{c.step}</span>
              <span className={styles.colorHex}>{c.hex}</span>
            </div>
          ))}
        </div>
        <div className={styles.scalingLegend}>
          <div className={styles.scalingLegendItem}>
            <span className={styles.scalingDot} style={{ background: "rgba(51, 54, 255, 0.15)" }} />
            <span className={styles.scalingLegendText}>10–50: OKLCH lightness ramp toward anchor</span>
          </div>
          <div className={styles.scalingLegendItem}>
            <span className={`${styles.scalingDot} ${styles.scalingDotKey}`} />
            <span className={styles.scalingLegendText}>60: brand anchor #3336FF</span>
          </div>
          <div className={styles.scalingLegendItem}>
            <span className={styles.scalingDot} style={{ background: "rgba(38, 27, 213, 0.3)" }} />
            <span className={styles.scalingLegendText}>70–100: OKLCH lightness ramp from anchor</span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
