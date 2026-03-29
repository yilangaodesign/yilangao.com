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
const TOKENS_PATH = resolve(ROOT, "playground/src/lib/tokens.ts");

const BEGIN_MARKER = "// @sync-tokens:begin";
const END_MARKER = "// @sync-tokens:end";

// ---------------------------------------------------------------------------
// 1. Parse SCSS
// ---------------------------------------------------------------------------

const scss = readFileSync(SCSS_PATH, "utf-8");

/** Parse `$portfolio-{family}-{step}: #HEX;` lines into a map. */
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

/** Parse `$portfolio-{role}: $portfolio-{ref};` or literal values. */
function parseSemanticVars(src) {
  const semantics = [];
  for (const line of src.split("\n")) {
    const m = line.match(
      /^\$portfolio-([\w-]+):\s*(\$portfolio-[\w-]+|#[0-9A-Fa-f]{3,8}|rgba\([^)]+\));/
    );
    if (m) {
      const [, token, raw] = m;
      // Skip palette vars (they have a numeric suffix like accent-10)
      if (/\d+$/.test(token)) continue;
      semantics.push({ token: `$portfolio-${token}`, raw });
    }
  }
  return semantics;
}

const palette = parsePaletteVars(scss);
const semantics = parseSemanticVars(scss);

// ---------------------------------------------------------------------------
// 2. Resolve semantic values
// ---------------------------------------------------------------------------

/** Build a flat lookup of all palette vars: "$portfolio-red-60" -> "#DA1E28" */
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

function resolveRef(raw) {
  if (raw.startsWith("$")) return raw;
  return "";
}

// ---------------------------------------------------------------------------
// 3. Group semantics into categories
// ---------------------------------------------------------------------------

const semanticGroups = {
  surface: [],
  text: [],
  border: [],
  support: [],
  focus: [],
  highlight: [],
};

for (const s of semantics) {
  const name = s.token.replace("$portfolio-", "");
  const resolved = resolveValue(s.raw);
  const ref = resolveRef(s.raw);

  const displayName = name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const entry = {
    name: displayName,
    value: resolved,
    token: s.token,
    ...(ref ? { ref } : {}),
  };

  if (name.startsWith("surface-")) semanticGroups.surface.push(entry);
  else if (name.startsWith("text-")) semanticGroups.text.push(entry);
  else if (name.startsWith("border-")) semanticGroups.border.push(entry);
  else if (name.startsWith("support-")) semanticGroups.support.push(entry);
  else if (name.startsWith("focus")) semanticGroups.focus.push(entry);
  else if (name.startsWith("highlight")) semanticGroups.highlight.push(entry);
}

// Clean up display names: "Surface Primary" -> "Primary", etc.
for (const [group, entries] of Object.entries(semanticGroups)) {
  for (const entry of entries) {
    const prefix =
      group === "focus" || group === "highlight"
        ? ""
        : group.charAt(0).toUpperCase() + group.slice(1) + " ";
    if (prefix && entry.name.startsWith(prefix)) {
      entry.name = entry.name.slice(prefix.length);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Generate TypeScript
// ---------------------------------------------------------------------------

const KNOWN_FAMILIES = [
  "accent",
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

const EXTENDED_FAMILIES = KNOWN_FAMILIES.filter(
  (f) => f !== "accent" && f !== "neutral"
);

function formatScale(prefix, steps) {
  const pairs = steps.map((s) => `"${s.step}": "${s.value}"`).join(", ");
  return `scale("${prefix}", {\n    ${pairs},\n  })`;
}

function formatSemanticArray(entries) {
  const lines = entries.map((e) => {
    const ref = e.ref ? `, ref: "${e.ref}"` : "";
    return `    { name: "${e.name}", value: "${e.value}", token: "${e.token}"${ref} },`;
  });
  return lines.join("\n");
}

const accentSteps = palette.get("accent") || [];
const neutralSteps = palette.get("neutral") || [];

let generated = `${BEGIN_MARKER}
export type ColorStep = { step: string; value: string; token: string };
export type ColorFamily = { name: string; prefix: string; steps: ColorStep[] };
export type SemanticToken = { name: string; value: string; token: string; ref?: string };

const scale = (prefix: string, values: Record<string, string>): ColorStep[] =>
  Object.entries(values).map(([step, value]) => ({ step, value, token: \`$portfolio-\${prefix}-\${step}\` }));

export const colors = {
  accent: ${formatScale("accent", accentSteps)},
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
  semantic: {
    surface: [
${formatSemanticArray(semanticGroups.surface)}
    ] as SemanticToken[],
    text: [
${formatSemanticArray(semanticGroups.text)}
    ] as SemanticToken[],
    border: [
${formatSemanticArray(semanticGroups.border)}
    ] as SemanticToken[],
    support: [
${formatSemanticArray(semanticGroups.support)}
    ] as SemanticToken[],
    focus: [
${formatSemanticArray(semanticGroups.focus)}
    ] as SemanticToken[],
    highlight: [
${formatSemanticArray(semanticGroups.highlight)}
    ] as SemanticToken[],
  },
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
  output = existing.slice(0, beginIdx) + generated + existing.slice(endOfMarker);
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
const semanticCount = semantics.length;
console.log(
  `Synced: ${accentSteps.length} accent + ${neutralSteps.length} neutral + ${familyCount} extended families, ${semanticCount} semantic tokens`
);
console.log(`Written to: ${TOKENS_PATH}`);
