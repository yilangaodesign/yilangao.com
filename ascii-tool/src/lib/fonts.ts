const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=IBM+Plex+Mono:wght@400;700&family=Fira+Code:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Space+Mono:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap";

let loaded = false;

export function loadMonoFonts(): void {
  if (loaded || typeof document === "undefined") return;
  loaded = true;

  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "";
  document.head.appendChild(preconnect2);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONT_URL;
  document.head.appendChild(link);
}

export const FONT_OPTIONS = [
  { label: "Geist Mono", value: '"Geist Mono", monospace', googleFont: "Geist+Mono" },
  { label: "Monospace", value: "monospace" },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Consolas", value: "Consolas, monospace" },
  { label: "IBM Plex Mono", value: '"IBM Plex Mono", monospace', googleFont: "IBM+Plex+Mono" },
  { label: "Fira Code", value: '"Fira Code", monospace', googleFont: "Fira+Code" },
  { label: "JetBrains Mono", value: '"JetBrains Mono", monospace', googleFont: "JetBrains+Mono" },
  { label: "Space Mono", value: '"Space Mono", monospace', googleFont: "Space+Mono" },
  { label: "Roboto Mono", value: '"Roboto Mono", monospace', googleFont: "Roboto+Mono" },
  { label: "Geist Sans", value: '"Geist", sans-serif', googleFont: "Geist" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
] as const;

const loadedGoogleFonts = new Set<string>();

export function loadGoogleFont(fontId: string) {
  if (loadedGoogleFonts.has(fontId)) return;
  loadedGoogleFonts.add(fontId);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontId}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}
