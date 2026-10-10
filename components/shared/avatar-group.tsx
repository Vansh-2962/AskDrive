'use client';

import { cn } from '@/lib/utils';
import { getFileTypeLabel } from '@/lib/file-utils';
import type { SharedUser } from '@/types';

interface AvatarGroupProps {
  users: SharedUser[];
  size?: number;
  max?: number;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
  return name.slice(0, 2);
}

const colors = [
  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
];

export function AvatarGroup({ users, size = 24, max = 3, className }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-2">
        {visible.map((user, i) => (
          <div
            key={user.id}
            className={cn(
              'flex items-center justify-center rounded-full border-2 border-background font-medium',
              colors[i % colors.length]
            )}
            style={{ width: size, height: size, fontSize: size * 0.38 }}
            title={user.name}
          >
            {getInitials(user.name)}
          </div>
        ))}
        {overflow > 0 && (
          <div
            className="flex items-center justify-center rounded-full border-2 border-background bg-surface text-foreground-secondary font-medium"
            style={{ width: size, height: size, fontSize: size * 0.35 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}
