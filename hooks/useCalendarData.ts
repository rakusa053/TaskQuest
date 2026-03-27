import { useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';

export function useCalendarData() {
  const { tasks } = useTaskStore();

  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: { color: string }[]; selected?: boolean }> = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const date = new Date(task.dueDate).toISOString().split('T')[0];
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
      const date = new Date(task.dueDate).toISOString().split('T')[0];
      if (!map[date]) map[date] = [];
      map[date].push(task);
    });
    return map;
  }, [tasks]);

  return { markedDates, tasksByDate };
}
