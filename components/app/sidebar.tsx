'use client';

import { cn } from '@/lib/utils';
import { formatStorageUsage } from '@/lib/utils-format';
import { UploadCloud, HardDrive, FolderOpen, Clock, Star, Trash2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { StorageInfo } from '@/types';

interface SidebarProps {
  activeFilter: 'all' | 'recent' | 'starred' | 'trash';
  onFilterChange: (filter: 'all' | 'recent' | 'starred' | 'trash') => void;
  storage: StorageInfo | null;
  onUploadClick: () => void;
  onAskAIClick: () => void;
}

export function Sidebar({ activeFilter, onFilterChange, storage, onUploadClick, onAskAIClick }: SidebarProps) {
  const navItems = [
    { id: 'all' as const, label: 'My Files', icon: FolderOpen },
    { id: 'recent' as const, label: 'Recent', icon: Clock },
    { id: 'starred' as const, label: 'Starred', icon: Star },
    { id: 'trash' as const, label: 'Trash', icon: Trash2 },
  ];

  const storagePercent = storage ? (storage.used / storage.total) * 100 : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-4">
        <button
          onClick={onUploadClick}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-accent-hover active:translate-y-px active:shadow-none"
        >
          <UploadCloud className="h-4 w-4" strokeWidth={2} />
          Upload
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        <span className="px-3 py-1.5 text-xs uppercase tracking-wide text-foreground-tertiary">
          Files
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'bg-surface font-medium text-foreground'
                  : 'text-foreground-secondary hover:bg-surface hover:text-foreground'
              )}
            >
              <Icon
                className={cn('h-4 w-4', isActive ? 'text-accent' : 'text-foreground-tertiary')}
                strokeWidth={1.5}
              />
              {item.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}

        <div className="pt-4" />
        <button
          onClick={onAskAIClick}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground-secondary transition-colors duration-150 hover:bg-surface hover:text-foreground"
        >
          <Sparkles className="h-4 w-4 text-foreground-tertiary" strokeWidth={1.5} />
          Ask AI
        </button>
      </nav>

      {storage && (
        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-foreground-tertiary" strokeWidth={1.5} />
            <span className="text-xs font-medium text-foreground-secondary">Storage</span>
          </div>
          <Progress
            value={storagePercent}
            className="mb-1.5 h-1.5 bg-border"
            indicatorClassName="bg-accent"
          />
          <p className="font-mono text-xs tabular-nums text-foreground-tertiary">
            {formatStorageUsage(storage.used, storage.total)}
          </p>
        </div>
      )}
    </div>
  );
}
