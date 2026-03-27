import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const sessions = new Hono<{ Variables: { userId: string } }>();
sessions.use('*', authMiddleware);

// 学習記録追加
sessions.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const now = Date.now();

  const session = {
    taskId: body.taskId,
    subjectId: body.subjectId,
    durationMinutes: body.durationMinutes,
    date: body.date,
    startedAt: body.startedAt,
    endedAt: body.endedAt ?? now,
    userId,
    createdAt: now,
  };

  const ref = await db.collection('sessions').add(session);
  return c.json({ id: ref.id, ...session }, 201);
});

// 週次統計
sessions.get('/stats/weekly', async (c) => {
  const userId = c.get('userId');
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const snapshot = await db.collection('sessions')
    .where('userId', '==', userId)
    .where('startedAt', '>=', weekAgo)
    .get();

  const days: Record<string, number> = {};
  let totalMinutes = 0;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    days[data.date] = (days[data.date] ?? 0) + data.durationMinutes;
    totalMinutes += data.durationMinutes;
  });

  // 直近7日分を生成
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    result.push({ date: dateStr, minutes: days[dateStr] ?? 0 });
  }

  const tasksSnapshot = await db.collection('tasks')
    .where('userId', '==', userId)
    .where('status', '==', 'completed')
    .where('completedAt', '>=', weekAgo)
    .get();

  return c.json({ days: result, totalMinutes, completedTasks: tasksSnapshot.size });
});

// ストリーク情報
sessions.get('/stats/streak', async (c) => {
  const userId = c.get('userId');
  const profile = await db.collection('profiles').doc(userId).get();
  const data = profile.data();

  return c.json({
    current: data?.streak ?? 0,
    longest: data?.longestStreak ?? 0,
    lastStudyDate: data?.lastStudyDate ?? null,
  });
});

export default sessions;
