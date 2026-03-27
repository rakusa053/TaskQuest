import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useProfileStore } from '../store/profileStore';
import { useBossStore } from '../store/bossStore';
import { statsApi } from '../api/statsApi';
import type { Task } from '../types';

export function useTasks(params?: { status?: string; subjectId?: string; date?: string }) {
  const { tasks, loading, fetch, create, update, remove } = useTaskStore();
  const { rewardXp, profile } = useProfileStore();
  const { damage: damageBoss } = useBossStore();

  useEffect(() => {
    fetch(params);
  }, []);

  const completeTask = async (task: Task, actualMinutes: number) => {
    const now = Date.now();
    const isOnTime = task.dueDate ? now <= task.dueDate : true;

    // タスク完了ステータス更新
    const updated = await update(task.id, {
      status: 'completed',
      completedAt: now,
      actualMinutes,
    });

    // 学習セッション記録
    await statsApi.addSession({
      taskId: task.id,
      subjectId: task.subjectId,
      durationMinutes: actualMinutes,
      date: new Date().toISOString().split('T')[0],
      startedAt: now - actualMinutes * 60 * 1000,
      endedAt: now,
    });

    // XP・マネー・チケット付与
    const xpResult = await rewardXp({
      taskId: task.id,
      priority: task.priority,
      isOnTime,
      displayName: profile?.displayName,
    });

    // ボスへダメージ
    const bossResult = await damageBoss({
      taskId: task.id,
      priority: task.priority,
      isOnTime,
      displayName: profile?.displayName,
    });

    return { updated, xpResult, bossResult, isOnTime };
  };

  return { tasks, loading, fetch, create, update, remove, completeTask };
}
