import type { AssetEntry } from "./extract-content-urls";

export function resolveThumbnailUrl(
  thumb: {
    url?: string;
    mimeType?: string;
    sizes?: { thumbnail?: { url?: string } };
  } | null,
): AssetEntry | null {
  if (!thumb || typeof thumb !== "object") return null;

  const isVideo = thumb.mimeType?.startsWith("video/");
  const kind: AssetEntry["kind"] = isVideo ? "video" : "image";

  if (isVideo) {
    return thumb.url ? { url: thumb.url, kind } : null;
  }

  const url = thumb.sizes?.thumbnail?.url ?? thumb.url;
  return url ? { url, kind } : null;
}
