'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { FileText } from 'lucide-react';
import type { Citation } from '@/types';

interface CitationChipProps {
  citation: Citation;
  index: number;
}

export function CitationChip({ citation, index }: CitationChipProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link
          href={`/files/${citation.fileId}?page=${citation.page}`}
          className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-1.5 py-0.5 font-mono text-xs font-medium text-accent transition-all duration-150 hover:bg-accent hover:text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
        >
          [{index + 1}]
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-3" sideOffset={6}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface">
              <FileText className="h-3.5 w-3.5 text-foreground-secondary" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{citation.fileName}</p>
              <p className="font-mono text-xs tabular-nums text-foreground-tertiary">
                Page {citation.page}
              </p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-surface px-3 py-2">
            <p className="line-clamp-3 text-xs text-foreground-secondary">
              {citation.snippet}
            </p>
          </div>
          <p className="text-xs text-accent">Click to open file at this page →</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
