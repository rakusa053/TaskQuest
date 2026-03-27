import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import type { Subject } from '../types/index.js';

const subjects = new Hono<{ Variables: { userId: string } }>();
subjects.use('*', authMiddleware);

subjects.get('/', async (c) => {
  const userId = c.get('userId');
  const snapshot = await db.collection('subjects')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'asc')
    .get();
  return c.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

subjects.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const now = Date.now();

  const subject: Omit<Subject, 'id'> = {
    name: body.name,
    color: body.color ?? '#6366f1',
    icon: body.icon ?? 'book',
    createdAt: now,
    userId,
  };

  const ref = await db.collection('subjects').add(subject);
  return c.json({ id: ref.id, ...subject }, 201);
});

subjects.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const ref = db.collection('subjects').doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.userId !== userId) return c.json({ error: 'Not found' }, 404);

  await ref.update({ ...body, userId });
  return c.json({ id, ...doc.data(), ...body });
});

subjects.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const ref = db.collection('subjects').doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.userId !== userId) return c.json({ error: 'Not found' }, 404);

  await ref.delete();
  return c.json({ success: true });
});

export default subjects;
