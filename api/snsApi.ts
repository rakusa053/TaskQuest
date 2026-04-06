import apiClient from './client';
import type { Post, Comment, SnsUser } from '../types';

export const snsApi = {
  getFeed: async (type: 'all' | 'following' | 'party'): Promise<Post[]> => {
    const res = await apiClient.get('/api/sns/feed', { params: { type } });
    return res.data;
  },

  createPost: async (text: string): Promise<Post> => {
    const res = await apiClient.post('/api/sns/posts', { text });
    return res.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/api/sns/posts/${postId}`);
  },

  toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const res = await apiClient.post(`/api/sns/posts/${postId}/like`);
    return res.data;
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    const res = await apiClient.get(`/api/sns/posts/${postId}/comments`);
    return res.data;
  },

  addComment: async (postId: string, text: string): Promise<Comment> => {
    const res = await apiClient.post(`/api/sns/posts/${postId}/comments`, { text });
    return res.data;
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/api/sns/posts/${postId}/comments/${commentId}`);
  },

  toggleFollow: async (targetUserId: string): Promise<{ following: boolean }> => {
    const res = await apiClient.post(`/api/sns/follow/${targetUserId}`);
    return res.data;
  },

  searchUsers: async (q: string): Promise<SnsUser[]> => {
    const res = await apiClient.get('/api/sns/users/search', { params: { q } });
    return res.data;
  },
};
