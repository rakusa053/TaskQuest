import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const gacha = new Hono<{ Variables: { userId: string } }>();
gacha.use('*', authMiddleware);

// 確率定義
const GACHA_TABLE = [
  { rarity: 'sr' as const, rewardMinutes: 30, weight: 10 },
  { rarity: 'rare' as const, rewardMinutes: 20, weight: 30 },
  { rarity: 'normal' as const, rewardMinutes: 10, weight: 60 },
];

function drawGacha() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const item of GACHA_TABLE) {
    cumulative += item.weight;
    if (rand < cumulative) return item;
  }
  return GACHA_TABLE[2];
}

// ガチャを引く（チケット1枚消費）
gacha.post('/spin', async (c) => {
  const userId = c.get('userId');

  const profileRef = db.collection('profiles').doc(userId);
  const profileDoc = await profileRef.get();
  const profile = profileDoc.data();

  if (!profile || (profile.gachaTickets ?? 0) < 1) {
    return c.json({ error: 'チケットが足りません' }, 400);
  }

  const result = drawGacha();
  const now = Date.now();

  const gachaResult = {
    userId,
    rewardMinutes: result.rewardMinutes,
    rarity: result.rarity,
    used: false,
    usedAt: null,
    targetApp: null,
    expiresAt: null,
    createdAt: now,
  };

  const ref = await db.collection('gachaResults').add(gachaResult);
  await profileRef.update({ gachaTickets: (profile.gachaTickets ?? 1) - 1 });

  return c.json({ id: ref.id, ...gachaResult });
});

// 未使用報酬一覧
gacha.get('/results', async (c) => {
  const userId = c.get('userId');
  const snapshot = await db.collection('gachaResults')
    .where('userId', '==', userId)
    .get();
  const results = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((r: any) => !r.used)
    .sort((a: any, b: any) => b.createdAt - a.createdAt);
  return c.json(results);
});

// 報酬を使う（アプリ解放タイマー起動）
gacha.post('/use/:id', async (c) => {
  const userId = c.get('userId');
  const resultId = c.req.param('id');
  const body = await c.req.json();
  const { targetApp } = body;

  const ref = db.collection('gachaResults').doc(resultId);
  const doc = await ref.get();

  if (!doc.exists || doc.data()?.userId !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }
  if (doc.data()?.used) {
    return c.json({ error: 'Already used' }, 400);
  }

  const now = Date.now();
  const rewardMinutes = doc.data()?.rewardMinutes ?? 10;
  const expiresAt = now + rewardMinutes * 60 * 1000;

  await ref.update({ used: true, usedAt: now, targetApp, expiresAt });

  return c.json({ success: true, expiresAt, targetApp, rewardMinutes });
});

export default gacha;
