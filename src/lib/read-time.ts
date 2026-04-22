import type { ContentBlock } from "@/app/(frontend)/(site)/work/[slug]/ProjectClient";

const WORDS_PER_MINUTE = 225;

function countWords(text: string | undefined | null): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function wordsInBlock(block: ContentBlock): number {
  switch (block.blockType) {
    case "heading":
      return countWords(block.text);
    case "richText":
      return countWords(block.body);
    case "image":
      return countWords(block.caption) + countWords(block.alt);
    case "imageGroup": {
      const imageCaptions = (block.images ?? []).reduce(
        (sum, img) => sum + countWords(img.caption),
        0,
      );
      return imageCaptions + countWords(block.caption);
    }
    case "hero":
      return countWords(block.caption);
    case "videoEmbed":
      return countWords(block.caption);
    case "divider":
      return 0;
    default:
      return 0;
  }
}

/**
 * Hybrid read-time estimator for essay-format projects.
 *
 * Walks the already-mapped `ContentBlock[]` (so rich-text bodies are plain
 * strings from `extractLexicalText`) plus the intro-blurb plain text, counts
 * words, and divides by 225 wpm. Returns minimum 1 minute so essays never
 * render "0 min read."
 */
export function computeReadTime(
  blocks: ContentBlock[],
  introBlurbBodyPlain?: string,
  introBlurbHeadline?: string,
): number {
  const blockWords = blocks.reduce((sum, b) => sum + wordsInBlock(b), 0);
  const introWords = countWords(introBlurbBodyPlain) + countWords(introBlurbHeadline);
  const total = blockWords + introWords;
  if (total === 0) return 1;
  return Math.max(1, Math.ceil(total / WORDS_PER_MINUTE));
}
