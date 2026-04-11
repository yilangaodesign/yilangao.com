export const HIDDEN_FROM_HOME = new Set(["ascii-studio", "illustrations"]);

export function isVisibleOnHome(doc: {
  slug: string;
  introBlurbHeadline?: string;
}): boolean {
  if (HIDDEN_FROM_HOME.has(doc.slug)) return false;
  return !!doc.introBlurbHeadline;
}
