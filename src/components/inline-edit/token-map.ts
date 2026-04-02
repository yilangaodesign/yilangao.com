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

const COLOR_TOKENS = [
  { token: '$portfolio-text-primary', name: 'text-primary', hex: '#161616' },
  { token: '$portfolio-text-secondary', name: 'text-secondary', hex: '#525252' },
  { token: '$portfolio-text-helper', name: 'text-helper', hex: '#6f6f6f' },
  { token: '$portfolio-text-placeholder', name: 'text-placeholder', hex: '#a8a8a8' },
  { token: '$portfolio-text-disabled', name: 'text-disabled', hex: '#c6c6c6' },
  { token: '$portfolio-text-inverse', name: 'text-inverse', hex: '#ffffff' },
  { token: '$portfolio-text-on-color', name: 'text-on-color', hex: '#ffffff' },
  { token: '$portfolio-accent-50', name: 'accent-50', hex: '#6b5ce7' },
  { token: '$portfolio-accent-60', name: 'accent-60', hex: '#4a3adb' },
  { token: '$portfolio-text-link', name: 'text-link', hex: '#4a3adb' },
  { token: '$portfolio-text-error', name: 'text-error', hex: '#da1e28' },
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
