import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ---------------------------------------------------------------------------
// Playground enforcement plugin (inline — no external dependency)
//
// Purpose: hard safety net for playground component pages. Catches patterns
// that violate the "thin harness" architecture even if the agent's Intent
// Gate (AGENTS.md #18) was bypassed.
// ---------------------------------------------------------------------------

const playgroundEnforcement = {
  meta: { name: "playground-enforcement" },
  rules: {
    "no-default-palette-in-classname": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Ban Tailwind default palette colors in playground component pages",
        },
        messages: {
          defaultPalette:
            "Don't use Tailwind default palette color '{{ match }}' in playground component pages. Use design token classes (bg-muted, text-accent, border-border, etc.) instead.",
        },
        schema: [],
      },
      create(context) {
        const PALETTE_COLORS =
          "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|stone|neutral";
        const SHADES = "50|100|200|300|400|500|600|700|800|900|950";
        const PREFIXES =
          "bg|text|border|ring|outline|shadow|decoration|accent|caret|fill|stroke|divide|from|via|to|placeholder";
        const ALLOWED = new Set(["bg-neutral-900", "bg-neutral-800"]);

        const regex = new RegExp(
          `\\b(${PREFIXES})-(${PALETTE_COLORS})-(${SHADES})\\b`,
          "g",
        );

        function checkString(node, value) {
          let match;
          regex.lastIndex = 0;
          while ((match = regex.exec(value)) !== null) {
            if (ALLOWED.has(match[0])) continue;
            context.report({
              node,
              messageId: "defaultPalette",
              data: { match: match[0] },
            });
          }
        }

        return {
          JSXAttribute(node) {
            if (node.name.name !== "className") return;
            if (
              node.value?.type === "Literal" &&
              typeof node.value.value === "string"
            ) {
              checkString(node.value, node.value.value);
            }
          },
        };
      },
    },

    "no-inline-style": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Ban inline style={{}} in playground pages except on svg and for transform/opacity/animationPlayState",
        },
        messages: {
          inlineStyle:
            "Don't use inline style={{}} in playground component pages. Use Tailwind classes or CSS custom properties. (Allowed on <svg> elements and when only using transform/opacity/animationPlayState.)",
        },
        schema: [],
      },
      create(context) {
        const ALLOWED_PROPS = new Set([
          "transform",
          "opacity",
          "animationPlayState",
        ]);

        return {
          JSXAttribute(node) {
            if (node.name.name !== "style") return;

            const openingEl = node.parent;
            if (openingEl?.name?.name === "svg") return;

            if (
              node.value?.type === "JSXExpressionContainer" &&
              node.value.expression?.type === "ObjectExpression"
            ) {
              const props = node.value.expression.properties;
              const allAllowed =
                props.length > 0 &&
                props.every(
                  (p) =>
                    p.type === "Property" &&
                    p.key?.type === "Identifier" &&
                    ALLOWED_PROPS.has(p.key.name),
                );
              if (allAllowed) return;
            }

            context.report({ node, messageId: "inlineStyle" });
          },
        };
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Main config
// ---------------------------------------------------------------------------

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    files: ["playground/src/app/components/**/*.tsx"],
    plugins: { "playground-enforcement": playgroundEnforcement },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@radix-ui/*", "@radix-ui/**"],
              message:
                "Playground pages must not import Radix UI directly. Import the design system component via @ds/* instead.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXElement[openingElement.name.name='style']",
          message:
            "Playground pages must not use <style> tags. Use Tailwind classes or design token CSS custom properties.",
        },
      ],
      "playground-enforcement/no-default-palette-in-classname": "error",
      "playground-enforcement/no-inline-style": "error",
    },
  },
]);

export default eslintConfig;
