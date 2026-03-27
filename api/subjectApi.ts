import apiClient from './client';
import type { Subject } from '../types';

export const subjectApi = {
  list: () =>
    apiClient.get<Subject[]>('/api/subjects').then((r) => r.data),

  create: (data: Omit<Subject, 'id' | 'createdAt' | 'userId'>) =>
    apiClient.post<Subject>('/api/subjects', data).then((r) => r.data),

  update: (id: string, data: Partial<Subject>) =>
    apiClient.put<Subject>(`/api/subjects/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/api/subjects/${id}`).then((r) => r.data),
};
