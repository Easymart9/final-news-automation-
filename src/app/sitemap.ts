import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import type { Author } from '@/types';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://worldbulletin.world';
  
  // Fetch all articles without limits to ensure full indexing
  const articles = db.getArticles(undefined, undefined, true);
  const topics = db.getTopics();
  const authors = db.getAuthors ? db.getAuthors() : [];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/editorial-standards`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/affiliate-disclosure`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const topicRoutes: MetadataRoute.Sitemap = topics.flatMap((topic) => {
    const latestArticle = articles.find(article => article.topicSlug === topic.slug);
    return latestArticle ? [{
      url: `${baseUrl}/topics/${topic.slug}`,
      lastModified: new Date(latestArticle.updatedAt || latestArticle.publishedAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }] : [];
  });

  const authorRoutes: MetadataRoute.Sitemap = authors
    .map((author: Author) => ({
      author,
      latestArticle: articles.find(article => article.author.slug === author.slug)
    }))
    .filter((entry): entry is { author: Author; latestArticle: NonNullable<typeof entry.latestArticle> } => Boolean(entry.latestArticle))
    .map(({ author, latestArticle }) => ({
      url: `${baseUrl}/authors/${author.slug}`,
      lastModified: new Date(latestArticle.updatedAt || latestArticle.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/news/${a.slug}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Combine all routes into a single sitemap array
  return [...staticRoutes, ...topicRoutes, ...authorRoutes, ...articleRoutes];
}
