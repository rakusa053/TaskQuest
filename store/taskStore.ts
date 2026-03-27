import { create } from 'zustand';
import { taskApi } from '../api/taskApi';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  fetch: (params?: { status?: string; subjectId?: string; date?: string }) => Promise<void>;
  create: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Task>;
  update: (id: string, data: Partial<Task>) => Promise<Task>;
  remove: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  fetch: async (params) => {
    set({ loading: true });
    try {
      const tasks = await taskApi.list(params);
      set({ tasks });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => {
    const task = await taskApi.create(data);
    set({ tasks: [task, ...get().tasks] });
    return task;
  },

  update: async (id, data) => {
    const updated = await taskApi.update(id, data);
    set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) });
    return updated;
  },

  remove: async (id) => {
    await taskApi.remove(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
}));
