'use client';

import { cn } from '@/lib/utils';
import { getFileIcon, getFileTypeLabel } from '@/lib/file-utils';
import { formatFileSizeShort, formatDate } from '@/lib/utils-format';
import { IndexStatusBadge } from '@/components/shared/index-status-badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { FileText } from 'lucide-react';
import type { FileItem } from '@/types';
import { ReactNode } from 'react';

interface HoverCardPreviewProps {
  file: FileItem;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function HoverCardPreview({ file, children, side = 'top' }: HoverCardPreviewProps) {
  const { icon: Icon, color } = getFileIcon(file.type);

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72 p-3" side={side}>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface">
              <Icon className={cn('h-4 w-4', color)} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="font-mono text-xs tabular-nums text-foreground-tertiary">
                ID: {file.id}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-foreground-tertiary">Type</p>
              <p className="font-mono tabular-nums text-foreground-secondary">
                {getFileTypeLabel(file.type)}
              </p>
            </div>
            <div>
              <p className="text-foreground-tertiary">Size</p>
              <p className="font-mono tabular-nums text-foreground-secondary">
                {formatFileSizeShort(file.size)}
              </p>
            </div>
            <div>
              <p className="text-foreground-tertiary">Modified</p>
              <p className="font-mono tabular-nums text-foreground-secondary">
                {formatDate(file.modifiedAt)}
              </p>
            </div>
            <div>
              <p className="text-foreground-tertiary">Chunks</p>
              <p className="font-mono tabular-nums text-foreground-secondary">
                {file.chunkCount > 0 ? file.chunkCount : '—'}
              </p>
            </div>
          </div>
          <IndexStatusBadge status={file.indexStatus} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
