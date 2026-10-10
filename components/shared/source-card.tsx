'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileTypeLabel } from '@/lib/file-utils';
import { formatFileSizeShort } from '@/lib/utils-format';
import { ArrowUpRight } from 'lucide-react';
import type { FileItem } from '@/types';

interface SourceCardProps {
  file: FileItem;
  page?: number;
  className?: string;
}

export function SourceCard({ file, page, className }: SourceCardProps) {
  const { icon: Icon, color } = getFileIcon(file.type);

  return (
    <Link
      href={page ? `/files/${file.id}?page=${page}` : `/files/${file.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors duration-150 hover:bg-surface',
        className
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface">
        <Icon className={cn('h-4 w-4', color)} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-foreground-tertiary">
          <span className="font-mono tabular-nums">{getFileTypeLabel(file.type)}</span>
          <span>·</span>
          <span className="font-mono tabular-nums">{formatFileSizeShort(file.size)}</span>
          {page && (
            <>
              <span>·</span>
              <span className="font-mono tabular-nums">p.{page}</span>
            </>
          )}
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground-tertiary transition-colors group-hover:text-foreground" />
    </Link>
  );
}
