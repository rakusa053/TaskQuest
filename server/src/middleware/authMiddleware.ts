import { createMiddleware } from 'hono/factory';
import { auth } from '../firebase/admin.js';

export const authMiddleware = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    c.set('userId', decoded.uid);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});
