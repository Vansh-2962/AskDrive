'use client';

import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/files" className={cn('flex items-center gap-2', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
        <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
      </div>
      {showText && (
        <span className="text-base font-semibold tracking-tight text-foreground">
          AskDrive
        </span>
      )}
    </Link>
  );
}
