type LexicalNode = {
  type?: string;
  text?: string;
  format?: number | string;
  root?: LexicalNode;
  children?: LexicalNode[];
  [key: string]: unknown;
};

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;

/**
 * Handles the case where Lexical JSON was stored as a serialized string
 * (e.g. textarea field received an object and stringified it).
 */
function ensureParsed(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }
  }
  return value;
}

export function lexicalToHtml(value: unknown): string {
  if (!value) return '';

  const parsed = ensureParsed(value);
  if (typeof parsed === 'string') return parsed;
  if (typeof parsed !== 'object') return '';

  const node = parsed as LexicalNode;

  if (node.type === 'text') {
    let html = escapeHtml(node.text || '');
    const fmt = (typeof node.format === 'number' ? node.format : 0);
    if (fmt & FORMAT_BOLD) html = `<strong>${html}</strong>`;
    if (fmt & FORMAT_ITALIC) html = `<em>${html}</em>`;
    if (fmt & FORMAT_UNDERLINE) html = `<u>${html}</u>`;
    if (fmt & FORMAT_STRIKETHROUGH) html = `<s>${html}</s>`;
    return html;
  }

  if (node.root) return lexicalToHtml(node.root);

  if (Array.isArray(node.children)) {
    return node.children.map((child) => lexicalToHtml(child)).join('');
  }

  return '';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function makeLexicalParagraph(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          children: [
            {
              mode: 'normal' as const,
              text,
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: 'ltr' as const,
    },
  };
}

export function extractLexicalText(value: unknown): string {
  if (!value) return '';

  const parsed = ensureParsed(value);
  if (typeof parsed === 'string') return parsed;
  if (typeof parsed !== 'object') return '';

  const node = parsed as LexicalNode;

  if (node.text && typeof node.text === 'string') return node.text;
  if (node.root) return extractLexicalText(node.root);
  if (Array.isArray(node.children)) {
    return node.children
      .map((child) => extractLexicalText(child))
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  return '';
}
