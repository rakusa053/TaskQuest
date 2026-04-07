import { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';

function toLocalDateString(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useCalendarData() {
  const { tasks } = useTaskStore();

  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: { color: string }[]; selected?: boolean }> = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const date = toLocalDateString(task.dueDate);
      if (!marks[date]) marks[date] = { dots: [] };

      const color =
        task.status === 'completed' ? '#22c55e' :
        task.priority === 'high' ? '#ef4444' :
        task.priority === 'medium' ? '#f59e0b' : '#6366f1';

      marks[date].dots.push({ color });
    });

    return marks;
  }, [tasks]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const date = toLocalDateString(task.dueDate);
      if (!map[date]) map[date] = [];
      map[date].push(task);
    });
    return map;
  }, [tasks]);

  return { markedDates, tasksByDate };
}
