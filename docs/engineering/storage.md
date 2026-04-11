# Media & File Storage (Supabase Storage)

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Source:** Session 2026-03-30, ENG-053 — "How do I store assets? Where are thumbnails and resumes stored?"
**Updated:** 2026-04-11 — Added §12.5 (Frontend Asset Preloading, ENG-115)

## 12.1 Architecture

All uploaded files (images, PDFs, documents) are stored in **Supabase Storage** via the `@payloadcms/storage-s3` adapter. Supabase Storage exposes an S3-compatible API, so the adapter connects with `forcePathStyle: true`.

| Layer | Service | What it stores |
|-------|---------|---------------|
| **Structured data** | Supabase Postgres (`DATABASE_URL`) | CMS records, file metadata (filename, dimensions, alt text, MIME type) |
| **Binary files** | Supabase Storage (`S3_ENDPOINT`) | Actual images, PDFs, and documents |
| **CDN** | Cloudflare (via Supabase) | Public file delivery with caching |

## 12.2 Configuration

The S3 adapter is configured in `src/payload.config.ts` as a plugin:

```ts
s3Storage({
  collections: { media: true },
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
3. **MIME types:** The Media collection accepts `image/*` and `application/pdf`. To add new file types, update `mimeTypes` in `src/collections/Media.ts`.
4. **Image sizes:** Payload auto-generates three variants via `sharp`: thumbnail (400x300), card (768x512), hero (1920w). These are stored alongside the original in Supabase Storage. The frontend uses `sizes.card.url` for homepage covers and `sizes.hero.url` for case study heroes. **Video uploads have no derived sizes** - always guard on `mimeType` before accessing `sizes.*`. (ENG-135)
5. **When adding a new collection with uploads**, add it to the `s3Storage` plugin's `collections` map.
6. **Filenames are sanitized before upload.** Supabase Storage's S3 API rejects object keys with square brackets, curly braces, and certain special characters. A `beforeChange` hook on the Media collection strips brackets, replaces spaces and special chars with hyphens, and collapses consecutive hyphens. This runs before the cloud storage plugin's `afterChange` hook, which reads `data.filename` for the S3 key. (ENG-060)
7. **Every field must have `label`, `admin.description`, and `admin.placeholder`.** Bare fields with technical names ("alt", "caption") are incomprehensible to non-technical users. Every Payload field on an upload collection must include a human-readable label, a one-sentence description, and a placeholder example. The collection itself must include `admin.description` explaining the upload process and automatic transformations. (ENG-061)

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
