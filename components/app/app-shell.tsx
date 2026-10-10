'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/app/sidebar';
import { Topbar } from '@/components/app/topbar';
import { Logo } from '@/components/app/logo';
import { CommandMenu } from '@/components/shared/command-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { listFiles, listFolders, getUser, getStorageInfo } from '@/lib/api';
import type { FileItem, Folder, User, StorageInfo } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  activeFilter?: 'all' | 'recent' | 'starred' | 'trash';
  onFilterChange?: (filter: 'all' | 'recent' | 'starred' | 'trash') => void;
  sidebarContent?: React.ReactNode;
  showSidebar?: boolean;
  maxWidth?: 'content' | 'chat' | 'full';
}

export function AppShell({
  children,
  activeFilter = 'all',
  onFilterChange,
  sidebarContent,
  showSidebar = true,
  maxWidth = 'content',
}: AppShellProps) {
  const router = useRouter();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [filter, setFilter] = useState(activeFilter);

  useEffect(() => {
    listFiles().then(setFiles);
    listFolders().then(setFolders);
    getUser().then(setUser);
    getStorageInfo().then(setStorage);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleFilterChange = useCallback(
    (newFilter: 'all' | 'recent' | 'starred' | 'trash') => {
      setFilter(newFilter);
      onFilterChange?.(newFilter);
    },
    [onFilterChange]
  );

  const maxW = maxWidth === 'content' ? 'max-w-content' : maxWidth === 'chat' ? 'max-w-chat' : 'max-w-full';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showSidebar && (
        <>
          <aside className="hidden w-[240px] shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
            <div className="px-4 py-4">
              <Logo />
            </div>
            <Sidebar
              activeFilter={filter}
              onFilterChange={handleFilterChange}
              storage={storage}
              onUploadClick={() => router.push('/files')}
              onAskAIClick={() => router.push('/ask')}
            />
          </aside>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="w-[260px] border-r border-border p-0">
              <div className="px-4 py-4">
                <Logo />
              </div>
              <Sidebar
                activeFilter={filter}
                onFilterChange={(f) => {
                  handleFilterChange(f);
                  setMobileNavOpen(false);
                }}
                storage={storage}
                onUploadClick={() => {
                  router.push('/files');
                  setMobileNavOpen(false);
                }}
                onAskAIClick={() => {
                  router.push('/ask');
                  setMobileNavOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border">
          {!showSidebar && (
            <button
              onClick={() => setMobileNavOpen(true)}
              className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground-secondary lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {showSidebar && (
            <button
              onClick={() => setMobileNavOpen(true)}
              className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground-secondary lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1">
            <Topbar user={user} onSearchClick={() => setCmdOpen(true)} />
          </div>
        </div>

        {sidebarContent && (
          <div className="hidden w-[260px] shrink-0 border-r border-border xl:flex xl:flex-col">
            {sidebarContent}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className={cn('mx-auto px-6 py-8', maxW)}>
              {children}
            </div>
          </main>
        </div>
      </div>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} files={files} folders={folders} />
    </div>
  );
}
