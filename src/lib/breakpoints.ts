/**
 * Shared breakpoint constants for client-side JS.
 * These mirror the SCSS tokens in src/styles/tokens/_breakpoints.scss.
 * Always import from here — never hardcode breakpoint values in components.
 */

export const BREAKPOINTS = {
  xs: 375,
  sm: 672,
  md: 1056,
  lg: 1440,
  xl: 1920,
  '2xl': 2560,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;
