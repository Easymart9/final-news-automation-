import { Article } from '@/types';

export function generateNewsArticleSchema(article: Article, baseUrl: string = 'https://worldbulletin.world') {
  const articleUrl = `${baseUrl}/news/${article.slug}`;
  const authorName = article.author?.name || 'World Bulletin Editorial Desk';
  const authorRole = article.author?.role || 'Staff Journalist';
  const authorSlug = article.author?.slug || 'editorial-desk';
  const keywordsList = Array.isArray(article.keywords) ? article.keywords.join(', ') : (article.keywords || 'AI News');
  const citationList = Array.isArray(article.sources) ? article.sources.map(s => s.sourceUrl).filter(Boolean) : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    'headline': article.title,
    'description': article.metaDescription || article.summary || '',
    'image': [article.featuredImage || `${baseUrl}/logo.png`],
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt || article.publishedAt,
    'author': {
      '@type': 'Person',
      'name': authorName,
      'jobTitle': authorRole,
      'url': `${baseUrl}/authors/${authorSlug}`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'World Bulletin',
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo.png`
      }
    },
    'keywords': keywordsList,
    'articleSection': article.category || 'Artificial Intelligence',
    'citation': citationList
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}
