// LinkedIn Data Types
export interface LinkedInPost {
  id: string;
  url: string;
  authorName: string;
  authorUrl: string;
  authorHeadline: string;
  content: string;
  publishedAt: string;
  mediaUrls: string[];
  metrics: PostMetrics;
  interactions: Interaction[];
}

export interface PostMetrics {
  likes: number;
  comments: number;
  reposts: number;
  views?: number;
}

export interface Interaction {
  type: 'like' | 'comment' | 'repost';
  userUrl: string;
  userName: string;
  userHeadline: string;
  userProfilePicture?: string;
  timestamp?: string;
  commentText?: string; // Only for comments
}

export interface UserProfile {
  url: string;
  name: string;
  headline: string;
  location?: string;
  company?: string;
  profilePicture?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PostsResponse {
  posts: LinkedInPost[];
  totalPosts: number;
  scrapedAt: string;
  profileUrl: string;
}

// Webhook Types
export interface WebhookSubscription {
  url: string;
  events: WebhookEvent[];
  createdAt: string;
}

export type WebhookEvent = 'new_post' | 'new_interaction';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: LinkedInPost | Interaction;
}

// Config Types
export interface ScraperConfig {
  targetProfileUrl: string;
  maxPosts: number;
  headless: boolean;
  timeout: number;
  loginEmail?: string;
  loginPassword?: string;
}
