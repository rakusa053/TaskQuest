export const AVATAR_MAP: Record<string, string> = {
  default: '👤',
  scholar: '📚',
  warrior: '⚔️',
  mage: '🔮',
  hero: '🦸',
  ninja: '🥷',
  avatar_dragon: '🐉',
  avatar_fox: '🦊',
  avatar_panda: '🐼',
  avatar_king: '👑',
  avatar_robot: '🤖',
  avatar_star: '🌟',
};

export function getAvatarLabel(avatarId?: string | null): string {
  return AVATAR_MAP[avatarId ?? 'default'] ?? '👤';
}
