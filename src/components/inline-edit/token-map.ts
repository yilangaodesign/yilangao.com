export interface TokenMatch {
  token: string
  name: string
  value: string
  rawValue: string
}

export const TYPE_SCALE = [
  { token: '$portfolio-type-xs', name: 'xs', rem: '0.75rem', px: 12 },
  { token: '$portfolio-type-sm', name: 'sm', rem: '0.875rem', px: 14 },
  { token: '$portfolio-type-base', name: 'base', rem: '1rem', px: 16 },
  { token: '$portfolio-type-lg', name: 'lg', rem: '1.125rem', px: 18 },
  { token: '$portfolio-type-xl', name: 'xl', rem: '1.25rem', px: 20 },
  { token: '$portfolio-type-2xl', name: '2xl', rem: '1.5rem', px: 24 },
  { token: '$portfolio-type-3xl', name: '3xl', rem: '1.875rem', px: 30 },
  { token: '$portfolio-type-4xl', name: '4xl', rem: '2.25rem', px: 36 },
  { token: '$portfolio-type-5xl', name: '5xl', rem: '3rem', px: 48 },
  { token: '$portfolio-type-6xl', name: '6xl', rem: '3.75rem', px: 60 },
] as const

export const WEIGHT_SCALE = [
  { token: '$portfolio-weight-light', name: 'Light', value: 300 },
  { token: '$portfolio-weight-regular', name: 'Regular', value: 400 },
  { token: '$portfolio-weight-medium', name: 'Medium', value: 500 },
  { token: '$portfolio-weight-semibold', name: 'Semibold', value: 600 },
  { token: '$portfolio-weight-bold', name: 'Bold', value: 700 },
] as const

export const FONT_FAMILY_SCALE = [
  { token: '$portfolio-font-sans', name: 'Geist Sans', css: 'var(--font-geist-sans), system-ui, sans-serif' },
  { token: '$portfolio-font-mono', name: 'Geist Mono', css: 'var(--font-geist-mono), ui-monospace, monospace' },
  { token: '$portfolio-font-serif', name: 'Serif', css: 'Georgia, "Times New Roman", serif' },
  { token: '$portfolio-font-pixel-square', name: 'Pixel Square', css: 'var(--font-geist-pixel-square), monospace' },
  { token: '$portfolio-font-pixel-grid', name: 'Pixel Grid', css: 'var(--font-geist-pixel-grid), monospace' },
  { token: '$portfolio-font-pixel-circle', name: 'Pixel Circle', css: 'var(--font-geist-pixel-circle), monospace' },
  { token: '$portfolio-font-pixel-triangle', name: 'Pixel Triangle', css: 'var(--font-geist-pixel-triangle), monospace' },
  { token: '$portfolio-font-pixel-line', name: 'Pixel Line', css: 'var(--font-geist-pixel-line), monospace' },
] as const

export const COLOR_TOKENS = [
  { token: '$portfolio-text-primary', name: 'Black', hex: '#161616' },
  { token: '$portfolio-text-secondary', name: 'Dark Gray', hex: '#525252' },
  { token: '$portfolio-text-helper', name: 'Gray', hex: '#6f6f6f' },
  { token: '$portfolio-text-placeholder', name: 'Light Gray', hex: '#a8a8a8' },
  { token: '$portfolio-text-disabled', name: 'Muted', hex: '#c6c6c6' },
  { token: '$portfolio-text-inverse', name: 'White', hex: '#ffffff' },
  { token: '$portfolio-text-on-color', name: 'White (on color)', hex: '#ffffff' },
  { token: '$portfolio-accent-50', name: 'Accent', hex: '#4E6CFF' },
  { token: '$portfolio-accent-60', name: 'Accent Bold', hex: '#3336FF' },
  { token: '$portfolio-text-link', name: 'Link Blue', hex: '#3336FF' },
  { token: '$portfolio-text-error', name: 'Red', hex: '#da1e28' },
] as const

export function matchFontSize(computedFontSize: string): TokenMatch {
  const px = parseFloat(computedFontSize)
  let closest: (typeof TYPE_SCALE)[number] = TYPE_SCALE[2]
  let minDiff = Infinity

  for (const entry of TYPE_SCALE) {
    const diff = Math.abs(entry.px - px)
    if (diff < minDiff) {
      closest = entry
      minDiff = diff
    }
  }

  return {
    token: closest.token,
    name: closest.name,
    value: closest.rem,
    rawValue: `${Math.round(px)}px`,
  }
}

export function matchFontWeight(computedWeight: string): TokenMatch {
  const w = parseInt(computedWeight, 10) || 400
  let closest: (typeof WEIGHT_SCALE)[number] = WEIGHT_SCALE[1]
  let minDiff = Infinity

  for (const entry of WEIGHT_SCALE) {
    const diff = Math.abs(entry.value - w)
    if (diff < minDiff) {
      closest = entry
      minDiff = diff
    }
  }

  return {
    token: closest.token,
    name: closest.name,
    value: String(closest.value),
    rawValue: computedWeight,
  }
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!match) return rgb.toLowerCase()
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function matchFontFamily(computedFamily: string): TokenMatch {
  const normalized = computedFamily.toLowerCase().replace(/["']/g, '')

  for (const entry of FONT_FAMILY_SCALE) {
    const entryFirst = entry.css.split(',')[0].trim().replace(/["']/g, '').toLowerCase()
    if (normalized.includes(entryFirst)) {
      return {
        token: entry.token,
        name: entry.name,
        value: entry.css,
        rawValue: computedFamily,
      }
    }
  }

  const displayName = computedFamily.split(',')[0].trim().replace(/["']/g, '')
  return {
    token: '(custom)',
    name: displayName || computedFamily,
    value: computedFamily,
    rawValue: computedFamily,
  }
}

export function matchColor(computedColor: string): TokenMatch {
  const hex = rgbToHex(computedColor).toLowerCase()

  for (const entry of COLOR_TOKENS) {
    if (entry.hex === hex) {
      return {
        token: entry.token,
        name: entry.name,
        value: entry.hex,
        rawValue: hex,
      }
    }
  }

  return {
    token: '(custom)',
    name: hex,
    value: hex,
    rawValue: hex,
  }
}
