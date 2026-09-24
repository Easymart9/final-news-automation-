export type VerificationStatus = 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';

export interface SourceReference {
  id: string;
  sourceName: string;
  sourceUrl: string;
  claim: string;
  verified: boolean;
  publishedDate?: string;
}

export interface VerificationLog {
  id: string;
  articleId: string;
  claim: string;
  status: VerificationStatus;
  score: number; // 0 to 100
  sourcesChecked: number;
  matchingSources: number;
  hallucinationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
  checkedAt: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  avatar: string;
  bio: string;
  credentials: string[];
  verifiedCount: number;
  twitter?: string;
  linkedin?: string;
}

export interface TopicCluster {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  searchDemand: 'VERY HIGH' | 'HIGH' | 'TRENDING';
  articleCount: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  metaDescription: string;
  category: string;
  topicSlug: string;
  trustScore: number; // 0 to 100
  verificationStatus: VerificationStatus;
  featuredImage: string;
  imageCaption: string;
  author: Author;
  sources: SourceReference[];
  verificationLog?: VerificationLog;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  views: number;
  isFeatured: boolean;
  keywords: string[];
  faq: Array<{ question: string; answer: string }>;
}

export interface AutomationLog {
  id: string;
  taskName: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'RUNNING';
  durationMs: number;
  details: string;
  timestamp: string;
}

export interface SystemStats {
  totalArticles: number;
  verifiedArticles: number;
  needsReviewArticles: number;
  avgTrustScore: number;
  dailyAutomations: number;
  totalViews: number;
  lastRunTimestamp: string;
  groqApiStatus: 'CONNECTED' | 'FALLBACK_ACTIVE';
}
