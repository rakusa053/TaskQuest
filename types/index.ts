// ===== タスク =====
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

// ===== 科目 =====
export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  userId: string;
}

// ===== 学習セッション =====
export interface StudySession {
  id: string;
  taskId: string;
  subjectId: string;
  durationMinutes: number;
  date: string; // "2026-03-27"
  startedAt: number;
  endedAt: number;
  userId: string;
}

// ===== ユーザープロフィール =====
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

// ===== バッジ =====
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  userId: string;
}

// ===== ガチャ =====
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

// ===== ショップ =====
export interface ShopItem {
  id: string;
  type: 'avatar' | 'costume' | 'accessory' | 'gacha_ticket' | 'time_extension' | 'xp_boost' | 'theme';
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  value?: number;
  isLimited: boolean;
  // テーマ用カラー
  themeAccentColor?: string;
  themeBgColor?: string;
  themeBorderColor?: string;
}

export interface AppTheme {
  id: string;
  name: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

export interface PurchaseLog {
  id: string;
  userId: string;
  shopItemId: string;
  price: number;
  createdAt: number;
}

// ===== RPGボス戦 =====
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

// ===== パーティ =====
export interface Party {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  inviteCode: string;
  currentBossId: string | null;
  createdAt: number;
}

// ===== 統計 =====
export interface WeeklyStats {
  days: { date: string; minutes: number }[];
  totalMinutes: number;
  completedTasks: number;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastStudyDate: string | null;
  // aliases for compatibility
  streak?: number;
  longestStreak?: number;
}

// ===== SNS =====
export interface Post {
  id: string;
  userId: string;
  displayName: string;
  avatarId: string;
  text: string;
  taskId: string | null;
  isAutoPost: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: number;
  likedByMe?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  displayName: string;
  avatarId?: string;
  text: string;
  createdAt: number;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: number;
}

export interface SnsUser {
  userId: string;
  displayName: string;
  avatarId: string;
  level: number;
  followingMe?: boolean;
  followedByMe?: boolean;
}
