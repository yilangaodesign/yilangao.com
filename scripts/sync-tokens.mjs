#!/usr/bin/env node

/**
 * sync-tokens.mjs
 *
 * Reads src/styles/tokens/_colors.scss (the canonical source of truth) and
 * regenerates the color portion of playground/src/lib/tokens.ts.
 *
 * Non-color exports (typography, spacing, motion, elevation, breakpoints) are
 * preserved — the script only replaces content between codegen boundary markers.
 *
 * Token architecture follows: $portfolio-{property}-{role}[-{emphasis}]
 * See docs/design.md §9 for the full rationale.
 *
 * Usage:
 *   node scripts/sync-tokens.mjs
 *   npm run sync-tokens
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SCSS_PATH = resolve(ROOT, "src/styles/tokens/_colors.scss");
const CUSTOM_PROPS_PATH = resolve(ROOT, "src/styles/_custom-properties.scss");
const TOKENS_PATH = resolve(ROOT, "playground/src/lib/tokens.ts");

const BEGIN_MARKER = "// @sync-tokens:begin";
const END_MARKER = "// @sync-tokens:end";

// ---------------------------------------------------------------------------
// 1. Parse SCSS — Palette
// ---------------------------------------------------------------------------

const scss = readFileSync(SCSS_PATH, "utf-8");

function parsePaletteVars(src) {
  const vars = new Map();
  for (const line of src.split("\n")) {
    const m = line.match(
      /^\$portfolio-([\w-]+?)-([\d]+):\s*(#[0-9A-Fa-f]{3,8});/
    );
    if (m) {
      const [, family, step, hex] = m;
      if (!vars.has(family)) vars.set(family, []);
      vars.get(family).push({ step, value: hex.toUpperCase() });
    }
  }
  return vars;
}

const palette = parsePaletteVars(scss);

function buildLookup(paletteMap) {
  const lookup = new Map();
  for (const [family, steps] of paletteMap) {
    for (const { step, value } of steps) {
      lookup.set(`$portfolio-${family}-${step}`, value);
    }
  }
  return lookup;
}

const lookup = buildLookup(palette);

function resolveValue(raw) {
  if (raw.startsWith("$")) return lookup.get(raw) || raw;
  return raw;
}

// ---------------------------------------------------------------------------
// 1b. Parse dark mode overrides from _custom-properties.scss
// ---------------------------------------------------------------------------

function parseDarkOverrides(filePath, lookupMap) {
  const src = readFileSync(filePath, "utf-8");
  const darkMap = new Map();
  const darkMarker = '[data-theme="dark"]';
  const darkStart = src.indexOf(darkMarker);
  if (darkStart === -1) return darkMap;
  const darkSection = src.slice(darkStart);

  for (const line of darkSection.split("\n")) {
    const m = line.match(
      /--portfolio-([\w-]+):\s*#\{(\$portfolio-[\w-]+)\}\s*;/
    );
    if (m) {
      const [, propName, ref] = m;
      const resolved = lookupMap.get(ref) || ref;
      darkMap.set(`$portfolio-${propName}`, resolved);
    }
    const mRgba = line.match(
      /--portfolio-([\w-]+):\s*(rgba\([^)]+\))\s*;/
    );
    if (mRgba) {
      const [, propName, val] = mRgba;
      darkMap.set(`$portfolio-${propName}`, val);
    }
  }
  return darkMap;
}

const darkOverrides = parseDarkOverrides(CUSTOM_PROPS_PATH, lookup);

// ---------------------------------------------------------------------------
// 2. Parse SCSS — Structured Semantic Tokens
// ---------------------------------------------------------------------------

const KNOWN_PROPERTIES = ["surface", "text", "icon", "border", "action"];
const MULTI_WORD_ROLES = ["always-light", "always-dark"];
const LEGACY_BOUNDARY = "5. Legacy Aliases";

const PROPERTY_DESCRIPTIONS = {
  surface:
    "Background fills. Any container that houses content should use a surface token.",
  text: "Text elements. Ensures 4.5:1 AA compliance.",
  icon: "Icon elements. Ensures 3:1 AA compliance (lower threshold than text).",
  border: "Border and divider lines.",
  action:
    "Actionable elements such as buttons, selected fills, and interactive controls.",
};

function parseStructuredSemantics(src) {
  const lines = src.split("\n");
  const structured = []; // property.role.emphasis tokens
  const interaction = []; // focus, highlight
  const legacyMap = new Map(); // new-token -> legacy-name

  let inLegacy = false;

  for (const line of lines) {
    if (line.includes(LEGACY_BOUNDARY)) {
      inLegacy = true;
      continue;
    }

    const m = line.match(
      /^\$portfolio-([\w-]+):\s*(\$portfolio-[\w-]+|#[0-9A-Fa-f]{3,8}|rgba\([^)]+\));/
    );
    if (!m) continue;
    const [, fullName, raw] = m;

    if (/^\w+-\d+$/.test(fullName)) continue;

    if (inLegacy) {
      if (raw.startsWith("$portfolio-")) {
        const newTokenName = raw.replace(";", "");
        if (!legacyMap.has(newTokenName)) {
          legacyMap.set(newTokenName, `$portfolio-${fullName}`);
        }
      }
      continue;
    }

    let property = null;
    for (const p of KNOWN_PROPERTIES) {
      if (fullName.startsWith(p + "-")) {
        property = p;
        break;
      }
    }

    if (property) {
      const rest = fullName.slice(property.length + 1);
      let role, emphasis;

      let matched = false;
      for (const r of MULTI_WORD_ROLES) {
        if (rest === r) {
          role = r;
          emphasis = null;
          matched = true;
          break;
        }
        if (rest.startsWith(r + "-")) {
          role = r;
          emphasis = rest.slice(r.length + 1);
          matched = true;
          break;
        }
      }

      if (!matched) {
        const parts = rest.split("-");
        role = parts[0];
        emphasis = parts.length > 1 ? parts.slice(1).join("-") : null;
      }

      structured.push({
        property,
        role,
        emphasis,
        token: `$portfolio-${fullName}`,
        raw,
        value: resolveValue(raw),
        ref: raw.startsWith("$") ? raw : undefined,
      });
    } else if (
      fullName.startsWith("focus") ||
      fullName.startsWith("highlight")
    ) {
      const interToken = `$portfolio-${fullName}`;
      interaction.push({
        name: fullName
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        token: interToken,
        value: resolveValue(raw),
        ref: raw.startsWith("$") ? raw : undefined,
        darkValue: darkOverrides.get(interToken),
      });
    }
  }

  return { structured, interaction, legacyMap };
}

const { structured, interaction, legacyMap } = parseStructuredSemantics(scss);

// ---------------------------------------------------------------------------
// 3. Build property → role → emphasis tree
// ---------------------------------------------------------------------------

const propertyTree = new Map();

for (const token of structured) {
  if (!propertyTree.has(token.property)) {
    propertyTree.set(token.property, new Map());
  }
  const roleMap = propertyTree.get(token.property);
  if (!roleMap.has(token.role)) {
    roleMap.set(token.role, []);
  }
  const legacy = legacyMap.get(token.token);
  const darkValue = darkOverrides.get(token.token);
  roleMap.get(token.role).push({
    emphasis: token.emphasis || "",
    value: token.value,
    token: token.token,
    ref: token.ref,
    legacy,
    darkValue,
  });
}

// ---------------------------------------------------------------------------
// 4. Generate TypeScript
// ---------------------------------------------------------------------------

const KNOWN_FAMILIES = [
  "accent",
  "terra",
  "neutral",
  "blue",
  "red",
  "green",
  "yellow",
  "orange",
  "teal",
  "cyan",
  "purple",
  "magenta",
];

const BRAND_ACCENTS = ["accent", "terra"];

const EXTENDED_FAMILIES = KNOWN_FAMILIES.filter(
  (f) => !BRAND_ACCENTS.includes(f) && f !== "neutral"
);

function formatScale(prefix, steps) {
  const pairs = steps.map((s) => `"${s.step}": "${s.value}"`).join(", ");
  return `scale("${prefix}", {\n    ${pairs},\n  })`;
}

function titleCase(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const accentSteps = palette.get("accent") || [];
const terraSteps = palette.get("terra") || [];
const neutralSteps = palette.get("neutral") || [];

let generated = `${BEGIN_MARKER}
export type ColorStep = { step: string; value: string; token: string };
export type ColorFamily = { name: string; prefix: string; steps: ColorStep[] };
export type SemanticToken = { name: string; value: string; token: string; ref?: string; darkValue?: string };

export type EmphasisToken = {
  emphasis: string;
  value: string;
  token: string;
  ref?: string;
  legacy?: string;
  darkValue?: string;
};

export type RoleGroup = {
  role: string;
  tokens: EmphasisToken[];
};

export type PropertySection = {
  property: string;
  description: string;
  roles: RoleGroup[];
};

const scale = (prefix: string, values: Record<string, string>): ColorStep[] =>
  Object.entries(values).map(([step, value]) => ({ step, value, token: \`$portfolio-\${prefix}-\${step}\` }));

export const colors = {
  accent: ${formatScale("accent", accentSteps)},
  terra: ${formatScale("terra", terraSteps)},
  neutral: ${formatScale("neutral", neutralSteps)},
  extended: [
`;

for (const family of EXTENDED_FAMILIES) {
  const steps = palette.get(family);
  if (!steps) continue;
  const displayName = family.charAt(0).toUpperCase() + family.slice(1);
  generated += `    {\n      name: "${displayName}", prefix: "${family}",\n      steps: ${formatScale(family, steps)},\n    },\n`;
}

generated += `  ] as ColorFamily[],
  properties: [
`;

for (const prop of KNOWN_PROPERTIES) {
  const roleMap = propertyTree.get(prop);
  if (!roleMap) continue;

  const desc = PROPERTY_DESCRIPTIONS[prop] || "";
  generated += `    {\n      property: "${prop}",\n      description: "${desc}",\n      roles: [\n`;

  for (const [role, tokens] of roleMap) {
    generated += `        {\n          role: "${role}",\n          tokens: [\n`;
    for (const t of tokens) {
      const ref = t.ref ? `, ref: "${t.ref}"` : "";
      const legacy = t.legacy ? `, legacy: "${t.legacy}"` : "";
      const dark = t.darkValue ? `, darkValue: "${t.darkValue}"` : "";
      generated += `            { emphasis: "${t.emphasis}", value: "${t.value}", token: "${t.token}"${ref}${legacy}${dark} },\n`;
    }
    generated += `          ],\n        },\n`;
  }

  generated += `      ],\n    },\n`;
}

generated += `  ] as PropertySection[],
  interaction: [
`;

for (const t of interaction) {
  const ref = t.ref ? `, ref: "${t.ref}"` : "";
  const dark = t.darkValue ? `, darkValue: "${t.darkValue}"` : "";
  generated += `    { name: "${t.name}", value: "${t.value}", token: "${t.token}"${ref}${dark} },\n`;
}

generated += `  ] as SemanticToken[],
};
${END_MARKER}`;

// ---------------------------------------------------------------------------
// 5. Write back to tokens.ts
// ---------------------------------------------------------------------------

const existing = readFileSync(TOKENS_PATH, "utf-8");

const beginIdx = existing.indexOf(BEGIN_MARKER);
const endIdx = existing.indexOf(END_MARKER);

let output;
if (beginIdx !== -1 && endIdx !== -1) {
  const endOfMarker = endIdx + END_MARKER.length;
  output =
    existing.slice(0, beginIdx) + generated + existing.slice(endOfMarker);
} else {
  console.warn(
    "Warning: Codegen markers not found in tokens.ts. Prepending generated code."
  );
  const restStart = existing.indexOf("export const typography");
  if (restStart !== -1) {
    output = generated + "\n\n" + existing.slice(restStart);
  } else {
    output = generated + "\n\n" + existing;
  }
}

writeFileSync(TOKENS_PATH, output, "utf-8");

const familyCount = EXTENDED_FAMILIES.filter((f) => palette.has(f)).length;
const propCount = structured.length;
const interactionCount = interaction.length;
console.log(
  `Synced: ${accentSteps.length} accent + ${terraSteps.length} terra + ${neutralSteps.length} neutral + ${familyCount} extended families`
);
console.log(
  `Structured: ${propCount} property tokens across ${KNOWN_PROPERTIES.length} properties, ${interactionCount} interaction tokens`
);
console.log(`Written to: ${TOKENS_PATH}`);
