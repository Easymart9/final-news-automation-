import sanitizeHtml from 'sanitize-html';

export function sanitizeArticleContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'blockquote', 'br'
    ],
    allowedAttributes: {
      a: ['href', 'rel']
    },
    allowedSchemes: ['http', 'https'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
    }
  });
}