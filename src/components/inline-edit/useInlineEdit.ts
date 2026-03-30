'use client'

import { useContext } from 'react'
import { InlineEditContext } from './InlineEditProvider'
import type { InlineEditContextValue } from './types'

export function useInlineEdit(): InlineEditContextValue | null {
  return useContext(InlineEditContext)
}

export function useRequiredInlineEdit(): InlineEditContextValue {
  const ctx = useContext(InlineEditContext)
  if (!ctx) {
    throw new Error('useRequiredInlineEdit must be used within an InlineEditProvider')
  }
  return ctx
}
