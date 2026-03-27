import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const party = new Hono<{ Variables: { userId: string } }>();
party.use('*', authMiddleware);

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// パーティ情報取得
party.get('/', async (c) => {
  const userId = c.get('userId');
  const profile = await db.collection('profiles').doc(userId).get();
  const partyId = profile.data()?.partyId;

  if (!partyId) return c.json(null);

  const partyDoc = await db.collection('parties').doc(partyId).get();
  if (!partyDoc.exists) return c.json(null);

  return c.json({ id: partyDoc.id, ...partyDoc.data() });
});

// パーティ作成
party.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const profile = await db.collection('profiles').doc(userId).get();
  if (profile.data()?.partyId) {
    return c.json({ error: 'Already in a party' }, 400);
  }

  const now = Date.now();
  const newParty = {
    name: body.name ?? 'マイパーティ',
    leaderId: userId,
    memberIds: [userId],
    inviteCode: generateInviteCode(),
    currentBossId: null,
    createdAt: now,
  };

  const ref = await db.collection('parties').add(newParty);
  await db.collection('profiles').doc(userId).set({ partyId: ref.id }, { merge: true });

  // パーティ専用ボスを生成
  const bossRef = await db.collection('bosses').add({
    name: '始まりの魔獣',
    imageUrl: '',
    level: 1,
    hp: 300,
    maxHp: 300,
    type: 'party',
    partyId: ref.id,
    startsAt: now,
    endsAt: now + 7 * 24 * 60 * 60 * 1000,
    isDefeated: false,
    defeatedAt: null,
    moneyReward: 200,
  });

  await ref.update({ currentBossId: bossRef.id });

  return c.json({ id: ref.id, ...newParty, currentBossId: bossRef.id }, 201);
});

// 招待コードでパーティ参加
party.post('/join', async (c) => {
  const userId = c.get('userId');
  const { inviteCode } = await c.req.json();

  const profile = await db.collection('profiles').doc(userId).get();
  if (profile.data()?.partyId) {
    return c.json({ error: 'Already in a party' }, 400);
  }

  const snapshot = await db.collection('parties')
    .where('inviteCode', '==', inviteCode)
    .limit(1)
    .get();

  if (snapshot.empty) return c.json({ error: 'Invalid invite code' }, 404);

  const partyDoc = snapshot.docs[0];
  const partyData = partyDoc.data();

  if ((partyData.memberIds ?? []).length >= 5) {
    return c.json({ error: 'Party is full' }, 400);
  }

  await partyDoc.ref.update({
    memberIds: [...(partyData.memberIds ?? []), userId],
  });
  await db.collection('profiles').doc(userId).set({ partyId: partyDoc.id }, { merge: true });

  return c.json({ id: partyDoc.id, ...partyData });
});

// パーティ脱退
party.delete('/leave', async (c) => {
  const userId = c.get('userId');
  const profile = await db.collection('profiles').doc(userId).get();
  const partyId = profile.data()?.partyId;

  if (!partyId) return c.json({ error: 'Not in a party' }, 400);

  const partyRef = db.collection('parties').doc(partyId);
  const partyDoc = await partyRef.get();
  const partyData = partyDoc.data();

  const newMembers = (partyData?.memberIds ?? []).filter((id: string) => id !== userId);

  if (newMembers.length === 0) {
    await partyRef.delete();
  } else {
    await partyRef.update({
      memberIds: newMembers,
      ...(partyData?.leaderId === userId ? { leaderId: newMembers[0] } : {}),
    });
  }

  await db.collection('profiles').doc(userId).set({ partyId: null }, { merge: true });
  return c.json({ success: true });
});

// パーティボス情報
party.get('/boss', async (c) => {
  const userId = c.get('userId');
  const profile = await db.collection('profiles').doc(userId).get();
  const partyId = profile.data()?.partyId;
  if (!partyId) return c.json({ error: 'Not in a party' }, 400);

  const partyDoc = await db.collection('parties').doc(partyId).get();
  const bossId = partyDoc.data()?.currentBossId;
  if (!bossId) return c.json(null);

  const bossDoc = await db.collection('bosses').doc(bossId).get();
  return c.json({ id: bossDoc.id, ...bossDoc.data() });
});

// パーティボスへダメージ
party.post('/boss/damage', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { taskId, priority, isOnTime, displayName } = body;

  const profile = await db.collection('profiles').doc(userId).get();
  const partyId = profile.data()?.partyId;
  if (!partyId) return c.json({ error: 'Not in a party' }, 400);

  const DAMAGE = { low: 10, medium: 20, high: 30 };
  const damage = (DAMAGE[priority as keyof typeof DAMAGE] ?? 10) + (isOnTime ? 10 : 0);

  const partyDoc = await db.collection('parties').doc(partyId).get();
  const bossId = partyDoc.data()?.currentBossId;
  if (!bossId) return c.json({ error: 'No boss' }, 400);

  const bossRef = db.collection('bosses').doc(bossId);
  const bossDoc = await bossRef.get();
  const bossData = bossDoc.data() as any;

  const newHp = Math.max(0, (bossData.hp ?? 0) - damage);
  const isDefeated = newHp === 0;
  const now = Date.now();

  await bossRef.update({
    hp: newHp,
    ...(isDefeated ? { isDefeated: true, defeatedAt: now } : {}),
  });

  await db.collection('bossDamageLogs').add({
    bossId,
    userId,
    displayName: displayName ?? 'プレイヤー',
    damage,
    taskId,
    createdAt: now,
  });

  return c.json({ damage, newHp, isDefeated });
});

export default party;
