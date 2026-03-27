import { create } from 'zustand';
import { subjectApi } from '../api/subjectApi';
import type { Subject } from '../types';

interface SubjectState {
  subjects: Subject[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: Omit<Subject, 'id' | 'createdAt' | 'userId'>) => Promise<Subject>;
  update: (id: string, data: Partial<Subject>) => Promise<Subject>;
  remove: (id: string) => Promise<void>;
}

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const subjects = await subjectApi.list();
      set({ subjects });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => {
    const subject = await subjectApi.create(data);
    set({ subjects: [...get().subjects, subject] });
    return subject;
  },

  update: async (id, data) => {
    const updated = await subjectApi.update(id, data);
    set({ subjects: get().subjects.map((s) => (s.id === id ? updated : s)) });
    return updated;
  },

  remove: async (id) => {
    await subjectApi.remove(id);
    set({ subjects: get().subjects.filter((s) => s.id !== id) });
  },
}));
