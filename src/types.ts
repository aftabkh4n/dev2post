export interface TweetItem {
  tweetNumber: number;
  text: string;
}

export interface DevToIntro {
  articleTitle: string;
  hookParagraph: string;
  bodyParagraph: string;
  takeawayBullets: string[];
  tags: string[];
  estimatedReadTime: string;
}

export interface GeneratedContent {
  id: string;
  createdAt: number;
  inputSnippet: string;
  detectedLanguage: string;
  title: string;
  summary: string;
  twitterThread: TweetItem[];
  linkedinPost: string;
  devtoIntro: DevToIntro;
}

export type ContentTone = 'direct' | 'story' | 'deepdive' | 'punchy';
export type TargetAudience = 'developers' | 'senior' | 'beginners';

export interface SampleSnippet {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'systems' | 'readme';
  language: string;
  code: string;
}
