import { Hono } from 'hono';
import { db } from '../firebase/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const shop = new Hono<{ Variables: { userId: string } }>();
shop.use('*', authMiddleware);

// ショップ商品マスターデータ
const SHOP_ITEMS = [
  {
    id: 'gacha_ticket_1',
    type: 'gacha_ticket',
    name: 'ガチャチケット x1',
    description: 'ガチャを1回引けるチケット',
    price: 100,
    value: 1,
    isLimited: false,
  },
  {
    id: 'gacha_ticket_5',
    type: 'gacha_ticket',
    name: 'ガチャチケット x5',
    description: 'ガチャを5回引けるチケット（お得）',
    price: 450,
    value: 5,
    isLimited: false,
  },
  {
    id: 'time_extension_10',
    type: 'time_extension',
    name: 'アプリ解放 +10分',
    description: 'ガチャ報酬の解放時間を10分延長',
    price: 80,
    value: 10,
    isLimited: false,
  },
  {
    id: 'xp_boost_1h',
    type: 'xp_boost',
    name: 'XPブースト 1時間',
    description: '1時間XP獲得量が2倍になる',
    price: 200,
    value: 60,
    isLimited: false,
  },
  {
    id: 'xp_boost_3h',
    type: 'xp_boost',
    name: 'XPブースト 3時間',
    description: '3時間XP獲得量が2倍になる',
    price: 500,
    value: 180,
    isLimited: false,
  },
];

// 商品一覧取得
shop.get('/', async (c) => {
  return c.json(SHOP_ITEMS);
});

// 購入履歴取得
shop.get('/purchases', async (c) => {
  const userId = c.get('userId');
  const snapshot = await db.collection('purchaseLogs')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  return c.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// 購入処理
shop.post('/purchase/:itemId', async (c) => {
  const userId = c.get('userId');
  const itemId = c.req.param('itemId');

  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return c.json({ error: 'Item not found' }, 404);

  const profileRef = db.collection('profiles').doc(userId);
  const profileDoc = await profileRef.get();
  const profile = profileDoc.data();

  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  if ((profile.money ?? 0) < item.price) {
    return c.json({ error: 'コインが足りません' }, 400);
  }

  const now = Date.now();
  const updates: Record<string, any> = {
    money: (profile.money ?? 0) - item.price,
  };

  // 商品タイプ別の付与処理
  if (item.type === 'gacha_ticket') {
    updates.gachaTickets = (profile.gachaTickets ?? 0) + (item.value ?? 1);
  } else if (item.type === 'xp_boost') {
    const currentExpiry = profile.xpBoostExpiresAt ?? 0;
    const baseTime = Math.max(now, currentExpiry);
    updates.xpBoostExpiresAt = baseTime + (item.value ?? 60) * 60 * 1000;
  }

  await profileRef.update(updates);

  // 購入ログ保存
  await db.collection('purchaseLogs').add({
    userId,
    shopItemId: itemId,
    itemName: item.name,
    price: item.price,
    createdAt: now,
  });

  return c.json({
    success: true,
    item,
    remainingMoney: updates.money,
    ...(item.type === 'gacha_ticket' ? { gachaTickets: updates.gachaTickets } : {}),
    ...(item.type === 'xp_boost' ? { xpBoostExpiresAt: updates.xpBoostExpiresAt } : {}),
  });
});

export default shop;
