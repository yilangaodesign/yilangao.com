# External Video Embeds (YouTube / Vimeo / Loom)

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Source:** Session 2026-04-20, ENG-153 — "Add external video embed support to case studies (Path A: new `videoEmbed` block)."
**Updated:** 2026-04-20 — Initial creation.

> **Scope: external embed rendering only.** Uploaded video/image files go through Supabase Storage and `MediaRenderer` — see [storage.md](storage.md). This spoke covers only the `videoEmbed` block type and its parser, component, and remote-host requirements.

---

## §15.1 Architecture

External embeds are a **separate content block type**, not an extension of the `Media` collection. This is **Path A** (see §15.7 for why we did not extend `Media`).

```
Admin pastes URL in VideoEmbedInput (inline-edit)
   ↓
Projects.content[].videoEmbed { url, poster?, caption?, placeholderLabel? }
   ↓  (field validator in Projects.ts calls parseVideoEmbedUrl)
Payload saves the block as-is (URL is a plain string, poster is a Media upload relation)
   ↓
mapContentBlocks in src/app/(frontend)/(site)/work/[slug]/page.tsx calls parseVideoEmbedUrl
   ↓
Resolved ContentBlock: { blockType: 'videoEmbed', provider, embedUrl, autoplayUrl,
                          autoThumbnailUrl, isVertical, startSeconds?, posterUrl, caption }
   ↓
ProjectClient renders <VideoEmbed>
   ↓  (idle)
Poster <button> with accessible name → no iframe mounted, no provider cookies
   ↓  (user clicks / Enter / Space)
<iframe src={autoplayUrl}> → autoplay fires from the user gesture
```

## §15.2 Supported Providers

| Provider | Host patterns | Embed host | Privacy mode |
|---|---|---|---|
| **YouTube** | `youtube.com/watch?v=<id>`, `youtu.be/<id>`, `youtube.com/embed/<id>`, `youtube.com/shorts/<id>` | `youtube-nocookie.com/embed/<id>` | Yes — `youtube-nocookie` host + `rel=0`, `modestbranding=1` |
| **Vimeo** | `vimeo.com/<digits>[/<hash>]`, `player.vimeo.com/video/<digits>[?h=<hash>]` | `player.vimeo.com/video/<id>` | Yes — `?dnt=1`, `title=0`, `byline=0`, `portrait=0` |
| **Loom** | `loom.com/share/<id>`, `loom.com/embed/<id>` | `loom.com/embed/<id>` | No documented privacy variant — standard embed host |

## §15.3 Parser (`src/lib/parse-video-embed.ts`)

Pure isomorphic module — regex only, no DOM or server imports. Safe to call in a Payload `validate` callback server-side AND in the client renderer.

Returns `null` for unsupported providers or malformed URLs. `parseVideoEmbedUrl` is the only entry point.

### Two URLs per parse: `embedUrl` vs `autoplayUrl`

Click-to-load requires the iframe to NOT load the provider until user intent. But if the component mounted the embed URL *without* `autoplay=1`, the user would have to click twice — once on the poster, and again inside the provider's player UI.

The parser returns both:

- `embedUrl` — idle URL with privacy-mode params but no `autoplay=1`. Never actually loaded today (the component gates on activation), but exported for debugging and future pre-hydration cases.
- `autoplayUrl` — same URL plus `autoplay=1`. Swapped into the iframe at the moment of the user gesture, so the browser honors autoplay (gesture-origin).

### Timestamps (YouTube `?t=` / `?start=`)

Accepted formats: raw seconds (`?t=42`), and compound (`1h2m3s`, `2m30`, `45s`). The parsed `startSeconds` is appended as `start=<n>` on both `embedUrl` and `autoplayUrl`. Vimeo and Loom timestamps are not parsed today.

### Private Vimeo share hashes

Vimeo private shares use `vimeo.com/<id>/<hash>` or `player.vimeo.com/video/<id>?h=<hash>`. The hash is forwarded as `?h=<hash>` on the embed URL so private videos load. The parser does not authenticate — it just passes the hash through.

## §15.4 Component (`src/components/ui/VideoEmbed/`)

### Click-to-load behavior

Idle state renders a native `<button type="button">` with an accessible name (`caption` if set, else `"Play {Provider} video"`). The `<iframe>` is not mounted until the button is activated. This:

1. **Cuts LCP.** Loading three YouTube embeds on a case-study page each ships ~400KB of provider JS. With click-to-load the user pays that cost only on actual play.
2. **Defers provider cookies.** No iframe → no cookies set from the provider host until the user opts in.
3. **Keeps keyboard users first-class.** `<button>` gives Enter/Space activation for free, plus a native focus ring.

Once the iframe mounts, it stays mounted — we do not swap back to the poster on pause. Single user gesture → single mount.

### Poster precedence

1. User-uploaded `posterUrl` (admin uploads a custom frame on the `videoEmbed` block).
2. Provider `autoThumbnailUrl` (YouTube only — `i.ytimg.com/vi/<id>/hqdefault.jpg`).
3. Neutral dark frame with provider label ("YouTube" / "Vimeo" / "Loom").

Vimeo and Loom fall straight from (2) to (3) — their static-thumbnail APIs require authenticated server fetches and are **out of scope** today (see §15.9).

### Aspect ratios

`16 / 9` default. `9 / 16` when `isVertical` (YouTube Shorts). Set via CSS `aspect-ratio`. There is no `forceVertical` prop — the parser is the single source of truth.

### Zero border-radius

Per portfolio design identity §24 — all structural elements on the portfolio site have zero corner radius. The component enforces this in its SCSS module; do not override it downstream.

## §15.5 Remote Image Patterns

`i.ytimg.com` is listed in `next.config.ts` (root) AND `playground/next.config.ts` so YouTube auto-thumbs render through `next/image` in both apps. Vimeo and Loom do not need remote patterns — they have no static thumbnail URL.

**No CSP header is emitted anywhere in `src/` today.** If a CSP is added later, `frame-src` must include:

- `https://www.youtube-nocookie.com`
- `https://player.vimeo.com`
- `https://www.loom.com`

And `img-src` must include `https://i.ytimg.com`.

## §15.6 Inline Editing

- `useBlockManager.ts` — `BlockType` union includes `'videoEmbed'`; `DEFAULT_BLOCKS` provides an empty block `{ url: '', caption: '', placeholderLabel: 'Video embed' }`.
- `BlockToolbar.tsx` — toolbar menu has a "Video Embed" entry with an inline SVG play triangle (consistent with the other five entries — no `lucide-react` imports in this file).
- `VideoEmbedInput.tsx` — paste-URL input with live parse feedback. Shows detected provider + id on valid URL, inline error on unsupported. On blur, writes through `updateCollectionField('projects', id, 'content', nextBlocks)`.

**Inline-edit custom poster upload is deliberately out of scope** — custom posters are set via the Payload admin (Projects → block → poster upload). If users ask for inline poster upload, add a compact affordance later using the existing `uploadMedia` helper.

## §15.7 Why Path A (not Path B)

**Path B** (rejected) would have extended the `Media` collection with an `externalUrl` mode so a `Media` row could represent EITHER a Supabase-hosted file OR an external URL.

**Why rejected:** the `Media` collection's "uploaded file" contract — `url`, `filename`, `mimeType`, `filesize` non-null — is assumed across 40+ call sites: `MediaRenderer`, `extract-content-urls`, `resolve-thumbnail-url`, the homepage preload manifest, inline upload UI, the S3 plugin, the beforeChange filename hook. Every consumer would need null-checks or a `sourceType` discriminator, and the change radiates into the Projects thumbnail selector and the preload pipeline.

**Path A** isolates embed-only concerns to a new block slug. The only shared surface is `Projects.content[]`, which is already a discriminated union. No existing consumer breaks.

**Cost:** embeds cannot grid-mix inside `imageGroup` layout cells (see §15.8).

## §15.8 Accepted Gaps

1. **No grid-mixing.** `imageGroup.images[]` is strictly `Media` uploads. An external embed cannot sit side-by-side with an uploaded asset in a grid cell. If this need surfaces, revisit Path B (extend `Media` with a `sourceType` discriminator).
2. **No Vimeo/Loom auto-thumbnails.** Would require a server-side oEmbed fetch + cache layer. Admins can upload a custom poster instead.
3. **No captions or chapters (VTT tracks, playlist support).** YouTube timestamps (`?t=`) ARE supported at parse time.
4. **No autoplay on page load.** Autoplay fires only after the user clicks/activates the poster button. Accessibility + bandwidth.
5. **No preload-manifest integration.** Embeds are not surfaced in the homepage preload pipeline — only Media-backed assets are preloaded.
6. **No project-cover thumbnails from embeds.** `resolveThumbnailUrl` remains Media-only.

## §15.9 Adding a New Provider

1. Add host pattern + ID regex to `src/lib/parse-video-embed.ts`. Export `ParsedEmbed` with filled `embedUrl` / `autoplayUrl`. Set `autoThumbnailUrl` to `null` unless the provider has a static thumbnail URL.
2. Update §15.2 table above.
3. If adding a new thumbnail host, add a remote image pattern to both `next.config.ts` files.
4. Add a playground preview row in `playground/src/app/components/video-embed/page.tsx`.
5. Update `PROVIDER_LABEL` in `VideoEmbed.tsx` if you want a neutral-placeholder label.

## §15.10 Verification

```bash
# Unit parse checks (in a REPL or test):
parseVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42')
#  → { provider: 'youtube', id: 'dQw4w9WgXcQ', isVertical: false, startSeconds: 42, ... }

parseVideoEmbedUrl('https://www.youtube.com/shorts/abc12345678')
#  → { provider: 'youtube', isVertical: true, ... }

parseVideoEmbedUrl('https://vimeo.com/76979871/abc123def4')
#  → { provider: 'vimeo', id: '76979871', embedUrl: '...&h=abc123def4' }

parseVideoEmbedUrl('https://twitter.com/anything')
#  → null

# Playground:
curl -s http://localhost:4001/components/video-embed | grep -c 'Privacy-mode iframe embed'
# → 1

# Main site (after adding a videoEmbed block via Payload admin):
# 1. Paste a YouTube URL, confirm auto-thumb appears on the poster.
# 2. Click the poster, confirm playback starts (autoplay fires from the gesture).
# 3. Network tab: initial page load shows ZERO requests to youtube-nocookie.com.
#    After click, iframe loads from youtube-nocookie.com (privacy host confirmed).
# 4. Keyboard-only: Tab to poster button, Enter → autoplay fires; Space → same.
```
