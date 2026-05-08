export type EmbedProvider = "youtube" | "vimeo" | "loom";

export interface ParsedEmbed {
  provider: EmbedProvider;
  id: string;
  embedUrl: string;
  autoplayUrl: string;
  autoThumbnailUrl: string | null;
  isVertical: boolean;
  startSeconds?: number;
}

const YT_HOSTS = /^(?:www\.|m\.|music\.)?youtube(?:-nocookie)?\.com$/i;
const YT_SHORT_HOST = /^youtu\.be$/i;
const VIMEO_HOST = /^(?:www\.)?vimeo\.com$/i;
const VIMEO_PLAYER_HOST = /^player\.vimeo\.com$/i;
const LOOM_HOST = /^(?:www\.)?loom\.com$/i;

const YT_ID = /^[a-zA-Z0-9_-]{6,20}$/;
const DIGITS = /^\d+$/;
const VIMEO_HASH = /^[a-zA-Z0-9]+$/;
const LOOM_ID = /^[a-zA-Z0-9]+$/;

function parseStartSeconds(raw: string | null): number | undefined {
  if (!raw) return undefined;
  if (DIGITS.test(raw)) {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  if (!match) return undefined;
  const [, h, m, s] = match;
  const total = (h ? Number(h) * 3600 : 0) + (m ? Number(m) * 60 : 0) + (s ? Number(s) : 0);
  return total > 0 ? total : undefined;
}

function safeUrl(input: string): URL | null {
  try {
    const trimmed = input.trim();
    if (!trimmed) return null;
    return new URL(trimmed);
  } catch {
    return null;
  }
}

function parseYouTube(url: URL): ParsedEmbed | null {
  let id: string | null = null;
  let isVertical = false;

  if (YT_SHORT_HOST.test(url.hostname)) {
    id = url.pathname.slice(1).split("/")[0] || null;
  } else if (YT_HOSTS.test(url.hostname)) {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "watch") {
      id = url.searchParams.get("v");
    } else if (segments[0] === "embed" && segments[1]) {
      id = segments[1];
    } else if (segments[0] === "shorts" && segments[1]) {
      id = segments[1];
      isVertical = true;
    } else if (segments[0] === "v" && segments[1]) {
      id = segments[1];
    }
  }

  if (!id || !YT_ID.test(id)) return null;

  const startSeconds = parseStartSeconds(url.searchParams.get("t") ?? url.searchParams.get("start"));

  const params = new URLSearchParams();
  params.set("rel", "0");
  params.set("modestbranding", "1");
  if (startSeconds) params.set("start", String(startSeconds));

  const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
  const autoplayParams = new URLSearchParams(params);
  autoplayParams.set("autoplay", "1");
  const autoplayUrl = `https://www.youtube-nocookie.com/embed/${id}?${autoplayParams.toString()}`;

  return {
    provider: "youtube",
    id,
    embedUrl,
    autoplayUrl,
    autoThumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    isVertical,
    ...(startSeconds ? { startSeconds } : {}),
  };
}

function parseVimeo(url: URL): ParsedEmbed | null {
  let id: string | null = null;
  let hash: string | null = null;

  if (VIMEO_HOST.test(url.hostname)) {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] && DIGITS.test(segments[0])) {
      id = segments[0];
      if (segments[1] && VIMEO_HASH.test(segments[1])) hash = segments[1];
    }
  } else if (VIMEO_PLAYER_HOST.test(url.hostname)) {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "video" && segments[1] && DIGITS.test(segments[1])) {
      id = segments[1];
      const h = url.searchParams.get("h");
      if (h && VIMEO_HASH.test(h)) hash = h;
    }
  }

  if (!id) return null;

  const params = new URLSearchParams();
  params.set("dnt", "1");
  params.set("title", "0");
  params.set("byline", "0");
  params.set("portrait", "0");
  if (hash) params.set("h", hash);

  const embedUrl = `https://player.vimeo.com/video/${id}?${params.toString()}`;
  const autoplayParams = new URLSearchParams(params);
  autoplayParams.set("autoplay", "1");
  const autoplayUrl = `https://player.vimeo.com/video/${id}?${autoplayParams.toString()}`;

  return {
    provider: "vimeo",
    id,
    embedUrl,
    autoplayUrl,
    autoThumbnailUrl: null,
    isVertical: false,
  };
}

function parseLoom(url: URL): ParsedEmbed | null {
  if (!LOOM_HOST.test(url.hostname)) return null;
  const segments = url.pathname.split("/").filter(Boolean);
  if ((segments[0] !== "share" && segments[0] !== "embed") || !segments[1]) return null;
  const id = segments[1];
  if (!LOOM_ID.test(id)) return null;

  const embedUrl = `https://www.loom.com/embed/${id}`;
  const autoplayUrl = `https://www.loom.com/embed/${id}?autoplay=1`;

  return {
    provider: "loom",
    id,
    embedUrl,
    autoplayUrl,
    autoThumbnailUrl: null,
    isVertical: false,
  };
}

export function parseVideoEmbedUrl(input: string): ParsedEmbed | null {
  if (typeof input !== "string") return null;
  const url = safeUrl(input);
  if (!url) return null;

  if (YT_HOSTS.test(url.hostname) || YT_SHORT_HOST.test(url.hostname)) {
    return parseYouTube(url);
  }
  if (VIMEO_HOST.test(url.hostname) || VIMEO_PLAYER_HOST.test(url.hostname)) {
    return parseVimeo(url);
  }
  if (LOOM_HOST.test(url.hostname)) {
    return parseLoom(url);
  }
  return null;
}
