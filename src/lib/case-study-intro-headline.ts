/**
 * Case study hook titles (`introBlurbHeadline`). Use **sentence style**: capitalize
 * like normal prose (sentence starts, proper nouns), not title case on every word.
 *
 * Home list sublines (`home-case-subline.ts`) use **title-style** caps per word instead.
 *
 * Sync into Payload via POST `api/update-{lacework|meteor|elan|etro}` (dev) so the CMS
 * matches; home and `/work/[slug]` read `introBlurbHeadline` from the database.
 */
export const INTRO_HEADLINE_BY_SLUG: Record<string, string> = {
  meteor: "I had to choose whom not to design for.",
  lacework: "I saved the page my own team gave up on.",
  "elan-design-system": "I built an agent's memory out of my own mistakes.",
  "etro-framework": "Your AI product doesn't need more transparency. It needs the right kind.",
}
