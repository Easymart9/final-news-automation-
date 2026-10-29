import fs from 'fs';
import path from 'path';
import { Article, Author, TopicCluster, VerificationLog, AutomationLog, SystemStats } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface ExtendedSystemStats extends SystemStats {
  adminPassword?: string;
  lastCronRunTimestamp?: string;
  cronScheduleEnabled?: boolean;
}

interface DatabaseSchema {
  articles: Article[];
  authors: Author[];
  topics: TopicCluster[];
  verificationLogs: VerificationLog[];
  automationLogs: AutomationLog[];
  stats: ExtendedSystemStats;
}

const DEFAULT_AUTHORS: Author[] = [
  {
    id: 'auth-1',
    name: 'World Bulletin Editorial Desk (AI-assisted)',
    slug: 'editorial-desk',
    role: 'Automated editorial system',
    avatar: '',
    bio: 'This system byline does not represent an individual human author. Articles require independent editorial review before being described as human-verified.',
    credentials: [],
    verifiedCount: 0,
  },
  {
    id: 'auth-2',
    name: 'World Bulletin Technology Desk (AI-assisted)',
    slug: 'technology-desk',
    role: 'Automated editorial system',
    avatar: '',
    bio: 'This system byline does not represent an individual human author. Articles require independent editorial review before being described as human-verified.',
    credentials: [],
    verifiedCount: 0,
  }
];

const DEFAULT_TOPICS: TopicCluster[] = [
  {
    id: 'topic-llm',
    name: 'LLMs & Foundation Models',
    slug: 'llm-foundation-models',
    description: 'Breakthroughs in large language models, reasoning architectures, context windows, and multimodal AI systems.',
    iconName: 'Cpu',
    searchDemand: 'VERY HIGH',
    articleCount: 0
  },
  {
    id: 'topic-agents',
    name: 'Autonomous AI Agents',
    slug: 'autonomous-ai-agents',
    description: 'Self-improving AI workflows, agentic coding tools, tool use, and multi-agent coordination frameworks.',
    iconName: 'Bot',
    searchDemand: 'VERY HIGH',
    articleCount: 0
  },
  {
    id: 'topic-silicon',
    name: 'AI Chips & Infrastructure',
    slug: 'ai-chips-infrastructure',
    description: 'NVIDIA, AMD, custom ASICs, quantum compute, and next-generation datacenter power systems.',
    iconName: 'Zap',
    searchDemand: 'HIGH',
    articleCount: 0
  },
  {
    id: 'topic-ethics',
    name: 'AI Safety & Governance',
    slug: 'ai-safety-governance',
    description: 'Global regulations, copyright policy, alignment research, and enterprise compliance standards.',
    iconName: 'ShieldCheck',
    searchDemand: 'HIGH',
    articleCount: 0
  },
  {
    id: 'topic-vision',
    name: 'Computer Vision & Robotics',
    slug: 'computer-vision-robotics',
    description: 'Humanoid robotics, spatial intelligence, video generation models, and autonomous transport.',
    iconName: 'Eye',
    searchDemand: 'TRENDING',
    articleCount: 0
  }
];

const now = new Date();
const todayIso = now.toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

const DEFAULT_ARTICLES: Article[] = [];
const DEFAULT_VERIFICATION_LOGS: VerificationLog[] = [];
const DEFAULT_AUTOMATION_LOGS: AutomationLog[] = [];

function ensureDbExists(): DatabaseSchema {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      articles: DEFAULT_ARTICLES,
      authors: DEFAULT_AUTHORS,
      topics: DEFAULT_TOPICS,
      verificationLogs: DEFAULT_VERIFICATION_LOGS,
      automationLogs: DEFAULT_AUTOMATION_LOGS,
      stats: {
        totalArticles: DEFAULT_ARTICLES.length,
        verifiedArticles: DEFAULT_ARTICLES.filter(a => a.verificationStatus === 'VERIFIED').length,
        needsReviewArticles: 0,
        avgTrustScore: 0,
        dailyAutomations: 0,
        totalViews: 0,
        lastRunTimestamp: '',
        groqApiStatus: process.env.GROQ_API_KEY ? 'CONNECTED' : 'NOT_CONFIGURED',
        adminPassword: process.env.ADMIN_PASSWORD || '',
        cronScheduleEnabled: false
      }
    };
    writeDb(initialData);
    return initialData;
  }

  const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
  const parsed = JSON.parse(fileContent) as DatabaseSchema;
  if (!parsed || !Array.isArray(parsed.articles)) {
    throw new Error('Article database has an invalid schema; refusing to overwrite it.');
  }
  let modified = false;

  if (!parsed.authors) {
    parsed.authors = DEFAULT_AUTHORS;
    modified = true;
  }
  if (!parsed.topics) {
    parsed.topics = DEFAULT_TOPICS;
    modified = true;
  }
  if (!parsed.verificationLogs) {
    parsed.verificationLogs = DEFAULT_VERIFICATION_LOGS;
    modified = true;
  }
  if (!parsed.automationLogs) {
    parsed.automationLogs = DEFAULT_AUTOMATION_LOGS;
    modified = true;
  }
  if (!parsed.stats) {
    parsed.stats = {
      totalArticles: parsed.articles.length,
      verifiedArticles: parsed.articles.filter(a => a.verificationStatus === 'VERIFIED').length,
      needsReviewArticles: 0,
      avgTrustScore: 0,
      dailyAutomations: 0,
      totalViews: 0,
      lastRunTimestamp: '',
      groqApiStatus: process.env.GROQ_API_KEY ? 'CONNECTED' : 'NOT_CONFIGURED',
      adminPassword: process.env.ADMIN_PASSWORD || '',
      cronScheduleEnabled: false
    };
    modified = true;
  }

  if (modified) {
    writeDb(parsed);
  }
  return parsed;
}

export function writeDb(data: DatabaseSchema): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}

export const db = {
  getArticles: (category?: string, topicSlug?: string, onlyVerified?: boolean): Article[] => {
    const data = ensureDbExists();
    let res = data.articles;
    if (onlyVerified) {
      const nowTime = Date.now();
      res = res.filter(a => a.verificationStatus === 'VERIFIED' && new Date(a.publishedAt).getTime() <= nowTime);
    }
    if (category) {
      res = res.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    if (topicSlug) {
      res = res.filter(a => a.topicSlug.toLowerCase() === topicSlug.toLowerCase());
    }
    return res.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  getArticleBySlug: (slug: string): Article | undefined => {
    const data = ensureDbExists();
    const targetSlug = decodeURIComponent(slug).toLowerCase();
    return data.articles.find(a => a.slug.toLowerCase() === targetSlug);
  },

  getPublishedArticleBySlug: (slug: string): Article | undefined => {
    const data = ensureDbExists();
    const targetSlug = decodeURIComponent(slug).toLowerCase();
    return data.articles.find(a => {
      const publishedAt = Date.parse(a.publishedAt);
      return a.slug.toLowerCase() === targetSlug &&
        a.verificationStatus === 'VERIFIED' &&
        Number.isFinite(publishedAt) &&
        publishedAt <= Date.now();
    });
  },

  getArticleById: (id: string): Article | undefined => {
    const data = ensureDbExists();
    return data.articles.find(a => a.id === id);
  },

  saveArticle: (article: Article): void => {
    const data = ensureDbExists();
    const existingIndex = data.articles.findIndex(a => a.id === article.id || a.slug === article.slug);
    if (existingIndex >= 0) {
      data.articles[existingIndex] = article;
    } else {
      data.articles.unshift(article);
    }
    data.stats.totalArticles = data.articles.length;
    data.stats.verifiedArticles = data.articles.filter(a => a.verificationStatus === 'VERIFIED').length;
    data.stats.needsReviewArticles = data.articles.filter(a => a.verificationStatus === 'NEEDS_REVIEW').length;
    writeDb(data);
  },

  deleteArticle: (id: string): void => {
    const data = ensureDbExists();
    data.articles = data.articles.filter(a => a.id !== id);
    data.stats.totalArticles = data.articles.length;
    data.stats.verifiedArticles = data.articles.filter(a => a.verificationStatus === 'VERIFIED').length;
    data.stats.needsReviewArticles = data.articles.filter(a => a.verificationStatus === 'NEEDS_REVIEW').length;
    writeDb(data);
  },

  getAuthors: (): Author[] => {
    return ensureDbExists().authors;
  },

  getAuthorBySlug: (slug: string): Author | undefined => {
    const data = ensureDbExists();
    const targetSlug = decodeURIComponent(slug).toLowerCase();
    return data.authors.find(a => a.slug.toLowerCase() === targetSlug);
  },

  getTopics: (): TopicCluster[] => {
    const data = ensureDbExists();
    const articles = data.articles.filter(a => a.verificationStatus === 'VERIFIED');
    return data.topics.map(t => {
      const count = articles.filter(a => a.topicSlug.toLowerCase() === t.slug.toLowerCase()).length;
      return {
        ...t,
        articleCount: count
      };
    });
  },

  getTopicBySlug: (slug: string): TopicCluster | undefined => {
    const data = ensureDbExists();
    const targetSlug = decodeURIComponent(slug).toLowerCase();
    return data.topics.find(t => t.slug.toLowerCase() === targetSlug);
  },

  getVerificationLogs: (): VerificationLog[] => {
    return ensureDbExists().verificationLogs;
  },

  addVerificationLog: (log: VerificationLog): void => {
    const data = ensureDbExists();
    data.verificationLogs.unshift(log);
    writeDb(data);
  },

  getAutomationLogs: (): AutomationLog[] => {
    return ensureDbExists().automationLogs;
  },

  addAutomationLog: (log: AutomationLog): void => {
    const data = ensureDbExists();
    data.automationLogs.unshift(log);
    writeDb(data);
  },

  getStats: (): ExtendedSystemStats => {
    return ensureDbExists().stats;
  },

  updateAdminPassword: (newPassword: string): void => {
    const data = ensureDbExists();
    data.stats.adminPassword = newPassword;
    writeDb(data);
  },

  updateCronRunTimestamp: (): void => {
    const data = ensureDbExists();
    data.stats.lastCronRunTimestamp = new Date().toISOString();
    writeDb(data);
  }
};
