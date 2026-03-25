/**
 * Portfolio Design System — TypeScript Design Tokens
 * Mirrors the SCSS tokens for use in component logic, props, and documentation.
 * Based on IBM Carbon Design System v11 with custom brand extensions.
 */

// =============================================================================
// ACCENT COLOR SCALE
// =============================================================================

export const accentColors = {
  accent10: '#F0F0FF',
  accent20: '#D9D9FF',
  accent30: '#B3B3FF',
  accent40: '#8C8CFF',
  accent50: '#6B5CE7',
  accent60: '#4A3ADB', // Key brand color
  accent70: '#3628B0',
  accent80: '#261C85',
  accent90: '#18115A',
  accent100: '#0C0930',
} as const;

// =============================================================================
// NEUTRAL SCALE
// =============================================================================

export const neutralColors = {
  neutral00: '#FFFFFF',
  neutral05: '#F9F9F9',
  neutral10: '#F4F4F4',
  neutral20: '#E0E0E0',
  neutral30: '#C6C6C6',
  neutral40: '#A8A8A8',
  neutral50: '#8D8D8D',
  neutral60: '#6F6F6F',
  neutral70: '#525252',
  neutral80: '#393939',
  neutral90: '#262626',
  neutral100: '#161616',
} as const;

// =============================================================================
// SEMANTIC TOKENS
// =============================================================================

export const surfaceTokens = {
  primary: neutralColors.neutral00,
  secondary: neutralColors.neutral05,
  tertiary: neutralColors.neutral10,
  inverse: neutralColors.neutral100,
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const textTokens = {
  primary: neutralColors.neutral100,
  secondary: neutralColors.neutral70,
  placeholder: neutralColors.neutral40,
  disabled: neutralColors.neutral30,
  inverse: neutralColors.neutral00,
  link: accentColors.accent60,
} as const;

export const borderTokens = {
  subtle: neutralColors.neutral20,
  strong: neutralColors.neutral50,
  interactive: accentColors.accent60,
  inverse: neutralColors.neutral100,
} as const;

export const supportTokens = {
  error: '#DA1E28',
  errorBg: '#FFF1F1',
  warning: '#F1C21B',
  warningBg: '#FCF4D6',
  success: '#198038',
  successBg: '#DEFBE6',
  info: '#0043CE',
  infoBg: '#E5F6FF',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const fontFamilies = {
  sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Lora', 'Georgia', serif",
  mono: "'JetBrains Mono', 'Menlo', 'Consolas', monospace",
} as const;

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const typeScale = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  '01': '2px',
  '02': '4px',
  '03': '8px',
  '04': '12px',
  '05': '16px',
  '06': '24px',
  '07': '32px',
  '08': '40px',
  '09': '48px',
  '10': '64px',
  '11': '80px',
  '12': '96px',
  '13': '128px',
} as const;

export const layoutSpacing = {
  '01': '16px',
  '02': '24px',
  '03': '32px',
  '04': '48px',
  '05': '64px',
  '06': '96px',
  '07': '128px',
} as const;

// =============================================================================
// ELEVATION
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.16)',
  overlay: '0 24px 64px rgba(0, 0, 0, 0.2)',
} as const;

export const radii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// =============================================================================
// MOTION
// =============================================================================

export const durations = {
  fast: '110ms',
  moderate: '240ms',
  slow: '400ms',
  slower: '600ms',
} as const;

export const easings = {
  standard: 'cubic-bezier(0.2, 0, 0.38, 0.9)',
  entrance: 'cubic-bezier(0, 0, 0.38, 0.9)',
  exit: 'cubic-bezier(0.2, 0, 1, 0.9)',
  expressive: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '320px',
  md: '672px',
  lg: '1056px',
  xl: '1312px',
  '2xl': '1584px',
} as const;

export const containerWidths = {
  sm: '672px',
  md: '1056px',
  lg: '1312px',
  xl: '1584px',
} as const;
