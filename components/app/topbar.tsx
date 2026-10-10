'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Sun, Moon, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import type { User as UserType } from '@/types';

interface TopbarProps {
  user: UserType | null;
  onSearchClick: () => void;
  className?: string;
}

export function Topbar({ user, onSearchClick, className }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('flex items-center justify-between gap-4 px-4 py-3', className)}>
      <button
        onClick={onSearchClick}
        className="flex h-8 flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-foreground-tertiary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:bg-hover active:translate-y-px active:shadow-none"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <span>Search files, ask AI...</span>
        <span className="ml-auto flex items-center gap-0.5 font-mono text-xs tabular-nums text-foreground-tertiary">
          <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">⌘</kbd>
          <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">K</kbd>
        </span>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground-secondary transition-all duration-150 hover:bg-surface hover:text-foreground active:translate-y-px"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 items-center gap-2 rounded-lg pl-1.5 pr-2 transition-all duration-150 hover:bg-surface active:translate-y-px">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-foreground-tertiary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
                <span className="text-xs text-foreground-tertiary">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/login" className="flex items-center gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
