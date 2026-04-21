'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Button } from '@/components/ui/Button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/AlertDialog'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
}

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider — mounts a single shared AlertDialog and owns open state
// ---------------------------------------------------------------------------

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const pendingRef = useRef<PendingConfirm | null>(null)
  pendingRef.current = pending

  const confirm = useCallback((opts: ConfirmOptions) => {
    // If an open confirmation is already resolving, cancel it first.
    if (pendingRef.current) {
      pendingRef.current.resolve(false)
    }
    return new Promise<boolean>((resolve) => {
      setPending({ ...opts, resolve })
    })
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && pendingRef.current) {
      pendingRef.current.resolve(false)
      setPending(null)
    }
  }, [])

  const handleCancel = useCallback(() => {
    if (pendingRef.current) {
      pendingRef.current.resolve(false)
      setPending(null)
    }
  }, [])

  const handleConfirm = useCallback(() => {
    if (pendingRef.current) {
      pendingRef.current.resolve(true)
      setPending(null)
    }
  }, [])

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog open={pending !== null} onOpenChange={handleOpenChange}>
        {pending && (
          <AlertDialogContent>
            <AlertDialogTitle>{pending.title}</AlertDialogTitle>
            <AlertDialogDescription>{pending.description}</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button
                  appearance="neutral"
                  emphasis="regular"
                  size="sm"
                  onClick={handleCancel}
                >
                  {pending.cancelLabel ?? 'Cancel'}
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  appearance="negative"
                  emphasis="bold"
                  size="sm"
                  onClick={handleConfirm}
                >
                  {pending.confirmLabel ?? 'Delete'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Imperative hook
// ---------------------------------------------------------------------------

/**
 * Returns the confirm API. Inside an `InlineEditProvider` this is always
 * mounted. Outside (non-admin render paths) we return a no-op that
 * resolves `false` so consuming hooks can be called unconditionally at
 * render time without crashing. Non-admin UIs never expose the
 * destructive triggers that would call `confirm()`, so resolving `false`
 * is the correct fallback.
 */
export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext)
  if (ctx) return ctx
  return NOOP_CONFIRM
}

const NOOP_CONFIRM: ConfirmContextValue = {
  confirm: () => Promise.resolve(false),
}

// ---------------------------------------------------------------------------
// Declarative component — caller owns the trigger
// ---------------------------------------------------------------------------

export interface ConfirmDeleteProps {
  trigger: ReactNode
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
}

export function ConfirmDelete({
  trigger,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
}: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleConfirm = useCallback(async () => {
    setBusy(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }, [onConfirm])

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button appearance="neutral" emphasis="regular" size="sm" disabled={busy}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild onClick={(e) => e.preventDefault()}>
            <Button
              appearance="negative"
              emphasis="bold"
              size="sm"
              disabled={busy}
              onClick={handleConfirm}
            >
              {busy ? 'Deleting…' : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
