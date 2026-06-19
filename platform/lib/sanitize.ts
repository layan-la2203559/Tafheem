import sanitizeHtml from "sanitize-html";

/**
 * Sanitize user-authored reflection HTML. This is the security trust boundary:
 * reflections are stored as HTML so users can format text (bold/italic/fonts/
 * colors), but we MUST strip anything dangerous (scripts, event handlers,
 * javascript: URLs, etc.) before storing — otherwise published reflections
 * would be an XSS vector for every reader.
 *
 * Whitelist only: basic block/inline formatting + a controlled set of inline
 * styles (font family/size, colors, alignment, weight/style/decoration).
 */
const HEX = /^#(0x)?[0-9a-f]+$/i;
const RGB = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
const SIZE = /^(x-small|small|medium|large|x-large|xx-large|\d+(\.\d+)?(px|em|rem|%|pt))$/;

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "div", "span",
    "b", "strong", "i", "em", "u", "s", "sub", "sup",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li", "blockquote", "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    "*": ["style"],
  },
  allowedStyles: {
    "*": {
      "font-family": [/^[\w\s,'"-]+$/],
      "font-size": [SIZE],
      color: [HEX, RGB],
      "background-color": [HEX, RGB],
      "text-align": [/^(left|right|center|justify)$/],
      "font-weight": [/^(normal|bold|bolder|lighter|[1-9]00)$/],
      "font-style": [/^(normal|italic)$/],
      "text-decoration": [/^(none|underline|line-through)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Force safe link behaviour.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
  },
};

export function sanitizeReflectionHtml(dirty: string): string {
  return sanitizeHtml(dirty, options).trim();
}

/** Plain-text version (tags stripped) — used for the keyword audit. */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
