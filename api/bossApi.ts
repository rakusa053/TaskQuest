import apiClient from './client';
import type { Boss, BossDamageLog } from '../types';

interface DamageResponse {
  damage: number;
  newHp: number;
  isDefeated: boolean;
  bossId?: string;
}

export const bossApi = {
  global: () =>
    apiClient.get<Boss>('/api/boss/global').then((r) => r.data),

  globalLogs: () =>
    apiClient.get<BossDamageLog[]>('/api/boss/global/logs').then((r) => r.data),

  damageGlobal: (data: {
    taskId: string;
    priority: 'low' | 'medium' | 'high';
    isOnTime: boolean;
    displayName?: string;
  }) =>
    apiClient.post<DamageResponse>('/api/boss/global/damage', data).then((r) => r.data),
};
