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
  placeholderLabels?: string[];
  placeholderLabel?: string;
};

export type AssetEntry = { url: string; kind: "image" | "video" };

export type AssetManifest = {
  slug: string;
  hero?: AssetEntry;
  content: AssetEntry[];
}[];

type MediaObject = {
  url?: string;
  mimeType?: string;
  sizes?: {
    card?: { url?: string };
    hero?: { url?: string };
  };
};

function resolveMediaEntry(media: unknown): AssetEntry | null {
  if (!media || typeof media !== "object") return null;
  const m = media as MediaObject;
  const isVideo = m.mimeType?.startsWith("video/");
  const kind: AssetEntry["kind"] = isVideo ? "video" : "image";

  if (isVideo) {
    return m.url ? { url: m.url, kind } : null;
  }

  const derivedUrl = m.sizes?.card?.url ?? m.sizes?.hero?.url;
  const url = derivedUrl ?? m.url;
  return url ? { url, kind } : null;
}

function resolveHeroMediaEntry(media: unknown): AssetEntry | null {
  if (!media || typeof media !== "object") return null;
  const m = media as MediaObject;
  const isVideo = m.mimeType?.startsWith("video/");
  const kind: AssetEntry["kind"] = isVideo ? "video" : "image";

  if (isVideo) {
    return m.url ? { url: m.url, kind } : null;
  }

  const url = m.sizes?.hero?.url ?? m.url;
  return url ? { url, kind } : null;
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
  }

  return { hero, content };
}
