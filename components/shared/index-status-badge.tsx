'use client';

import { cn } from '@/lib/utils';
import { getIndexStatusConfig } from '@/lib/file-utils';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { IndexStatus } from '@/types';

interface IndexStatusBadgeProps {
  status: IndexStatus;
  className?: string;
  compact?: boolean;
}

export function IndexStatusBadge({ status, className, compact }: IndexStatusBadgeProps) {
  const config = getIndexStatusConfig(status);
  const Icon =
    status === 'indexed' ? CheckCircle2 : status === 'processing' ? Loader2 : AlertCircle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon
        className={cn('h-3 w-3', status === 'processing' && 'animate-spin')}
        strokeWidth={2}
      />
      {!compact && <span>{config.label}</span>}
    </span>
  );
}
