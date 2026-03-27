export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 'low' | 'medium' | 'high';
  dueDate: number | null;
  estimatedMinutes: number;
  actualMinutes: number;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  userId: string;
}

export interface StudySession {
  id: string;
  taskId: string;
  subjectId: string;
  durationMinutes: number;
  date: string;
  startedAt: number;
  endedAt: number;
  userId: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  level: number;
  xp: number;
  totalXp: number;
  weeklyPoints: number;
  streak: number;
  longestStreak: number;
  avatarId: string;
  unlockedAvatars: string[];
  gachaTickets: number;
  money: number;
  totalMoneyEarned: number;
  xpBoostExpiresAt: number | null;
  partyId: string | null;
  createdAt: number;
  userId: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  userId: string;
}

export interface GachaResult {
  id: string;
  userId: string;
  rewardMinutes: number;
  rarity: 'normal' | 'rare' | 'sr';
  used: boolean;
  usedAt: number | null;
  targetApp: string | null;
  expiresAt: number | null;
  createdAt: number;
}

export interface ShopItem {
  id: string;
  type: 'avatar' | 'costume' | 'accessory' | 'gacha_ticket' | 'time_extension' | 'xp_boost';
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  value?: number;
  isLimited: boolean;
}

export interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  level: number;
  hp: number;
  maxHp: number;
  type: 'global' | 'party';
  partyId?: string;
  startsAt: number;
  endsAt: number;
  isDefeated: boolean;
  defeatedAt: number | null;
  moneyReward: number;
}

export interface BossDamageLog {
  id: string;
  bossId: string;
  userId: string;
  displayName: string;
  damage: number;
  taskId: string;
  createdAt: number;
}

export interface Party {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  inviteCode: string;
  currentBossId: string | null;
  createdAt: number;
}
