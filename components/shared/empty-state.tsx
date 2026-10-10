'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, emoji, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      {icon ? (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
          {icon}
        </div>
      ) : emoji ? (
        <div className="mb-4 text-5xl">{emoji}</div>
      ) : null}
      <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground text-balance">
        {title}
      </h2>
      <p className="mb-6 max-w-md text-sm text-foreground-secondary text-balance">
        {description}
      </p>
      {action}
    </div>
  );
}
