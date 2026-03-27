import { db } from '../firebase/admin.js';

interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (profile: any) => boolean;
}

const BADGE_DEFINITIONS: BadgeDef[] = [
  {
    id: 'first_step',
    name: 'ファーストステップ',
    description: '初めてタスクを完了した',
    icon: 'star',
    check: (p) => (p.totalXp ?? 0) > 0,
  },
  {
    id: 'streak_3',
    name: '3日連続',
    description: '3日連続でタスクを完了した',
    icon: 'fire',
    check: (p) => (p.streak ?? 0) >= 3,
  },
  {
    id: 'streak_7',
    name: '1週間チャンピオン',
    description: '7日連続でタスクを完了した',
    icon: 'trophy',
    check: (p) => (p.streak ?? 0) >= 7,
  },
  {
    id: 'streak_30',
    name: '月の覇者',
    description: '30日連続でタスクを完了した',
    icon: 'crown',
    check: (p) => (p.streak ?? 0) >= 30,
  },
  {
    id: 'rich',
    name: '大富豪',
    description: '累計10,000コイン獲得した',
    icon: 'cash',
    check: (p) => (p.totalMoneyEarned ?? 0) >= 10000,
  },
];

export async function checkAndAwardBadges(userId: string, profile: any): Promise<any[]> {
  const existingSnapshot = await db.collection('badges')
    .where('userId', '==', userId)
    .get();
  const existingIds = new Set(existingSnapshot.docs.map(d => d.data().badgeDefId));

  const newBadges = [];
  const now = Date.now();

  for (const def of BADGE_DEFINITIONS) {
    if (existingIds.has(def.id)) continue;
    if (!def.check(profile)) continue;

    const badge = {
      badgeDefId: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlockedAt: now,
      userId,
    };

    const ref = await db.collection('badges').add(badge);
    newBadges.push({ id: ref.id, ...badge });
  }

  return newBadges;
}
