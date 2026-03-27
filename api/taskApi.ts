import apiClient from './client';
import type { Task } from '../types';

export const taskApi = {
  list: (params?: { status?: string; subjectId?: string; date?: string }) =>
    apiClient.get<Task[]>('/api/tasks', { params }).then((r) => r.data),

  create: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
    apiClient.post<Task>('/api/tasks', data).then((r) => r.data),

  update: (id: string, data: Partial<Task>) =>
    apiClient.put<Task>(`/api/tasks/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/api/tasks/${id}`).then((r) => r.data),
};
