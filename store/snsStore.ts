import { create } from 'zustand';
import { snsApi } from '../api/snsApi';
import type { Post, Comment } from '../types';

type FeedType = 'all' | 'following' | 'party';

interface SnsState {
  posts: Post[];
  feedType: FeedType;
  loading: boolean;
  locked: boolean; // 今日タスク未完了
  comments: Comment[];
  commentsLoading: boolean;
  setFeedType: (type: FeedType) => void;
  fetchFeed: () => Promise<void>;
  createPost: (text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
}

export const useSnsStore = create<SnsState>((set, get) => ({
  posts: [],
  feedType: 'all',
  loading: false,
  locked: true,
  comments: [],
  commentsLoading: false,

  setFeedType: (type) => {
    set({ feedType: type });
    get().fetchFeed();
  },

  fetchFeed: async () => {
    set({ loading: true });
    try {
      const posts = await snsApi.getFeed(get().feedType);
      set({ posts });
    } catch {
      // サーバー未起動時はスキップ
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (text) => {
    const post = await snsApi.createPost(text);
    set({ posts: [post, ...get().posts] });
  },

  deletePost: async (postId) => {
    await snsApi.deletePost(postId);
    set({ posts: get().posts.filter((p) => p.id !== postId) });
  },

  toggleLike: async (postId) => {
    const { liked, likesCount } = await snsApi.toggleLike(postId);
    set({
      posts: get().posts.map((p) =>
        p.id === postId ? { ...p, likedByMe: liked, likesCount } : p
      ),
    });
  },

  fetchComments: async (postId) => {
    set({ commentsLoading: true });
    try {
      const comments = await snsApi.getComments(postId);
      set({ comments });
    } finally {
      set({ commentsLoading: false });
    }
  },

  addComment: async (postId, text) => {
    const comment = await snsApi.addComment(postId, text);
    set({ comments: [...get().comments, comment] });
    set({
      posts: get().posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ),
    });
  },

  deleteComment: async (postId, commentId) => {
    await snsApi.deleteComment(postId, commentId);
    set({ comments: get().comments.filter((c) => c.id !== commentId) });
    set({
      posts: get().posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
      ),
    });
  },
}));
