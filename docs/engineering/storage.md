# Media & File Storage (Supabase Storage)

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Source:** Session 2026-03-30, ENG-053 — "How do I store assets? Where are thumbnails and resumes stored?"
**Updated:** 2026-04-20 — Added scope-boundary cross-reference to media-embeds.md (ENG-153)

> **Scope: file hosting only.** External video embeds (YouTube, Vimeo, Loom) bypass storage entirely — they are rendered via a separate `videoEmbed` content block with click-to-load iframes. See [media-embeds.md](media-embeds.md).

## 12.1 Architecture

All uploaded files (images, PDFs, documents) are stored in **Supabase Storage** via the `@payloadcms/storage-s3` adapter. Supabase Storage exposes an S3-compatible API, so the adapter connects with `forcePathStyle: true`.

| Layer | Service | What it stores |
|-------|---------|---------------|
| **Structured data** | Supabase Postgres (`DATABASE_URL`) | CMS records, file metadata (filename, dimensions, alt text, MIME type) |
| **Binary files** | Supabase Storage (`S3_ENDPOINT`) | Actual images, PDFs, and documents |
| **CDN** | Cloudflare (via Supabase) | Public file delivery with caching |

## 12.2 Configuration

The S3 adapter is configured in `src/payload.config.ts` as a plugin. **The `media` collection MUST bypass Payload's access-control proxy AND use a custom URL generator** — see §12.3.11 for the reasoning:

```ts
s3Storage({
  collections: {
    media: {
      disablePayloadAccessControl: true,
      generateFileURL: ({ filename, prefix }) => {
        const bucket = process.env.S3_BUCKET || 'media'
        const publicBase = (process.env.S3_ENDPOINT || '').replace(
          '/storage/v1/s3',
          '/storage/v1/object/public',
        )
        return [publicBase, bucket, prefix, filename]
          .filter(Boolean)
          .join('/')
          .replace(/([^:])\/\/+/g, '$1/')
      },
    },
  },
  bucket: process.env.S3_BUCKET || 'media',
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  },
})
```

**NEVER** replace the collection object with the shorthand `collections: { media: true }`. The shorthand wires every read through Payload's `/api/media/file/*` proxy, which breaks video playback (no Range support, no CDN) and silently 404s for records where the filename lookup misses. See ENG-160.

Required environment variables (in `.env`):

| Variable | Source |
|----------|--------|
| `S3_ENDPOINT` | Supabase Dashboard → Settings → Storage → S3 Connection |
| `S3_BUCKET` | Name of the storage bucket (currently `media`) |
| `S3_REGION` | Supabase project region (currently `us-east-1`) |
| `S3_ACCESS_KEY_ID` | Supabase Dashboard → Settings → Storage → S3 Connection |
| `S3_SECRET_ACCESS_KEY` | Supabase Dashboard → Settings → Storage → S3 Connection |

## 12.3 Rules

1. **No local `media/` directory in production.** The S3 adapter disables local storage. Files go directly to Supabase Storage.
2. **Supabase bucket must be set to Public** for images to be served via CDN URLs.
3. **MIME types:** The Media collection accepts `image/*`, `video/*`, and `application/pdf`. To add new file types, update `mimeTypes` in `src/collections/Media.ts`.
4. **Image sizes:** Payload auto-generates three variants via `sharp`: thumbnail (400x300), card (768x512), hero (1920w). These are stored alongside the original in Supabase Storage. The frontend uses `sizes.card.url` for homepage covers and `sizes.hero.url` for case study heroes. **Video uploads have no derived sizes** - always guard on `mimeType` before accessing `sizes.*`. (ENG-135)
5. **Video playback is per-asset, not per-block.** The `Media` collection has two conditional fields visible only when `mimeType` starts with `video/`:
   - `playbackMode: 'loop' | 'player'` (default `loop`) — `loop` renders `<video autoPlay muted loop playsInline>` for short UI clips; `player` renders `<video controls preload="metadata">` for narrative walkthroughs. `MediaRenderer` branches on this field.
   - `poster` (upload to `media`, filtered to images only) — optional still frame shown before playback. When absent, `preload="metadata"` handles first-frame display.

   Because `poster` is a nested Media relationship (`project -> content[].image -> poster -> url`), any fetch that needs poster URLs must use `depth: 3` or higher. The case-study fetch in `src/app/(frontend)/(site)/work/[slug]/page.tsx` is already bumped to `depth: 3`. Any new fetch paths that render posters must follow the same rule.
6. **GIF animation is preserved automatically.** `MediaRenderer` treats `mimeType === 'image/gif'` as `unoptimized` so `next/image` does not strip animation. MP4/WebM is still preferred for clips over ~2MB or ~3s, but GIFs are accepted as-is.
7. **No server-side video transcoding.** There is no ffmpeg step. Uploaders are responsible for compressing to MP4/WebM before upload. The inline upload UI shows a soft warning above 50MB; hard limits are not enforced today.
8. **When adding a new collection with uploads**, add it to the `s3Storage` plugin's `collections` map.
9. **Filenames are sanitized before upload.** Supabase Storage's S3 API rejects object keys with square brackets, curly braces, and certain special characters. A `beforeChange` hook on the Media collection strips brackets, replaces spaces and special chars with hyphens, and collapses consecutive hyphens. This runs before the cloud storage plugin's `afterChange` hook, which reads `data.filename` for the S3 key. (ENG-060)
10. **Every field must have `label`, `admin.description`, and `admin.placeholder`.** Bare fields with technical names ("alt", "caption") are incomprehensible to non-technical users. Every Payload field on an upload collection must include a human-readable label, a one-sentence description, and a placeholder example. The collection itself must include `admin.description` explaining the upload process and automatic transformations. (ENG-061)
11. **Serve uploads directly from Supabase, never through Payload's `/api/media/file/*` proxy.** In `s3Storage(...).collections`, the `media` entry must be an **object** with both `disablePayloadAccessControl: true` and a custom `generateFileURL` that rewrites the S3 endpoint (`/storage/v1/s3`) to the public endpoint (`/storage/v1/object/public`). This is required because:
    - Payload's static handler streams binaries through the Node server without reliable HTTP Range support. Videos over ~5MB stall or restart on every seek and never satisfy a second playback from CDN cache.
    - The default plugin URL generator (when only `disablePayloadAccessControl: true` is set) builds `<endpoint>/<bucket>/<filename>`, which for Supabase resolves to the authenticated S3 API path, not the public CDN path. Anonymous reads return 400.
    - Every Supabase bucket rule (`public: true`) is predicated on clients hitting `/storage/v1/object/public/<bucket>/<filename>` directly.

    The `getAfterReadHook` in `@payloadcms/plugin-cloud-storage/dist/hooks/afterRead.js` recomputes `url` on every read from `filename`, so existing records pick up the new URL pattern without any DB migration. Verify after editing `payload.config.ts`:

    ```bash
    curl -s "http://localhost:4000/api/media?limit=3&depth=0" | grep -oE '"url":"[^"]*"'
    # every url must begin with https://<project-ref>.supabase.co/storage/v1/object/public/
    ```

    Detection: `rg '/api/media/file/' src/` in rendered pages (not in source code or proxy allowlists) must return zero results. A `curl -sI` of any video src in production HTML must include `accept-ranges: bytes`. (ENG-160, EAP-098)

## 12.4 Public URL Pattern

Files uploaded to the `media` bucket are publicly accessible at:
```
https://<project-ref>.supabase.co/storage/v1/object/public/media/<filename>
```

## 12.5 Frontend Asset Preloading

The site uses a progressive preloading pipeline (`src/lib/preload-manager.ts`) that downloads assets before the user needs them. The pipeline follows the visitor's navigation path:

| Level | Page | What loads | Mechanism |
|-------|------|-----------|-----------|
| 0 | Login (`/for/[company]`) | Cursor thumbnails (400x300) | `<link rel="preload">` tags in server-rendered HTML |
| 1 | Homepage | Case study hero images | `PreloadManager.seedManifest()` on hydration |
| 2 | Homepage (background) | All remaining content images per case study, in display order | Same as above, queued as Tier 2 |
| Bump | Case study page | All assets for the current case study | `PreloadManager.bump(slug)` promotes to Tier 0 |

**Two-layer caching model:**

1. **PreloadManager session cache** (JS memory, `Set<string>`) — dedup tracker that prevents redundant `new Image()` / `fetch()` calls during a single client-side session. Resets on page refresh. This is intentional — see ENG-115 rationale.
2. **Browser HTTP cache** (disk) — stores actual bytes, governed by CDN `Cache-Control` headers. Survives soft refresh. This is the real persistence layer.

**Key files:**
- `src/lib/preload-manager.ts` — module-level singleton (priority queue, session cache, bump API)
- `src/lib/extract-content-urls.ts` — `AssetEntry`, `AssetManifest` types, URL extraction from Payload content blocks
- `src/lib/resolve-thumbnail-url.ts` — cursor thumbnail URL resolver
- `src/lib/project-filters.ts` — shared `HIDDEN_FROM_HOME` set and `isVisibleOnHome()` predicate

**Asset type awareness:** Images load via `new Image()` (triggers browser cache). Videos load via `fetch()` with the body consumed and discarded (pulls into HTTP cache without creating a DOM element). The `kind` field on each `AssetEntry` determines the strategy.

**Concurrency:** Tier 0-1 (thumbnails, heroes): 3 concurrent. Tier 2 (content images): 1 at a time to yield to the user's active browsing.

## 12.6 Verification

After uploading a file via the Payload admin panel or API:
```bash
# Check the file exists in Supabase Storage
curl -sI "https://lrjliluvnkciwnyshexq.supabase.co/storage/v1/object/public/media/<filename>"

# Verify no local file was created
ls media/<filename>  # should return "No such file or directory"
```
