// @sync-tokens:begin
export type ColorStep = { step: string; value: string; token: string };
export type ColorFamily = { name: string; prefix: string; steps: ColorStep[] };
export type SemanticToken = { name: string; value: string; token: string; ref?: string };

export type EmphasisToken = {
  emphasis: string;
  value: string;
  token: string;
  ref?: string;
  legacy?: string;
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
  Object.entries(values).map(([step, value]) => ({ step, value, token: `$portfolio-${prefix}-${step}` }));

export const colors = {
  accent: scale("accent", {
    "10": "#F0F5FD", "20": "#D5E0FC", "30": "#B3C5FC", "40": "#8DA3FC", "50": "#7182FD", "60": "#3336FF", "70": "#0004E2", "80": "#0003A7", "90": "#000273", "100": "#05063E",
  }),
  neutral: scale("neutral", {
    "00": "#FFFFFF", "05": "#F9F9F9", "10": "#F4F4F4", "20": "#E0E0E0", "30": "#C6C6C6", "40": "#A8A8A8", "50": "#8D8D8D", "60": "#6F6F6F", "70": "#525252", "80": "#393939", "90": "#262626", "100": "#161616",
  }),
  extended: [
    {
      name: "Blue", prefix: "blue",
      steps: scale("blue", {
    "10": "#EDF5FF", "20": "#D0E2FF", "30": "#A6C8FF", "40": "#78A9FF", "50": "#4589FF", "60": "#0F62FE", "70": "#0043CE", "80": "#002D9C", "90": "#001D6C", "100": "#001141",
  }),
    },
    {
      name: "Red", prefix: "red",
      steps: scale("red", {
    "10": "#FFF1F1", "20": "#FFD7D9", "30": "#FFB3B8", "40": "#FF8389", "50": "#FA4D56", "60": "#DA1E28", "70": "#A2191F", "80": "#750E13", "90": "#520408", "100": "#2D0709",
  }),
    },
    {
      name: "Green", prefix: "green",
      steps: scale("green", {
    "10": "#DEFBE6", "20": "#A7F0BA", "30": "#6FDC8C", "40": "#42BE65", "50": "#24A148", "60": "#198038", "70": "#0E6027", "80": "#044317", "90": "#022D0D", "100": "#071908",
  }),
    },
    {
      name: "Yellow", prefix: "yellow",
      steps: scale("yellow", {
    "10": "#FCF4D6", "20": "#FDDC69", "30": "#F1C21B", "40": "#D2A106", "50": "#B28600", "60": "#8E6A00", "70": "#684E00", "80": "#483700", "90": "#302400", "100": "#1C1500",
  }),
    },
    {
      name: "Orange", prefix: "orange",
      steps: scale("orange", {
    "10": "#FFF2E8", "20": "#FFD9BE", "30": "#FFB784", "40": "#FF832B", "50": "#EB6200", "60": "#BA4E00", "70": "#8A3800", "80": "#5E2900", "90": "#3E1A00", "100": "#231000",
  }),
    },
    {
      name: "Teal", prefix: "teal",
      steps: scale("teal", {
    "10": "#D9FBFB", "20": "#9EF0F0", "30": "#3DDBD9", "40": "#08BDBA", "50": "#009D9A", "60": "#007D79", "70": "#005D5D", "80": "#004144", "90": "#022B30", "100": "#081A1C",
  }),
    },
    {
      name: "Cyan", prefix: "cyan",
      steps: scale("cyan", {
    "10": "#E5F6FF", "20": "#BAE6FF", "30": "#82CFFF", "40": "#33B1FF", "50": "#1192E8", "60": "#0072C3", "70": "#00539A", "80": "#003A6D", "90": "#012749", "100": "#061727",
  }),
    },
    {
      name: "Purple", prefix: "purple",
      steps: scale("purple", {
    "10": "#F6F2FF", "20": "#E8DAFF", "30": "#D4BBFF", "40": "#BE95FF", "50": "#A56EFF", "60": "#8A3FFC", "70": "#6929C4", "80": "#491D8B", "90": "#31135E", "100": "#1C0F30",
  }),
    },
    {
      name: "Magenta", prefix: "magenta",
      steps: scale("magenta", {
    "10": "#FFF0F7", "20": "#FFD6E8", "30": "#FFAFD2", "40": "#FF7EB6", "50": "#EE5396", "60": "#D02670", "70": "#9F1853", "80": "#740937", "90": "#510224", "100": "#2A0A18",
  }),
    },
  ] as ColorFamily[],
  properties: [
    {
      property: "surface",
      description: "Background fills. Any container that houses content should use a surface token.",
      roles: [
        {
          role: "neutral",
          tokens: [
            { emphasis: "minimal", value: "#FFFFFF", token: "$portfolio-surface-neutral-minimal", ref: "$portfolio-neutral-00", legacy: "$portfolio-surface-primary" },
            { emphasis: "subtle", value: "#F9F9F9", token: "$portfolio-surface-neutral-subtle", ref: "$portfolio-neutral-05", legacy: "$portfolio-surface-secondary" },
            { emphasis: "regular", value: "#F4F4F4", token: "$portfolio-surface-neutral-regular", ref: "$portfolio-neutral-10", legacy: "$portfolio-surface-tertiary" },
          ],
        },
        {
          role: "inverse",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-surface-inverse-bold", ref: "$portfolio-neutral-100", legacy: "$portfolio-surface-inverse" },
          ],
        },
        {
          role: "brand",
          tokens: [
            { emphasis: "bold", value: "#3336FF", token: "$portfolio-surface-brand-bold", ref: "$portfolio-accent-60" },
            { emphasis: "subtle", value: "#F0F5FD", token: "$portfolio-surface-brand-subtle", ref: "$portfolio-accent-10" },
          ],
        },
        {
          role: "negative",
          tokens: [
            { emphasis: "bold", value: "#DA1E28", token: "$portfolio-surface-negative-bold", ref: "$portfolio-red-60" },
            { emphasis: "subtle", value: "#FFF1F1", token: "$portfolio-surface-negative-subtle", ref: "$portfolio-red-10" },
          ],
        },
        {
          role: "positive",
          tokens: [
            { emphasis: "bold", value: "#198038", token: "$portfolio-surface-positive-bold", ref: "$portfolio-green-60" },
            { emphasis: "subtle", value: "#DEFBE6", token: "$portfolio-surface-positive-subtle", ref: "$portfolio-green-10" },
          ],
        },
        {
          role: "warning",
          tokens: [
            { emphasis: "bold", value: "#F1C21B", token: "$portfolio-surface-warning-bold", ref: "$portfolio-yellow-30" },
            { emphasis: "subtle", value: "#FCF4D6", token: "$portfolio-surface-warning-subtle", ref: "$portfolio-yellow-10" },
          ],
        },
        {
          role: "overlay",
          tokens: [
            { emphasis: "", value: "rgba(0, 0, 0, 0.5)", token: "$portfolio-surface-overlay" },
          ],
        },
        {
          role: "always-dark",
          tokens: [
            { emphasis: "", value: "#161616", token: "$portfolio-surface-always-dark", ref: "$portfolio-neutral-100" },
          ],
        },
        {
          role: "always-light",
          tokens: [
            { emphasis: "", value: "#FFFFFF", token: "$portfolio-surface-always-light", ref: "$portfolio-neutral-00" },
          ],
        },
      ],
    },
    {
      property: "text",
      description: "Text elements. Ensures 4.5:1 AA compliance.",
      roles: [
        {
          role: "neutral",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-text-neutral-bold", ref: "$portfolio-neutral-100", legacy: "$portfolio-text-primary" },
            { emphasis: "regular", value: "#525252", token: "$portfolio-text-neutral-regular", ref: "$portfolio-neutral-70", legacy: "$portfolio-text-secondary" },
            { emphasis: "subtle", value: "#6F6F6F", token: "$portfolio-text-neutral-subtle", ref: "$portfolio-neutral-60", legacy: "$portfolio-text-tertiary" },
            { emphasis: "minimal", value: "#A8A8A8", token: "$portfolio-text-neutral-minimal", ref: "$portfolio-neutral-40", legacy: "$portfolio-text-placeholder" },
            { emphasis: "disabled", value: "#C6C6C6", token: "$portfolio-text-neutral-disabled", ref: "$portfolio-neutral-30", legacy: "$portfolio-text-disabled" },
          ],
        },
        {
          role: "brand",
          tokens: [
            { emphasis: "bold", value: "#3336FF", token: "$portfolio-text-brand-bold", ref: "$portfolio-accent-60", legacy: "$portfolio-text-link" },
          ],
        },
        {
          role: "inverse",
          tokens: [
            { emphasis: "bold", value: "#FFFFFF", token: "$portfolio-text-inverse-bold", ref: "$portfolio-neutral-00", legacy: "$portfolio-text-inverse" },
          ],
        },
        {
          role: "always-light",
          tokens: [
            { emphasis: "bold", value: "#FFFFFF", token: "$portfolio-text-always-light-bold", ref: "$portfolio-neutral-00", legacy: "$portfolio-text-on-color" },
          ],
        },
        {
          role: "always-dark",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-text-always-dark-bold", ref: "$portfolio-neutral-100" },
          ],
        },
        {
          role: "negative",
          tokens: [
            { emphasis: "", value: "#DA1E28", token: "$portfolio-text-negative", ref: "$portfolio-red-60", legacy: "$portfolio-text-error" },
          ],
        },
        {
          role: "positive",
          tokens: [
            { emphasis: "", value: "#198038", token: "$portfolio-text-positive", ref: "$portfolio-green-60" },
          ],
        },
        {
          role: "warning",
          tokens: [
            { emphasis: "", value: "#8E6A00", token: "$portfolio-text-warning", ref: "$portfolio-yellow-60" },
          ],
        },
      ],
    },
    {
      property: "icon",
      description: "Icon elements. Ensures 3:1 AA compliance (lower threshold than text).",
      roles: [
        {
          role: "neutral",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-icon-neutral-bold", ref: "$portfolio-neutral-100" },
            { emphasis: "regular", value: "#525252", token: "$portfolio-icon-neutral-regular", ref: "$portfolio-neutral-70" },
            { emphasis: "subtle", value: "#6F6F6F", token: "$portfolio-icon-neutral-subtle", ref: "$portfolio-neutral-60" },
            { emphasis: "minimal", value: "#A8A8A8", token: "$portfolio-icon-neutral-minimal", ref: "$portfolio-neutral-40" },
            { emphasis: "disabled", value: "#C6C6C6", token: "$portfolio-icon-neutral-disabled", ref: "$portfolio-neutral-30" },
          ],
        },
        {
          role: "brand",
          tokens: [
            { emphasis: "bold", value: "#3336FF", token: "$portfolio-icon-brand-bold", ref: "$portfolio-accent-60" },
          ],
        },
        {
          role: "inverse",
          tokens: [
            { emphasis: "bold", value: "#FFFFFF", token: "$portfolio-icon-inverse-bold", ref: "$portfolio-neutral-00" },
          ],
        },
        {
          role: "always-light",
          tokens: [
            { emphasis: "bold", value: "#FFFFFF", token: "$portfolio-icon-always-light-bold", ref: "$portfolio-neutral-00" },
          ],
        },
        {
          role: "always-dark",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-icon-always-dark-bold", ref: "$portfolio-neutral-100" },
          ],
        },
        {
          role: "negative",
          tokens: [
            { emphasis: "", value: "#DA1E28", token: "$portfolio-icon-negative", ref: "$portfolio-red-60" },
          ],
        },
        {
          role: "positive",
          tokens: [
            { emphasis: "", value: "#198038", token: "$portfolio-icon-positive", ref: "$portfolio-green-60" },
          ],
        },
        {
          role: "warning",
          tokens: [
            { emphasis: "", value: "#8E6A00", token: "$portfolio-icon-warning", ref: "$portfolio-yellow-60" },
          ],
        },
      ],
    },
    {
      property: "border",
      description: "Border and divider lines.",
      roles: [
        {
          role: "neutral",
          tokens: [
            { emphasis: "bold", value: "#8D8D8D", token: "$portfolio-border-neutral-bold", ref: "$portfolio-neutral-50", legacy: "$portfolio-border-strong" },
            { emphasis: "subtle", value: "#E0E0E0", token: "$portfolio-border-neutral-subtle", ref: "$portfolio-neutral-20", legacy: "$portfolio-border-subtle" },
            { emphasis: "disabled", value: "#C6C6C6", token: "$portfolio-border-neutral-disabled", ref: "$portfolio-neutral-30", legacy: "$portfolio-border-disabled" },
          ],
        },
        {
          role: "brand",
          tokens: [
            { emphasis: "bold", value: "#3336FF", token: "$portfolio-border-brand-bold", ref: "$portfolio-accent-60", legacy: "$portfolio-border-interactive" },
          ],
        },
        {
          role: "inverse",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-border-inverse-bold", ref: "$portfolio-neutral-100", legacy: "$portfolio-border-inverse" },
          ],
        },
        {
          role: "always-light",
          tokens: [
            { emphasis: "", value: "#FFFFFF", token: "$portfolio-border-always-light", ref: "$portfolio-neutral-00" },
          ],
        },
        {
          role: "always-dark",
          tokens: [
            { emphasis: "", value: "#161616", token: "$portfolio-border-always-dark", ref: "$portfolio-neutral-100" },
          ],
        },
        {
          role: "negative",
          tokens: [
            { emphasis: "", value: "#DA1E28", token: "$portfolio-border-negative", ref: "$portfolio-red-60" },
          ],
        },
        {
          role: "positive",
          tokens: [
            { emphasis: "", value: "#198038", token: "$portfolio-border-positive", ref: "$portfolio-green-60" },
          ],
        },
        {
          role: "warning",
          tokens: [
            { emphasis: "", value: "#8E6A00", token: "$portfolio-border-warning", ref: "$portfolio-yellow-60" },
          ],
        },
      ],
    },
    {
      property: "action",
      description: "Actionable elements such as buttons, selected fills, and interactive controls.",
      roles: [
        {
          role: "brand",
          tokens: [
            { emphasis: "bold", value: "#3336FF", token: "$portfolio-action-brand-bold", ref: "$portfolio-accent-60" },
            { emphasis: "subtle", value: "#D5E0FC", token: "$portfolio-action-brand-subtle", ref: "$portfolio-accent-20" },
            { emphasis: "bold-hover", value: "#0004E2", token: "$portfolio-action-brand-bold-hover", ref: "$portfolio-accent-70" },
            { emphasis: "bold-pressed", value: "#0003A7", token: "$portfolio-action-brand-bold-pressed", ref: "$portfolio-accent-80" },
            { emphasis: "bold-disabled", value: "#B3C5FC", token: "$portfolio-action-brand-bold-disabled", ref: "$portfolio-accent-30" },
          ],
        },
        {
          role: "neutral",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-action-neutral-bold", ref: "$portfolio-neutral-100" },
            { emphasis: "regular", value: "#F4F4F4", token: "$portfolio-action-neutral-regular", ref: "$portfolio-neutral-10" },
            { emphasis: "bold-hover", value: "#393939", token: "$portfolio-action-neutral-bold-hover", ref: "$portfolio-neutral-80" },
            { emphasis: "bold-disabled", value: "#C6C6C6", token: "$portfolio-action-neutral-bold-disabled", ref: "$portfolio-neutral-30" },
          ],
        },
        {
          role: "inverse",
          tokens: [
            { emphasis: "bold", value: "#FFFFFF", token: "$portfolio-action-inverse-bold", ref: "$portfolio-neutral-00" },
          ],
        },
        {
          role: "always-dark",
          tokens: [
            { emphasis: "", value: "#161616", token: "$portfolio-action-always-dark", ref: "$portfolio-neutral-100" },
          ],
        },
        {
          role: "always-light",
          tokens: [
            { emphasis: "", value: "#FFFFFF", token: "$portfolio-action-always-light", ref: "$portfolio-neutral-00" },
          ],
        },
        {
          role: "negative",
          tokens: [
            { emphasis: "", value: "#DA1E28", token: "$portfolio-action-negative", ref: "$portfolio-red-60" },
          ],
        },
        {
          role: "positive",
          tokens: [
            { emphasis: "", value: "#198038", token: "$portfolio-action-positive", ref: "$portfolio-green-60" },
          ],
        },
        {
          role: "warning",
          tokens: [
            { emphasis: "", value: "#8E6A00", token: "$portfolio-action-warning", ref: "$portfolio-yellow-60" },
          ],
        },
      ],
    },
  ] as PropertySection[],
  interaction: [
    { name: "Focus", value: "#3336FF", token: "$portfolio-focus", ref: "$portfolio-accent-60" },
    { name: "Focus Inset", value: "#FFFFFF", token: "$portfolio-focus-inset", ref: "$portfolio-neutral-00" },
    { name: "Highlight", value: "#D5E0FC", token: "$portfolio-highlight", ref: "$portfolio-accent-20" },
  ] as SemanticToken[],
};
// @sync-tokens:end

export type TypographyMixin = {
  name: string;
  font: string;
  size: string;
  weight: string;
  leading: string;
  tracking?: string;
  extras?: string;
  use: string;
};

export type TypographyCategory = {
  name: string;
  description: string;
  mixins: TypographyMixin[];
};

export const typography = {
  fonts: [
    { name: "Geist Sans", value: "var(--font-geist-sans), 'Inter', system-ui, -apple-system, sans-serif", token: "$portfolio-font-sans", category: "Sans-serif", role: "Primary UI — headings, body, labels, stats" },
    { name: "Georgia (Serif)", value: "'Georgia', 'Times New Roman', serif", token: "$portfolio-font-serif", category: "Serif", role: "Quotes only — never headings or body" },
    { name: "Geist Mono", value: "var(--font-geist-mono), 'JetBrains Mono', ui-monospace, monospace", token: "$portfolio-font-mono", category: "Monospace", role: "Code only — never data numbers" },
    { name: "Geist Pixel Square", value: "var(--font-geist-pixel-square), monospace", token: "$portfolio-font-pixel-square", category: "Display / Pixel", role: "Decorative accent only" },
    { name: "Geist Pixel Grid", value: "var(--font-geist-pixel-grid), monospace", token: "$portfolio-font-pixel-grid", category: "Display / Pixel", role: "Decorative accent only" },
    { name: "Geist Pixel Circle", value: "var(--font-geist-pixel-circle), monospace", token: "$portfolio-font-pixel-circle", category: "Display / Pixel", role: "Decorative accent only" },
    { name: "Geist Pixel Triangle", value: "var(--font-geist-pixel-triangle), monospace", token: "$portfolio-font-pixel-triangle", category: "Display / Pixel", role: "Decorative accent only" },
    { name: "Geist Pixel Line", value: "var(--font-geist-pixel-line), monospace", token: "$portfolio-font-pixel-line", category: "Display / Pixel", role: "Decorative accent only" },
  ],
  weights: [
    { name: "Thin", value: 100, token: "$portfolio-weight-thin" },
    { name: "Extralight", value: 200, token: "$portfolio-weight-extralight" },
    { name: "Light", value: 300, token: "$portfolio-weight-light" },
    { name: "Regular", value: 400, token: "$portfolio-weight-regular" },
    { name: "Medium", value: 500, token: "$portfolio-weight-medium" },
    { name: "Semibold", value: 600, token: "$portfolio-weight-semibold" },
    { name: "Bold", value: 700, token: "$portfolio-weight-bold" },
  ],
  scale: [
    { name: "8xl", size: "6rem", px: "96px", token: "$portfolio-type-8xl" },
    { name: "7xl", size: "4.5rem", px: "72px", token: "$portfolio-type-7xl" },
    { name: "6xl", size: "3.75rem", px: "60px", token: "$portfolio-type-6xl" },
    { name: "5xl", size: "3rem", px: "48px", token: "$portfolio-type-5xl" },
    { name: "4xl", size: "2.25rem", px: "36px", token: "$portfolio-type-4xl" },
    { name: "3xl", size: "1.875rem", px: "30px", token: "$portfolio-type-3xl" },
    { name: "2xl", size: "1.5rem", px: "24px", token: "$portfolio-type-2xl" },
    { name: "xl", size: "1.25rem", px: "20px", token: "$portfolio-type-xl" },
    { name: "lg", size: "1.125rem", px: "18px", token: "$portfolio-type-lg" },
    { name: "base", size: "1rem", px: "16px", token: "$portfolio-type-base" },
    { name: "sm", size: "0.875rem", px: "14px", token: "$portfolio-type-sm" },
    { name: "xs", size: "0.75rem", px: "12px", token: "$portfolio-type-xs" },
    { name: "2xs", size: "0.5rem", px: "8px", token: "$portfolio-type-2xs" },
  ],
  leading: [
    { name: "Compact", value: "1.15", token: "$portfolio-leading-compact" },
    { name: "Tight", value: "1.1", token: "$portfolio-leading-tight" },
    { name: "Snug", value: "1.25", token: "$portfolio-leading-snug" },
    { name: "Normal", value: "1.5", token: "$portfolio-leading-normal" },
    { name: "Relaxed", value: "1.625", token: "$portfolio-leading-relaxed" },
    { name: "Loose", value: "2", token: "$portfolio-leading-loose" },
  ],
  tracking: [
    { name: "Tight", value: "-0.02em", token: "$portfolio-tracking-tight" },
    { name: "Normal", value: "0em", token: "$portfolio-tracking-normal" },
    { name: "Wide", value: "0.02em", token: "$portfolio-tracking-wide" },
    { name: "Wider", value: "0.05em", token: "$portfolio-tracking-wider" },
    { name: "Widest", value: "0.1em", token: "$portfolio-tracking-widest" },
  ],
  categories: [
    {
      name: "Headings",
      description: "Geist Sans, bold/semibold. Fluid variants available for responsive layouts.",
      mixins: [
        { name: "heading-display", font: "Sans", size: "6xl (60px)", weight: "Bold 700", leading: "Tight 1.1", tracking: "Tight", use: "Hero sections" },
        { name: "heading-1", font: "Sans", size: "5xl (48px)", weight: "Bold 700", leading: "Tight 1.1", tracking: "Tight", use: "Page titles" },
        { name: "heading-2", font: "Sans", size: "4xl (36px)", weight: "Semibold 600", leading: "Snug 1.25", tracking: "Tight", use: "Section titles" },
        { name: "heading-3", font: "Sans", size: "3xl (30px)", weight: "Semibold 600", leading: "Snug 1.25", use: "Subsection titles" },
      ],
    },
    {
      name: "Subtitles",
      description: "Geist Sans, medium/bold weight tracks. Adopted from OneGS subtitle tier.",
      mixins: [
        { name: "subtitle-1", font: "Sans", size: "xl (20px)", weight: "Semibold 600", leading: "Snug 1.25", use: "Section subheading" },
        { name: "subtitle-1-bold", font: "Sans", size: "xl (20px)", weight: "Bold 700", leading: "Snug 1.25", use: "Emphasized subheading" },
        { name: "subtitle-2", font: "Sans", size: "lg (18px)", weight: "Medium 500", leading: "Snug 1.25", use: "Card/component subheading" },
        { name: "subtitle-2-bold", font: "Sans", size: "lg (18px)", weight: "Bold 700", leading: "Snug 1.25", use: "Emphasized card subheading" },
        { name: "subtitle-3", font: "Sans", size: "base (16px)", weight: "Medium 500", leading: "Snug 1.25", use: "Inline subheading" },
        { name: "subtitle-3-bold", font: "Sans", size: "base (16px)", weight: "Bold 700", leading: "Snug 1.25", use: "Emphasized inline subheading" },
      ],
    },
    {
      name: "Body",
      description: "Geist Sans with weight matrix (light/regular/medium) and compact variants for dense UI.",
      mixins: [
        { name: "body-lg", font: "Sans", size: "lg (18px)", weight: "Regular 400", leading: "Normal 1.5", use: "Editorial, long-form" },
        { name: "body-lg-light", font: "Sans", size: "lg (18px)", weight: "Light 300", leading: "Normal 1.5", use: "Secondary/supporting large text" },
        { name: "body-base", font: "Sans", size: "base (16px)", weight: "Regular 400", leading: "Normal 1.5", use: "Standard body" },
        { name: "body-base-medium", font: "Sans", size: "base (16px)", weight: "Medium 500", leading: "Normal 1.5", use: "Emphasized body inline" },
        { name: "body-base-light", font: "Sans", size: "base (16px)", weight: "Light 300", leading: "Normal 1.5", use: "Secondary body" },
        { name: "body-sm", font: "Sans", size: "sm (14px)", weight: "Regular 400", leading: "Normal 1.5", use: "Dense UI body" },
        { name: "body-sm-medium", font: "Sans", size: "sm (14px)", weight: "Medium 500", leading: "Normal 1.5", use: "Emphasized small text" },
        { name: "body-compact", font: "Sans", size: "sm (14px)", weight: "Regular 400", leading: "Compact 1.15", use: "Dense panels, sidebars" },
        { name: "body-compact-xs", font: "Sans", size: "xs (12px)", weight: "Regular 400", leading: "Compact 1.15", use: "Very dense tables, metadata" },
      ],
    },
    {
      name: "Quotes",
      description: "Georgia serif, italic. Serif restricted to quotes per OneGS + Carbon guidance.",
      mixins: [
        { name: "quote-lg", font: "Serif", size: "2xl (24px)", weight: "Regular 400", leading: "Relaxed 1.625", extras: "italic", use: "Pull quotes, testimonials" },
        { name: "quote-base", font: "Serif", size: "xl (20px)", weight: "Regular 400", leading: "Relaxed 1.625", extras: "italic", use: "Inline block quotes" },
        { name: "quote-sm", font: "Serif", size: "lg (18px)", weight: "Regular 400", leading: "Relaxed 1.625", extras: "italic", use: "Small quotes, attribution" },
      ],
    },
    {
      name: "Captions",
      description: "Geist Sans. caption-sm at 8px follows OneGS Caption 02 for enterprise density.",
      mixins: [
        { name: "caption", font: "Sans", size: "xs (12px)", weight: "Regular 400", leading: "Normal 1.5", use: "Image captions, timestamps" },
        { name: "caption-sm", font: "Sans", size: "2xs (8px)", weight: "Regular 400", leading: "Compact 1.15", use: "Metadata, dense table secondary" },
      ],
    },
    {
      name: "Labels",
      description: "Geist Sans, regular weight, uppercase with wider tracking. Uppercase + tracking provides inherent emphasis — weight stays light to avoid double emphasis.",
      mixins: [
        { name: "label", font: "Sans", size: "xs (12px)", weight: "Regular 400", leading: "Normal 1.5", tracking: "Wider", extras: "uppercase", use: "Section headers, field labels, category tags, meta labels" },
        { name: "label-sm", font: "Sans", size: "2xs (10px)", weight: "Regular 400", leading: "Compact 1.3", tracking: "Wider", extras: "uppercase", use: "Compact labels, data-viz section headers, group sub-headers" },
      ],
    },
    {
      name: "Utility",
      description: "Helper text and legal copy. Adopted from Carbon.",
      mixins: [
        { name: "helper-text", font: "Sans", size: "xs (12px)", weight: "Regular 400", leading: "Normal 1.5", use: "Form descriptions below fields" },
        { name: "legal", font: "Sans", size: "xs (12px)", weight: "Regular 400", leading: "Normal 1.5", use: "Footer copyright, disclaimers" },
      ],
    },
    {
      name: "Code",
      description: "Geist Mono. Replaces former mono-data. Mono restricted to code per Carbon.",
      mixins: [
        { name: "code-lg", font: "Mono", size: "base (16px)", weight: "Regular 400", leading: "Normal 1.5", use: "Code blocks, large snippets" },
        { name: "code-base", font: "Mono", size: "sm (14px)", weight: "Regular 400", leading: "Normal 1.5", use: "Inline code, terminal output" },
        { name: "code-sm", font: "Mono", size: "xs (12px)", weight: "Regular 400", leading: "Compact 1.15", use: "Annotations, build hashes" },
      ],
    },
    {
      name: "Stats",
      description: "Geist Sans Light with tight tracking. Adapted from OneGS Stat styles (uses Sans Light instead of Sans Condensed). All use tabular-nums.",
      mixins: [
        { name: "stat-lg", font: "Sans", size: "7xl (72px)", weight: "Light 300", leading: "Tight 1.1", tracking: "Tight", extras: "tabular-nums", use: "Hero numbers, KPI dashboards" },
        { name: "stat-base", font: "Sans", size: "5xl (48px)", weight: "Light 300", leading: "Tight 1.1", tracking: "Tight", extras: "tabular-nums", use: "Secondary stat callouts" },
        { name: "stat-sm", font: "Sans", size: "3xl (30px)", weight: "Medium 500", leading: "Snug 1.25", extras: "tabular-nums", use: "Tertiary stat callouts" },
      ],
    },
  ] as TypographyCategory[],
};

export const spacing = {
  scale: [
    { name: "0.125x", value: "1px", token: "$portfolio-spacer-0-125x" },
    { name: "0.25x", value: "2px", token: "$portfolio-spacer-0-25x" },
    { name: "0.5x", value: "4px", token: "$portfolio-spacer-0-5x" },
    { name: "1x", value: "8px", token: "$portfolio-spacer-1x" },
    { name: "1.5x", value: "12px", token: "$portfolio-spacer-1-5x" },
    { name: "2x", value: "16px", token: "$portfolio-spacer-2x" },
    { name: "2.5x", value: "20px", token: "$portfolio-spacer-2-5x" },
    { name: "3x", value: "24px", token: "$portfolio-spacer-3x" },
    { name: "4x", value: "32px", token: "$portfolio-spacer-4x" },
    { name: "5x", value: "40px", token: "$portfolio-spacer-5x" },
    { name: "6x", value: "48px", token: "$portfolio-spacer-6x" },
    { name: "7x", value: "56px", token: "$portfolio-spacer-7x" },
    { name: "8x", value: "64px", token: "$portfolio-spacer-8x" },
    { name: "9x", value: "72px", token: "$portfolio-spacer-9x" },
    { name: "10x", value: "80px", token: "$portfolio-spacer-10x" },
    { name: "11x", value: "88px", token: "$portfolio-spacer-11x" },
    { name: "12x", value: "96px", token: "$portfolio-spacer-12x" },
    { name: "13x", value: "104px", token: "$portfolio-spacer-13x" },
    { name: "14x", value: "112px", token: "$portfolio-spacer-14x" },
    { name: "15x", value: "120px", token: "$portfolio-spacer-15x" },
    { name: "16x", value: "128px", token: "$portfolio-spacer-16x" },
    { name: "17x", value: "136px", token: "$portfolio-spacer-17x" },
    { name: "18x", value: "144px", token: "$portfolio-spacer-18x" },
    { name: "19x", value: "152px", token: "$portfolio-spacer-19x" },
    { name: "20x", value: "160px", token: "$portfolio-spacer-20x" },
  ],
  layout: [
    { name: "x-compact", value: "8px", token: "$portfolio-spacer-layout-x-compact", ref: "$portfolio-spacer-1x" },
    { name: "compact", value: "16px", token: "$portfolio-spacer-layout-compact", ref: "$portfolio-spacer-2x" },
    { name: "standard", value: "24px", token: "$portfolio-spacer-layout-standard", ref: "$portfolio-spacer-3x" },
    { name: "spacious", value: "32px", token: "$portfolio-spacer-layout-spacious", ref: "$portfolio-spacer-4x" },
    { name: "x-spacious", value: "48px", token: "$portfolio-spacer-layout-x-spacious", ref: "$portfolio-spacer-6x" },
    { name: "xx-spacious", value: "64px", token: "$portfolio-spacer-layout-xx-spacious", ref: "$portfolio-spacer-8x" },
    { name: "xxx-spacious", value: "80px", token: "$portfolio-spacer-layout-xxx-spacious", ref: "$portfolio-spacer-10x" },
    { name: "xxxx-spacious", value: "96px", token: "$portfolio-spacer-layout-xxxx-spacious", ref: "$portfolio-spacer-12x" },
  ],
  utility: [
    { name: "0.5x", value: "4px", token: "$portfolio-spacer-utility-0-5x" },
    { name: "0.75x", value: "6px", token: "$portfolio-spacer-utility-0-75x" },
    { name: "0.875x", value: "7px", token: "$portfolio-spacer-utility-0-875x" },
    { name: "1x", value: "8px", token: "$portfolio-spacer-utility-1x" },
    { name: "1.25x", value: "10px", token: "$portfolio-spacer-utility-1-25x" },
    { name: "1.5x", value: "12px", token: "$portfolio-spacer-utility-1-5x" },
    { name: "1.625x", value: "13px", token: "$portfolio-spacer-utility-1-625x" },
    { name: "2x", value: "16px", token: "$portfolio-spacer-utility-2x" },
    { name: "2.5x", value: "20px", token: "$portfolio-spacer-utility-2-5x" },
    { name: "3x", value: "24px", token: "$portfolio-spacer-utility-3x" },
  ],
  containers: [
    { name: "narrow", value: "672px", token: "$elan-container-narrow" },
    { name: "default", value: "1056px", token: "$elan-container-default" },
    { name: "wide", value: "1440px", token: "$elan-container-wide" },
  ],
};

export const motion = {
  durations: [
    { name: "Fast", value: "110ms", token: "$portfolio-duration-fast", use: "Hover, focus, color shifts" },
    { name: "Moderate", value: "240ms", token: "$portfolio-duration-moderate", use: "Transitions: border, bg, layout" },
    { name: "Slow", value: "400ms", token: "$portfolio-duration-slow", use: "Scale, translate, expand/collapse" },
    { name: "Slower", value: "600ms", token: "$portfolio-duration-slower", use: "Entrance choreography" },
  ],
  easings: [
    { name: "Standard", value: "cubic-bezier(0.2, 0, 0.38, 0.9)", array: [0.2, 0, 0.38, 0.9], token: "$portfolio-easing-standard" },
    { name: "Entrance", value: "cubic-bezier(0, 0, 0.38, 0.9)", array: [0, 0, 0.38, 0.9], token: "$portfolio-easing-entrance" },
    { name: "Exit", value: "cubic-bezier(0.2, 0, 1, 0.9)", array: [0.2, 0, 1, 0.9], token: "$portfolio-easing-exit" },
    { name: "Expressive", value: "cubic-bezier(0.4, 0.14, 0.3, 1)", array: [0.4, 0.14, 0.3, 1], token: "$portfolio-easing-expressive" },
  ],
  zIndex: [
    { name: "Base", value: 0, token: "$portfolio-z-base" },
    { name: "Dropdown", value: 100, token: "$portfolio-z-dropdown" },
    { name: "Sticky", value: 200, token: "$portfolio-z-sticky" },
    { name: "Overlay", value: 300, token: "$portfolio-z-overlay" },
    { name: "Modal", value: 400, token: "$portfolio-z-modal" },
    { name: "Toast", value: 600, token: "$portfolio-z-toast" },
  ],
  choreography: [
    { name: "TRANSITION_ENTER", duration: "0.6s (slower)", ease: "entrance", use: "Scroll-triggered entrance (FadeIn, whileInView)", ts: "TRANSITION_ENTER" },
    { name: "TRANSITION_STAGGER_ITEM", duration: "0.4s (slow)", ease: "entrance", use: "Individual item in a stagger sequence", ts: "TRANSITION_STAGGER_ITEM" },
    { name: "TRANSITION_EXPAND", duration: "0.4s (slow)", ease: "standard", use: "Expand / collapse (disclosure, accordion)", ts: "TRANSITION_EXPAND" },
    { name: "TRANSITION_INDICATOR", duration: "0.24s (moderate)", ease: "standard", use: "Hover indicator shifts (arrows, icons)", ts: "TRANSITION_INDICATOR" },
    { name: "TRANSITION_HOVER_SCALE", duration: "0.4s (slow)", ease: "standard", use: "Hover scale on thumbnails / images", ts: "TRANSITION_HOVER_SCALE" },
  ],
  mixins: [
    { name: "transition-base", token: "@include transition-base", desc: "all · moderate · standard" },
    { name: "transition-fast", token: "@include transition-fast", desc: "all · fast · standard" },
    { name: "hover-lift", token: "@include hover-lift", desc: "translateY(-4px) + shadow-lg · moderate" },
    { name: "hover-micro-lift", token: "@include hover-micro-lift", desc: "translateY(-1px) + opacity · fast" },
    { name: "hover-scale", token: "@include hover-scale($scale)", desc: "scale(1.02) · slow · will-change" },
    { name: "compound-card-hover", token: "@include compound-card-hover($img, $title)", desc: "Parent hover → child image scale + title recolor" },
    { name: "link-color", token: "@include link-color($hover-color)", desc: "Color transition · fast" },
    { name: "link-underline", token: "@include link-underline", desc: "Animated underline via background-size · moderate" },
    { name: "form-field-focus", token: "@include form-field-focus($accent)", desc: "border-color + box-shadow · fast" },
    { name: "reduced-motion", token: "@include reduced-motion", desc: "Zeroes durations, resets scroll-behavior" },
  ],
  globals: [
    { name: "scroll-behavior: smooth", source: "src/app/globals.scss", desc: "Native smooth-scrolling for anchor navigation on <html>" },
    { name: "prefers-reduced-motion", source: "src/lib/motion.ts + _interactive.scss", desc: "All Framer components use useReducedMotion(); CSS mixin zeroes durations" },
  ],
};

export const elevation = {
  shadows: [
    { name: "None", value: "none", token: "$portfolio-shadow-none" },
    { name: "Small", value: "0 1px 2px rgba(0, 0, 0, 0.05)", token: "$portfolio-shadow-sm" },
    { name: "Medium", value: "0 4px 8px rgba(0, 0, 0, 0.08)", token: "$portfolio-shadow-md" },
    { name: "Large", value: "0 8px 24px rgba(0, 0, 0, 0.12)", token: "$portfolio-shadow-lg" },
    { name: "XL", value: "0 16px 48px rgba(0, 0, 0, 0.16)", token: "$portfolio-shadow-xl" },
    { name: "Overlay", value: "0 24px 64px rgba(0, 0, 0, 0.2)", token: "$portfolio-shadow-overlay" },
  ],
  radii: [
    { name: "None", value: "0px", token: "$portfolio-radius-none" },
    { name: "Small", value: "4px", token: "$portfolio-radius-sm" },
    { name: "Medium", value: "8px", token: "$portfolio-radius-md" },
    { name: "Large", value: "12px", token: "$portfolio-radius-lg" },
    { name: "XL", value: "16px", token: "$portfolio-radius-xl" },
    { name: "2XL", value: "24px", token: "$portfolio-radius-2xl" },
    { name: "Full", value: "9999px", token: "$portfolio-radius-full" },
  ],
};

export type Breakpoint = {
  name: string;
  value: string;
  token: string;
  columns: number;
  origin: string;
  description: string;
};

export const breakpoints: Breakpoint[] = [
  { name: "xs", value: "375px", token: "$elan-bp-xs", columns: 4, origin: "OneGS", description: "Modern smallest phone (iPhone SE)" },
  { name: "sm", value: "672px", token: "$elan-bp-sm", columns: 8, origin: "Carbon", description: "Large phone landscape / small tablet" },
  { name: "md", value: "1056px", token: "$elan-bp-md", columns: 16, origin: "Carbon", description: "Standard laptop" },
  { name: "lg", value: "1440px", token: "$elan-bp-lg", columns: 16, origin: "OneGS", description: "Common laptop / external display" },
  { name: "xl", value: "1920px", token: "$elan-bp-xl", columns: 16, origin: "OneGS", description: "Full HD desktop monitor" },
  { name: "2xl", value: "2560px", token: "$elan-bp-2xl", columns: 16, origin: "New", description: "QHD / ultrawide" },
];

export type DensityMode = {
  name: string;
  gutter: string;
  description: string;
};

export const densityModes: DensityMode[] = [
  { name: "Comfortable", gutter: "32px", description: "Editorial content, reading-heavy pages, settings panels" },
  { name: "Compact", gutter: "16px", description: "Data tables, dashboards, form-heavy admin screens, side panels" },
  { name: "Condensed", gutter: "1px", description: "Dense dashboards, resource catalogs, tile overviews" },
];
