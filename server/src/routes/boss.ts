import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const boss = new Hono<{ Variables: { userId: string } }>();
boss.use('*', authMiddleware);

const DAMAGE_PER_PRIORITY = { low: 10, medium: 20, high: 30 };
const DEADLINE_BONUS = 10;

async function getOrCreateGlobalBoss() {
  const snapshot = await db.collection('bosses')
    .where('type', '==', 'global')
    .where('isDefeated', '==', false)
    .limit(1)
    .get();

  if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

  // 新しいボスを生成
  const now = Date.now();
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + (8 - nextMonday.getDay()) % 7 || 7);
  nextMonday.setHours(0, 0, 0, 0);

  const bossNames = ['闇のドラゴン', '魔王バルガス', '深淵の番人', '鋼鉄の巨人', '時間喰らい'];
  const existingCount = (await db.collection('bosses').where('type', '==', 'global').get()).size;

  const newBoss = {
    name: bossNames[existingCount % bossNames.length],
    imageUrl: '',
    level: existingCount + 1,
    hp: 1000 + existingCount * 500,
    maxHp: 1000 + existingCount * 500,
    type: 'global',
    startsAt: now,
    endsAt: nextMonday.getTime(),
    isDefeated: false,
    defeatedAt: null,
    moneyReward: 500 + existingCount * 100,
  };

  const ref = await db.collection('bosses').add(newBoss);
  return { id: ref.id, ...newBoss };
}

// グローバルボス情報
boss.get('/global', async (c) => {
  const bossData = await getOrCreateGlobalBoss();
  return c.json(bossData);
});

// ダメージログ
boss.get('/global/logs', async (c) => {
  const bossData = await getOrCreateGlobalBoss();
  const snapshot = await db.collection('bossDamageLogs')
    .where('bossId', '==', bossData.id)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  return c.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// グローバルボスへダメージ（タスク完了時）
boss.post('/global/damage', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { taskId, priority, isOnTime, displayName } = body;

  const damage = (DAMAGE_PER_PRIORITY[priority as keyof typeof DAMAGE_PER_PRIORITY] ?? 10)
    + (isOnTime ? DEADLINE_BONUS : 0);

  const bossData = await getOrCreateGlobalBoss() as any;
  const bossRef = db.collection('bosses').doc(bossData.id);
  const now = Date.now();

  const newHp = Math.max(0, (bossData.hp ?? 0) - damage);
  const isDefeated = newHp === 0;

  await bossRef.update({
    hp: newHp,
    ...(isDefeated ? { isDefeated: true, defeatedAt: now } : {}),
  });

  // ダメージログ保存
  await db.collection('bossDamageLogs').add({
    bossId: bossData.id,
    userId,
    displayName: displayName ?? 'プレイヤー',
    damage,
    taskId,
    createdAt: now,
  });

  // 討伐成功時の報酬付与
  if (isDefeated) {
    await distributeBossRewards(bossData.id, bossData.moneyReward ?? 500);
  }

  return c.json({ damage, newHp, isDefeated, bossId: bossData.id });
});

async function distributeBossRewards(bossId: string, moneyReward: number) {
  const logsSnapshot = await db.collection('bossDamageLogs')
    .where('bossId', '==', bossId)
    .get();

  const totalDamage = logsSnapshot.docs.reduce((sum, d) => sum + (d.data().damage ?? 0), 0);
  const userDamage: Record<string, number> = {};
  logsSnapshot.docs.forEach(d => {
    const { userId, damage } = d.data();
    userDamage[userId] = (userDamage[userId] ?? 0) + damage;
  });

  for (const [uid, dmg] of Object.entries(userDamage)) {
    const contribution = totalDamage > 0 ? dmg / totalDamage : 0;
    const reward = Math.floor(moneyReward * contribution);
    const bonusTickets = contribution >= 0.1 ? 3 : 1;

    const profileRef = db.collection('profiles').doc(uid);
    const profile = (await profileRef.get()).data() ?? {};
    await profileRef.set({
      money: (profile.money ?? 0) + reward,
      totalMoneyEarned: (profile.totalMoneyEarned ?? 0) + reward,
      gachaTickets: (profile.gachaTickets ?? 0) + bonusTickets,
    }, { merge: true });
  }
}

export default boss;
