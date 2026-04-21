'use client'

/**
 * Inline-edit Toast surface.
 *
 * Wraps DS Toast (Radix UI) and exposes a single imperative API:
 *
 *   const toast = useToast()
 *   toast.success('Block deleted')
 *   toast.error('Save failed')
 *   toast.undoable({ message: 'Paragraph deleted', onUndo: () => restore() })
 *
 * Mounted once inside `InlineEditProvider`. Radix Toast announces messages
 * natively to assistive tech, replacing the `#block-live-region` div.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastVariant,
} from '@/components/ui/Toast'
import styles from './inline-edit.module.scss'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface UndoableToastOptions {
  message: string
  onUndo: () => void
  /** Time (ms) before the undo window closes. Defaults to 6000. */
  duration?: number
  /** Optional secondary text below the message. */
  description?: string
  /** Label for the undo action button. Defaults to "Undo". */
  undoLabel?: string
}

export interface ToastApi {
  success: (message: string, opts?: { description?: string; duration?: number }) => void
  error: (message: string, opts?: { description?: string; duration?: number }) => void
  info: (message: string, opts?: { description?: string; duration?: number }) => void
  undoable: (opts: UndoableToastOptions) => void
}

type ToastEntry = {
  id: number
  variant: ToastVariant
  message: string
  description?: string
  duration: number
  action?: { label: string; onClick: () => void; altText: string }
  open: boolean
}

const ToastContext = createContext<ToastApi | null>(null)

const DEFAULT_DURATION = 4000
const UNDO_DURATION = 6000

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function InlineToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const idRef = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const closeToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)))
  }, [])

  const push = useCallback((entry: Omit<ToastEntry, 'id' | 'open'>) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { ...entry, id, open: true }])
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, opts) =>
        push({
          variant: 'success',
          message,
          description: opts?.description,
          duration: opts?.duration ?? DEFAULT_DURATION,
        }),
      error: (message, opts) =>
        push({
          variant: 'error',
          message,
          description: opts?.description,
          duration: opts?.duration ?? DEFAULT_DURATION,
        }),
      info: (message, opts) =>
        push({
          variant: 'info',
          message,
          description: opts?.description,
          duration: opts?.duration ?? DEFAULT_DURATION,
        }),
      undoable: ({ message, onUndo, duration, description, undoLabel = 'Undo' }) => {
        const id = ++idRef.current
        setToasts((prev) => [
          ...prev,
          {
            id,
            variant: 'info',
            message,
            description,
            duration: duration ?? UNDO_DURATION,
            action: {
              label: undoLabel,
              altText: undoLabel,
              onClick: () => {
                onUndo()
                setToasts((curr) => curr.map((t) => (t.id === id ? { ...t, open: false } : t)))
              },
            },
            open: true,
          },
        ])
      },
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      <RadixToastProvider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            duration={t.duration}
            open={t.open}
            onOpenChange={(open) => {
              if (!open) {
                closeToast(t.id)
                window.setTimeout(() => removeToast(t.id), 200)
              }
            }}
          >
            <div className={styles.toastBody}>
              <ToastTitle>{t.message}</ToastTitle>
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            {t.action && (
              <ToastAction altText={t.action.altText} onClick={t.action.onClick}>
                {t.action.label}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the toast API. Inside an InlineEditProvider this is always
 * mounted; outside it returns a no-op surface so consumers can call
 * `toast.error(...)` without crashing in non-admin contexts.
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (ctx) return ctx
  return NOOP_TOAST
}

const NOOP_TOAST: ToastApi = {
  success: () => {},
  error: () => {},
  info: () => {},
  undoable: () => {},
}
