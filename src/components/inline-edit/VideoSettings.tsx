'use client'

/**
 * VideoSettings — inline-edit overlay for video `Media` settings on
 * case-study pages.
 *
 * Two independent axes, deliberately NOT conflated (ENG-170 / FB-155):
 *
 *   1. Capability — "Audio off" / "Audio on". Does the viewer have a
 *      mute/unmute toggle at all? When off, the video plays silently with
 *      no audio affordance (decorative loops). When on, viewers see a
 *      mute toggle.
 *
 *   2. Default state — "Muted by default" / "Sound by default". Only
 *      meaningful when capability is on. Decides whether the video starts
 *      muted or with sound on page load; viewers can always flip it via
 *      the toggle.
 *
 * UI expresses this as a tree: the default-state row is only rendered when
 * Audio is on. Previously these were collapsed into a single ButtonSelect
 * ("Muted by default / Sound by default") that misrepresented what the
 * underlying capability-only model could actually do — clicking "Muted by
 * default" promised an unmute affordance that the renderer did not provide.
 *
 * Zones on the overlay:
 *  - `ButtonSelect` — Loop / Player (`playbackMode`)
 *  - `ButtonSelect` — Audio off / Audio on (`audioEnabled`)
 *  - `ButtonSelect` — Muted by default / Sound by default (`muted`) —
 *    conditional on Audio on.
 *  - `DropdownMenu` — poster-frame actions (occasional ops).
 *
 * All writes call `updateCollectionField` on the `media` collection and
 * call `router.refresh()`. No ephemeral state survives a reload (§14.10).
 * Zero `border-radius` per branding §1.1.
 */

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ButtonSelect,
  ButtonSelectItem,
} from '@/components/ui/ButtonSelect'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { updateCollectionField, uploadMedia } from './api'
import styles from './VideoSettings.module.scss'

export interface VideoSettingsProps {
  mediaId: string | number
  playbackMode?: 'loop' | 'player' | null
  /** Capability axis (ENG-170). */
  audioEnabled?: boolean | null
  /** Default-state axis (only meaningful when audioEnabled === true). */
  muted?: boolean | null
  posterUrl?: string | null
  className?: string
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="3" cy="7" r="1.2" fill="currentColor" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" />
      <circle cx="11" cy="7" r="1.2" fill="currentColor" />
    </svg>
  )
}

export default function VideoSettings({
  mediaId,
  playbackMode,
  audioEnabled,
  muted,
  posterUrl,
  className,
}: VideoSettingsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [modeActive, setModeActive] = useState<'loop' | 'player'>(
    playbackMode === 'player' ? 'player' : 'loop',
  )
  const [audioActive, setAudioActive] = useState<boolean>(
    audioEnabled === true,
  )
  // `muted` defaults to true when unset — matches the schema default and
  // the "browser-friendly" convention for loop videos.
  const [mutedActive, setMutedActive] = useState<boolean>(
    typeof muted === 'boolean' ? muted : true,
  )
  const posterInputRef = useRef<HTMLInputElement | null>(null)

  const setMode = (next: string) => {
    const mode = next === 'player' ? 'player' : 'loop'
    if (mode === modeActive || pending) return
    const prev = modeActive
    setModeActive(mode)
    startTransition(async () => {
      try {
        await updateCollectionField('media', mediaId, 'playbackMode', mode)
        router.refresh()
      } catch {
        setModeActive(prev)
      }
    })
  }

  const setAudio = (next: string) => {
    // ButtonSelect values are strings; map "on" → true, "off" → false.
    const nextVal = next === 'on'
    if (nextVal === audioActive || pending) return
    const prev = audioActive
    setAudioActive(nextVal)
    startTransition(async () => {
      try {
        await updateCollectionField('media', mediaId, 'audioEnabled', nextVal)
        router.refresh()
      } catch {
        setAudioActive(prev)
      }
    })
  }

  const setMuted = (next: string) => {
    const nextVal = next === 'muted'
    if (nextVal === mutedActive || pending) return
    const prev = mutedActive
    setMutedActive(nextVal)
    startTransition(async () => {
      try {
        await updateCollectionField('media', mediaId, 'muted', nextVal)
        router.refresh()
      } catch {
        setMutedActive(prev)
      }
    })
  }

  const onPickPoster = () => {
    posterInputRef.current?.click()
  }

  const onPosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    startTransition(async () => {
      try {
        const alt = file.name.replace(/\.[^.]+$/, '')
        const uploaded = await uploadMedia(file, alt)
        await updateCollectionField('media', mediaId, 'poster', uploaded.id)
        router.refresh()
      } catch {
        /* errors surface via network tab; toast wiring lives on parent surfaces */
      }
    })
  }

  const onClearPoster = () => {
    startTransition(async () => {
      try {
        await updateCollectionField('media', mediaId, 'poster', null)
        router.refresh()
      } catch {
        /* ignored — see above */
      }
    })
  }

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Video playback settings"
    >
      <ButtonSelect
        value={modeActive}
        onValueChange={setMode}
        size="xs"
        appearance="neutral"
        emphasis="bold"
        aria-label="Video playback mode"
      >
        <ButtonSelectItem value="loop">Loop</ButtonSelectItem>
        <ButtonSelectItem value="player">Player</ButtonSelectItem>
      </ButtonSelect>

      <ButtonSelect
        value={audioActive ? 'on' : 'off'}
        onValueChange={setAudio}
        size="xs"
        appearance="neutral"
        emphasis="bold"
        aria-label="Viewer audio controls"
      >
        <ButtonSelectItem value="off">Audio off</ButtonSelectItem>
        <ButtonSelectItem value="on">Audio on</ButtonSelectItem>
      </ButtonSelect>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            appearance="neutral"
            emphasis="bold"
            size="xs"
            iconOnly
            leadingIcon={<MoreIcon />}
            aria-label="More video settings"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent size="sm" align="end" sideOffset={6}>
          <DropdownMenuItem onSelect={onPickPoster}>
            {posterUrl ? 'Change poster frame…' : 'Set poster frame…'}
          </DropdownMenuItem>
          {posterUrl ? (
            <DropdownMenuItem onSelect={onClearPoster} destructive>
              Remove poster frame
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Second-tier control: only relevant when audio is on. Kept as a
          dedicated row (via flex-wrap causing natural wrap, or an explicit
          break below) so the tree relationship is visible. */}
      {audioActive ? (
        <div className={styles.secondaryRow}>
          <ButtonSelect
            value={mutedActive ? 'muted' : 'sound'}
            onValueChange={setMuted}
            size="xs"
            appearance="neutral"
            emphasis="bold"
            aria-label="Default audio on page load"
          >
            <ButtonSelectItem value="muted">Muted by default</ButtonSelectItem>
            <ButtonSelectItem value="sound">Sound by default</ButtonSelectItem>
          </ButtonSelect>
        </div>
      ) : null}

      <input
        ref={posterInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={onPosterFileChange}
        tabIndex={-1}
      />
    </div>
  )
}
