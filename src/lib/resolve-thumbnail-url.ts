import type { AssetEntry } from "./extract-content-urls";

export function resolveThumbnailUrl(
  thumb: {
    url?: string;
    mimeType?: string;
    sizes?: { thumbnail?: { url?: string } };
    playbackMode?: "loop" | "player" | null;
    poster?: { url?: string } | null;
  } | null,
): AssetEntry | null {
  if (!thumb || typeof thumb !== "object") return null;

  const isVideo = thumb.mimeType?.startsWith("video/");
  const kind: AssetEntry["kind"] = isVideo ? "video" : "image";
  const playbackMode = thumb.playbackMode ?? undefined;
  const posterUrl = thumb.poster?.url ?? undefined;

  if (isVideo) {
    return thumb.url
      ? { url: thumb.url, kind, ...(playbackMode ? { playbackMode } : {}), ...(posterUrl ? { posterUrl } : {}) }
      : null;
  }

  const url = thumb.sizes?.thumbnail?.url ?? thumb.url;
  return url ? { url, kind } : null;
}
