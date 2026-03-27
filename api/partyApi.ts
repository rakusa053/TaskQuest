import apiClient from './client';
import type { Party, Boss } from '../types';

interface DamageResponse {
  damage: number;
  newHp: number;
  isDefeated: boolean;
}

export const partyApi = {
  get: () =>
    apiClient.get<Party | null>('/api/party').then((r) => r.data),

  create: (name?: string) =>
    apiClient.post<Party>('/api/party', { name }).then((r) => r.data),

  join: (inviteCode: string) =>
    apiClient.post<Party>('/api/party/join', { inviteCode }).then((r) => r.data),

  leave: () =>
    apiClient.delete<{ success: boolean }>('/api/party/leave').then((r) => r.data),

  boss: () =>
    apiClient.get<Boss | null>('/api/party/boss').then((r) => r.data),

  damageBoss: (data: {
    taskId: string;
    priority: 'low' | 'medium' | 'high';
    isOnTime: boolean;
    displayName?: string;
  }) =>
    apiClient.post<DamageResponse>('/api/party/boss/damage', data).then((r) => r.data),
};
