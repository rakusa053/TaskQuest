import apiClient from './client';
import type { StudySession, WeeklyStats, StreakInfo } from '../types';

export const statsApi = {
  addSession: (data: Omit<StudySession, 'id' | 'userId'>) =>
    apiClient.post<StudySession>('/api/sessions', data).then((r) => r.data),

  weekly: () =>
    apiClient.get<WeeklyStats>('/api/stats/weekly').then((r) => r.data),

  streak: () =>
    apiClient.get<StreakInfo>('/api/stats/streak').then((r) => r.data),
};
