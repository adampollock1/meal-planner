import { User } from '@phosphor-icons/react';

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({ name, avatar, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClass = sizeStyles[size];
  const iconSize = iconSizes[size];

  // If avatar URL is provided, show image
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover shadow-md ${className}`}
      />
    );
  }

  // If name is provided, show initials
  if (name) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/20 ${className}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  // Default: show user icon
  return (
    <div
      className={`${sizeClass} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 ${className}`}
    >
      <User size={iconSize} weight="duotone" />
    </div>
  );
}
