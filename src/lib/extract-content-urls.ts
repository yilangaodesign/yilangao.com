export type RawBlock = {
  id?: string;
  blockType: string;
  text?: string;
  level?: string;
  body?: unknown;
  layout?: string | null;
  images?: { image: unknown; caption?: string | null }[];
  caption?: string | null;
  image?: unknown;
  alt?: string | null;
  rowBreak?: boolean | null;
  widthFraction?: number | null;
  placeholderLabels?: string[];
  placeholderLabel?: string;
  url?: string;
  poster?: { url?: string } | null;
};

export type AssetEntry = {
  url: string;
  kind: "image" | "video";
  playbackMode?: "loop" | "player";
  posterUrl?: string;
};

export type AssetManifest = {
  slug: string;
  hero?: AssetEntry;
  content: AssetEntry[];
}[];

type MediaObject = {
  url?: string;
  mimeType?: string;
  playbackMode?: "loop" | "player" | null;
  poster?: { url?: string } | null;
};

// Always resolve to the original upload URL. Next.js Image's optimizer
// generates the responsive srcset from whatever source it's given, so
// preloading a pre-shrunk Payload derivative (`card` at 768×512, `hero`
// at 1920) forces the optimizer to upscale on Retina/wide screens. See
// ENG-163.
function resolveMediaEntry(media: unknown): AssetEntry | null {
  if (!media || typeof media !== "object") return null;
  const m = media as MediaObject;
  const isVideo = m.mimeType?.startsWith("video/");
  const kind: AssetEntry["kind"] = isVideo ? "video" : "image";
  const playbackMode = m.playbackMode ?? undefined;
  const posterUrl = m.poster?.url ?? undefined;

  if (!m.url) return null;

  if (isVideo) {
    return {
      url: m.url,
      kind,
      ...(playbackMode ? { playbackMode } : {}),
      ...(posterUrl ? { posterUrl } : {}),
    };
  }

  return { url: m.url, kind };
}

function resolveHeroMediaEntry(media: unknown): AssetEntry | null {
  return resolveMediaEntry(media);
}

export function extractContentUrls(
  rawBlocks: RawBlock[],
): { hero?: AssetEntry; content: AssetEntry[] } {
  let hero: AssetEntry | undefined;
  const content: AssetEntry[] = [];

  for (const block of rawBlocks) {
    if (block.blockType === "hero" && !hero) {
      const entry = resolveHeroMediaEntry(block.image);
      if (entry) hero = entry;
    }

    if (block.blockType === "imageGroup" && block.images) {
      for (const img of block.images) {
        const entry = resolveMediaEntry(img.image);
        if (entry) content.push(entry);
      }
    }

    if (block.blockType === "image" && block.image) {
      const entry = resolveMediaEntry(block.image);
      if (entry) content.push(entry);
    }
  }

  return { hero, content };
}
