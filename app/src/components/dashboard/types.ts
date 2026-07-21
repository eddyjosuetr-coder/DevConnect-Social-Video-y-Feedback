export type ActiveTab = 'feed' | 'explore' | 'notifications' | 'messages' | 'bookmarks' | 'profile' | 'admin';

export type Post = {
  id: number;
  content: string;
  code: string | null;
  codeLanguage: string | null;
  tags: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  createdAt: Date | string | null;
  authorId: number;
  authorName: string | null;
  authorAvatar: string | null;
  isLikedByMe?: boolean;
  isRepostedByMe?: boolean;
  isRepostEntry?: boolean;
  repostId?: number;
  repostCreatedAt?: Date | string | null;
  quoteText?: string | null;
  reposterId?: number;
  reposterName?: string | null;
  reposterAvatar?: string | null;
};

export type Comment = {
  id: number;
  content: string;
  createdAt: Date | string | null;
  authorId: number;
  authorName: string | null;
  authorAvatar: string | null;
};

export type TrendingTopic = {
  tag: string;
  category: string;
  posts: string;
};

export type SuggestedUser = {
  name: string;
  handle: string;
  role: string;
  img: string;
};

export const TRENDING_TOPICS: TrendingTopic[] = [
  { tag: 'react', category: 'Desarrollo', posts: '2.4K' },
  { tag: 'typescript', category: 'Tech', posts: '1.8K' },
  { tag: 'rust', category: 'Lenguajes', posts: '1.2K' },
  { tag: 'ai', category: 'Tendencia', posts: '5.1K' },
  { tag: 'opensource', category: 'Comunidad', posts: '890' },
];

export const SUGGESTED_USERS: SuggestedUser[] = [
  { name: 'Alejandro Marin', handle: '@alexmarin', role: 'Frontend Dev', img: '/images/profile1.jpg' },
  { name: 'Sofia Jimenez', handle: '@sofiaj', role: 'UI Engineer', img: '/images/profile2.jpg' },
  { name: 'Carlos Mendez', handle: '@cmendez', role: 'Backend Dev', img: '/images/profile5.jpg' },
  { name: 'Yuki Tanaka', handle: '@yukit', role: 'DevOps Lead', img: '/images/profile6.jpg' },
];
