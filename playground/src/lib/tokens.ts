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
            { emphasis: "subtle", value: "#6F6F6F", token: "$portfolio-text-neutral-subtle", ref: "$portfolio-neutral-60", legacy: "$portfolio-text-helper" },
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
            { emphasis: "", value: "#F1C21B", token: "$portfolio-text-warning", ref: "$portfolio-yellow-30" },
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
            { emphasis: "", value: "#F1C21B", token: "$portfolio-icon-warning", ref: "$portfolio-yellow-30" },
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
            { emphasis: "", value: "#F1C21B", token: "$portfolio-border-warning", ref: "$portfolio-yellow-30" },
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
          ],
        },
        {
          role: "neutral",
          tokens: [
            { emphasis: "bold", value: "#161616", token: "$portfolio-action-neutral-bold", ref: "$portfolio-neutral-100" },
            { emphasis: "regular", value: "#F4F4F4", token: "$portfolio-action-neutral-regular", ref: "$portfolio-neutral-10" },
          ],
        },
        {
          role: "inverse",
          tokens: [
            { emphasis: "bold", value: "#FFFFFF", token: "$portfolio-action-inverse-bold", ref: "$portfolio-neutral-00" },
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
            { emphasis: "", value: "#F1C21B", token: "$portfolio-action-warning", ref: "$portfolio-yellow-30" },
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

export const typography = {
  fonts: [
    { name: "Geist Sans", value: "var(--font-geist-sans), 'Inter', system-ui, -apple-system, sans-serif", token: "$portfolio-font-sans", category: "Sans-serif" },
    { name: "Geist Mono", value: "var(--font-geist-mono), 'JetBrains Mono', ui-monospace, monospace", token: "$portfolio-font-mono", category: "Monospace" },
    { name: "Geist Pixel Square", value: "var(--font-geist-pixel-square), system-ui, sans-serif", token: "$portfolio-font-pixel-square", category: "Display / Pixel" },
    { name: "Geist Pixel Grid", value: "var(--font-geist-pixel-grid), system-ui, sans-serif", token: "$portfolio-font-pixel-grid", category: "Display / Pixel" },
    { name: "Geist Pixel Circle", value: "var(--font-geist-pixel-circle), system-ui, sans-serif", token: "$portfolio-font-pixel-circle", category: "Display / Pixel" },
    { name: "Geist Pixel Triangle", value: "var(--font-geist-pixel-triangle), system-ui, sans-serif", token: "$portfolio-font-pixel-triangle", category: "Display / Pixel" },
    { name: "Geist Pixel Line", value: "var(--font-geist-pixel-line), system-ui, sans-serif", token: "$portfolio-font-pixel-line", category: "Display / Pixel" },
    { name: "Georgia (Serif)", value: "'Georgia', 'Times New Roman', serif", token: "$portfolio-font-serif", category: "Serif" },
  ],
  weights: [
    { name: "Light", value: 300, token: "$portfolio-weight-light" },
    { name: "Regular", value: 400, token: "$portfolio-weight-regular" },
    { name: "Medium", value: 500, token: "$portfolio-weight-medium" },
    { name: "Semibold", value: 600, token: "$portfolio-weight-semibold" },
    { name: "Bold", value: 700, token: "$portfolio-weight-bold" },
  ],
  scale: [
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
  ],
  leading: [
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
};

export const spacing = {
  scale: [
    { name: "01", value: "2px", token: "$portfolio-spacing-01" },
    { name: "02", value: "4px", token: "$portfolio-spacing-02" },
    { name: "03", value: "8px", token: "$portfolio-spacing-03" },
    { name: "04", value: "12px", token: "$portfolio-spacing-04" },
    { name: "05", value: "16px", token: "$portfolio-spacing-05" },
    { name: "06", value: "24px", token: "$portfolio-spacing-06" },
    { name: "07", value: "32px", token: "$portfolio-spacing-07" },
    { name: "08", value: "40px", token: "$portfolio-spacing-08" },
    { name: "09", value: "48px", token: "$portfolio-spacing-09" },
    { name: "10", value: "64px", token: "$portfolio-spacing-10" },
    { name: "11", value: "80px", token: "$portfolio-spacing-11" },
    { name: "12", value: "96px", token: "$portfolio-spacing-12" },
    { name: "13", value: "128px", token: "$portfolio-spacing-13" },
  ],
  layout: [
    { name: "01", value: "16px", token: "$portfolio-layout-01" },
    { name: "02", value: "24px", token: "$portfolio-layout-02" },
    { name: "03", value: "32px", token: "$portfolio-layout-03" },
    { name: "04", value: "48px", token: "$portfolio-layout-04" },
    { name: "05", value: "64px", token: "$portfolio-layout-05" },
    { name: "06", value: "96px", token: "$portfolio-layout-06" },
    { name: "07", value: "128px", token: "$portfolio-layout-07" },
  ],
  containers: [
    { name: "sm", value: "672px", token: "$portfolio-container-sm" },
    { name: "md", value: "1056px", token: "$portfolio-container-md" },
    { name: "lg", value: "1312px", token: "$portfolio-container-lg" },
    { name: "xl", value: "1584px", token: "$portfolio-container-xl" },
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

export const breakpoints = [
  { name: "sm", value: "320px", token: "$portfolio-bp-sm" },
  { name: "md", value: "672px", token: "$portfolio-bp-md" },
  { name: "lg", value: "1056px", token: "$portfolio-bp-lg" },
  { name: "xl", value: "1312px", token: "$portfolio-bp-xl" },
  { name: "2xl", value: "1584px", token: "$portfolio-bp-2xl" },
];
