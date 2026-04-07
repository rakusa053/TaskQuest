export const AVATAR_MAP: Record<string, string> = {
  default: '👤',
  scholar: '📚',
  warrior: '⚔️',
  mage: '🔮',
  hero: '🦸',
  ninja: '🥷',
};

export function getAvatarLabel(avatarId?: string | null): string {
  return AVATAR_MAP[avatarId ?? 'default'] ?? '👤';
}
