import apiClient from './client';
import type { GachaResult } from '../types';

export const gachaApi = {
  spin: () =>
    apiClient.post<GachaResult>('/api/gacha/spin').then((r) => r.data),

  results: () =>
    apiClient.get<GachaResult[]>('/api/gacha/results').then((r) => r.data),

  use: (id: string, targetApp: string) =>
    apiClient
      .post<{ success: boolean; expiresAt: number; targetApp: string; rewardMinutes: number }>(
        `/api/gacha/use/${id}`,
        { targetApp }
      )
      .then((r) => r.data),
};
