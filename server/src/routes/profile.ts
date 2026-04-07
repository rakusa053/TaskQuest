import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkAndAwardBadges } from '../services/badges.js';

const profile = new Hono<{ Variables: { userId: string } }>();
profile.use('*', authMiddleware);

const XP_PER_PRIORITY = { low: 10, medium: 20, high: 30 };
const MONEY_PER_PRIORITY = { low: 5, medium: 10, high: 20 };
const DEADLINE_BONUS_XP = 10;
const DEADLINE_BONUS_MONEY = 10;

// レベル計算
function calcLevel(totalXp: number): number {
  // Lv2=100, Lv3=250, Lv4=500... 指数的増加
  let level = 1;
  let threshold = 100;
  let increment = 150;
  while (totalXp >= threshold) {
    level++;
    threshold += increment;
    increment = Math.floor(increment * 1.4);
  }
  return level;
}

// プロフィール取得
profile.get('/', async (c) => {
  const userId = c.get('userId');
  const doc = await db.collection('profiles').doc(userId).get();
  if (!doc.exists) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ id: doc.id, ...doc.data() });
});

// プロフィール更新
profile.put('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const allowed = ['displayName', 'avatarId'];
  const updates: Record<string, any> = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });

  await db.collection('profiles').doc(userId).set(updates, { merge: true });
  const updated = await db.collection('profiles').doc(userId).get();
  return c.json({ id: userId, ...updated.data() });
});

// バッジ一覧取得
profile.get('/badges', async (c) => {
  const userId = c.get('userId');
  const snapshot = await db.collection('badges')
    .where('userId', '==', userId)
    .get();
  const badges = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => b.unlockedAt - a.unlockedAt);
  return c.json(badges);
});

// タスク完了時のXP・マネー・チケット付与（サーバー側のみ）
profile.post('/xp', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { taskId, priority, isOnTime } = body;

  if (!taskId || !priority) return c.json({ error: 'taskId and priority required' }, 400);

  const xpGain = XP_PER_PRIORITY[priority as keyof typeof XP_PER_PRIORITY] + (isOnTime ? DEADLINE_BONUS_XP : 0);
  const moneyGain = MONEY_PER_PRIORITY[priority as keyof typeof MONEY_PER_PRIORITY] + (isOnTime ? DEADLINE_BONUS_MONEY : 0);
  const ticketGain = 1;

  const ref = db.collection('profiles').doc(userId);
  const doc = await ref.get();
  const data = doc.data() ?? {};

  const newTotalXp = (data.totalXp ?? 0) + xpGain;
  const newLevel = calcLevel(newTotalXp);
  const oldLevel = data.level ?? 1;
  const leveledUp = newLevel > oldLevel;

  // レベルアップボーナス
  const levelUpMoneyBonus = leveledUp ? newLevel * 20 : 0;
  const levelUpTicketBonus = leveledUp ? 1 : 0;

  const updates = {
    xp: (data.xp ?? 0) + xpGain,
    totalXp: newTotalXp,
    level: newLevel,
    money: (data.money ?? 0) + moneyGain + levelUpMoneyBonus,
    totalMoneyEarned: (data.totalMoneyEarned ?? 0) + moneyGain + levelUpMoneyBonus,
    gachaTickets: (data.gachaTickets ?? 0) + ticketGain + levelUpTicketBonus,
    weeklyPoints: (data.weeklyPoints ?? 0) + xpGain,
    userId,
  };

  await ref.set(updates, { merge: true });

  // SNS 自動投稿
  try {
    const taskDoc = await db.collection('tasks').doc(taskId).get();
    const taskTitle = taskDoc.data()?.title ?? 'タスク';
    await db.collection('posts').add({
      userId,
      displayName: data.displayName ?? 'プレイヤー',
      avatarId: data.avatarId ?? 'default',
      text: `${taskTitle}を完了しました！`,
      taskId,
      isAutoPost: true,
      likesCount: 0,
      commentsCount: 0,
      createdAt: Date.now(),
    });
  } catch {
    // 自動投稿失敗はメイン処理に影響させない
  }

  // バッジ判定
  const newBadges = await checkAndAwardBadges(userId, { ...data, ...updates });

  return c.json({
    xpGain,
    moneyGain: moneyGain + levelUpMoneyBonus,
    ticketGain: ticketGain + levelUpTicketBonus,
    newLevel,
    leveledUp,
    newBadges,
    profile: { id: userId, ...data, ...updates },
  });
});

// プロフィール初期化（新規登録時）
profile.post('/init', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const now = Date.now();

  const ref = db.collection('profiles').doc(userId);
  const doc = await ref.get();
  if (doc.exists) return c.json({ error: 'Already initialized' }, 400);

  const initial = {
    displayName: body.displayName ?? 'プレイヤー',
    level: 1,
    xp: 0,
    totalXp: 0,
    weeklyPoints: 0,
    streak: 0,
    longestStreak: 0,
    avatarId: 'default',
    unlockedAvatars: ['default'],
    gachaTickets: 3,
    money: 100,
    totalMoneyEarned: 100,
    xpBoostExpiresAt: null,
    partyId: null,
    createdAt: now,
    userId,
  };

  await ref.set(initial);
  return c.json({ id: userId, ...initial }, 201);
});

export default profile;
