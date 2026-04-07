import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import type { Task } from '../types/index.js';

const tasks = new Hono<{ Variables: { userId: string } }>();
tasks.use('*', authMiddleware);

// タスク一覧取得
tasks.get('/', async (c) => {
  const userId = c.get('userId');
  const { status, subjectId, date } = c.req.query();

  // userId のみで取得し、フィルタ・ソートはメモリで処理（複合インデックス不要）
  const snapshot = await db.collection('tasks').where('userId', '==', userId).get();
  let taskList: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (status) taskList = taskList.filter(t => t.status === status);
  if (subjectId) taskList = taskList.filter(t => t.subjectId === subjectId);
  if (date) {
    const start = new Date(date).setHours(0, 0, 0, 0);
    const end = new Date(date).setHours(23, 59, 59, 999);
    taskList = taskList.filter(t => t.dueDate >= start && t.dueDate <= end);
  }

  taskList.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return c.json(taskList);
});

// タスク作成
tasks.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const now = Date.now();

  const task: Omit<Task, 'id'> = {
    title: body.title,
    description: body.description ?? '',
    subjectId: body.subjectId,
    status: 'pending',
    priority: body.priority ?? 'medium',
    dueDate: body.dueDate ?? null,
    estimatedMinutes: body.estimatedMinutes ?? 30,
    actualMinutes: 0,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    userId,
  };

  const ref = await db.collection('tasks').add(task);
  return c.json({ id: ref.id, ...task }, 201);
});

// タスク更新
tasks.put('/:id', async (c) => {
  const userId = c.get('userId');
  const taskId = c.req.param('id');
  const body = await c.req.json();

  const ref = db.collection('tasks').doc(taskId);
  const doc = await ref.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  const updates = { ...body, updatedAt: Date.now(), userId };
  await ref.update(updates);
  return c.json({ id: taskId, ...doc.data(), ...updates });
});

// タスク削除
tasks.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const taskId = c.req.param('id');

  const ref = db.collection('tasks').doc(taskId);
  const doc = await ref.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  await ref.delete();
  return c.json({ success: true });
});

export default tasks;
