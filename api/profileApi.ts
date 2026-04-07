import apiClient from './client';
import type { UserProfile, Badge } from '../types';

interface XpRewardResponse {
  xp: number;
  money: number;
  gachaTickets: number;
  newLevel?: number;
  leveledUp?: boolean;
  newBadges?: Badge[];
  profile: UserProfile;
}

export const profileApi = {
  get: () =>
    apiClient.get<UserProfile>('/api/profile').then((r) => r.data),

  update: (data: { displayName?: string; avatarId?: string }) =>
    apiClient.put<UserProfile>('/api/profile', data).then((r) => r.data),

  badges: () =>
    apiClient.get<Badge[]>('/api/profile/badges').then((r) => r.data),

  rewardXp: (data: {
    taskId: string;
    priority: 'low' | 'medium' | 'high';
    isOnTime: boolean;
    displayName?: string;
  }) =>
    apiClient.post<XpRewardResponse>('/api/profile/xp', data).then((r) => r.data),

  init: (data: { displayName: string }) =>
    apiClient.post<UserProfile>('/api/profile/init', data).then((r) => r.data),
};
