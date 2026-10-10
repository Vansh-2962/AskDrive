'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/app/app-shell';
import { IndexStatusBadge } from '@/components/shared/index-status-badge';
import { getFileIcon, getFileTypeLabel } from '@/lib/file-utils';
import { formatFileSizeShort, formatDate } from '@/lib/utils-format';
import { listFiles, getUser, reindexFile } from '@/lib/api';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Check, Sun, Moon, Monitor } from 'lucide-react';
import type { FileItem, User } from '@/types';

export default function SettingsPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [reindexing, setReindexing] = useState<string | null>(null);
  const [reindexedId, setReindexedId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    listFiles().then(setFiles);
    getUser().then(setUser);
  }, []);

  const handleReindex = async (fileId: string) => {
    setReindexing(fileId);
    await reindexFile(fileId);
    setReindexing(null);
    setReindexedId(fileId);
    setTimeout(() => setReindexedId(null), 2000);
  };

  const indexedCount = files.filter((f) => f.indexStatus === 'indexed').length;
  const processingCount = files.filter((f) => f.indexStatus === 'processing').length;
  const failedCount = files.filter((f) => f.indexStatus === 'failed').length;
  const totalChunks = files.reduce((sum, f) => sum + f.chunkCount, 0);

  return (
    <AppShell maxWidth="content">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Manage your profile, file indexing, and appearance.
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="h-auto bg-surface p-1">
            <TabsTrigger
              value="profile"
              className="rounded-md px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="indexing"
              className="rounded-md px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              Indexing
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="rounded-md px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="max-w-lg space-y-6">
              <div className="rounded-xl border border-border bg-background p-6">
                <h2 className="mb-1 text-base font-semibold text-foreground">Profile</h2>
                <p className="mb-4 text-sm text-foreground-secondary">
                  Your personal information and account details.
                </p>

                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-medium text-white">
                    {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-sm text-foreground-tertiary">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Full name</label>
                    <input
                      defaultValue={user?.name}
                      className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      defaultValue={user?.email}
                      disabled
                      className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground-tertiary outline-none"
                    />
                  </div>
                  <button className="flex h-8 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-accent-hover active:translate-y-px active:shadow-none">
                    Save changes
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-status-failed/30 bg-status-failed/5 p-6">
                <h2 className="mb-1 text-base font-semibold text-foreground">Danger zone</h2>
                <p className="mb-4 text-sm text-foreground-secondary">
                  Permanently delete your account and all associated data.
                </p>
                <button className="flex h-8 items-center justify-center gap-2 rounded-lg border border-status-failed bg-background px-5 text-sm font-medium text-status-failed shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all hover:bg-status-failed/5 active:translate-y-px">
                  Delete account
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="indexing" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-foreground-tertiary">Total files</p>
                  <p className="mt-1 font-mono text-xl tabular-nums text-foreground">{files.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-foreground-tertiary">Indexed</p>
                  <p className="mt-1 font-mono text-xl tabular-nums text-status-indexed">{indexedCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-foreground-tertiary">Processing</p>
                  <p className="mt-1 font-mono text-xl tabular-nums text-status-processing">{processingCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-foreground-tertiary">Total chunks</p>
                  <p className="mt-1 font-mono text-xl tabular-nums text-foreground">{totalChunks}</p>
                </div>
              </div>

              {failedCount > 0 && (
                <div className="rounded-lg border border-status-failed/30 bg-status-failed/5 px-4 py-3 text-sm text-status-failed">
                  {failedCount} file{failedCount > 1 ? 's' : ''} failed to index. Try re-indexing them below.
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="py-2.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary">File</th>
                      <th className="hidden py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary sm:table-cell">Size</th>
                      <th className="hidden py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary lg:table-cell">Modified</th>
                      <th className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary">Status</th>
                      <th className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary">Chunks</th>
                      <th className="py-2.5 pr-4 pl-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-tertiary">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => {
                      const { icon: Icon, color } = getFileIcon(file.type);
                      return (
                        <tr key={file.id} className="border-b border-border transition-colors hover:bg-surface">
                          <td className="py-2.5 pl-4 pr-3">
                            <div className="flex items-center gap-2.5">
                              <Icon className={cn('h-4 w-4 shrink-0', color)} strokeWidth={1.5} />
                              <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
                            </div>
                          </td>
                          <td className="hidden py-2.5 px-3 sm:table-cell">
                            <span className="font-mono text-xs tabular-nums text-foreground-secondary">
                              {formatFileSizeShort(file.size)}
                            </span>
                          </td>
                          <td className="hidden py-2.5 px-3 lg:table-cell">
                            <span className="font-mono text-xs tabular-nums text-foreground-secondary">
                              {formatDate(file.modifiedAt)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <IndexStatusBadge status={file.indexStatus} />
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs tabular-nums text-foreground-secondary">
                              {file.chunkCount > 0 ? file.chunkCount : '—'}
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 pl-3 text-right">
                            <button
                              onClick={() => handleReindex(file.id)}
                              disabled={reindexing === file.id}
                              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-surface active:translate-y-px active:shadow-none disabled:opacity-50"
                            >
                              {reindexing === file.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : reindexedId === file.id ? (
                                <Check className="h-3 w-3 text-status-indexed" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              {reindexing === file.id ? 'Indexing...' : reindexedId === file.id ? 'Done' : 'Re-index'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <div className="max-w-lg space-y-6">
              <div className="rounded-xl border border-border bg-background p-6">
                <h2 className="mb-1 text-base font-semibold text-foreground">Theme</h2>
                <p className="mb-4 text-sm text-foreground-secondary">
                  Choose how AskDrive looks to you.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border p-4 transition-all active:translate-y-px',
                      theme === 'light'
                        ? 'border-accent bg-accent-tint'
                        : 'border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-surface'
                    )}
                  >
                    <Sun className={cn('h-5 w-5', theme === 'light' ? 'text-accent' : 'text-foreground-secondary')} />
                    <span className="text-sm font-medium text-foreground">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border p-4 transition-all active:translate-y-px',
                      theme === 'dark'
                        ? 'border-accent bg-accent-tint'
                        : 'border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-surface'
                    )}
                  >
                    <Moon className={cn('h-5 w-5', theme === 'dark' ? 'text-accent' : 'text-foreground-secondary')} />
                    <span className="text-sm font-medium text-foreground">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border p-4 transition-all active:translate-y-px',
                      theme === 'system'
                        ? 'border-accent bg-accent-tint'
                        : 'border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-surface'
                    )}
                  >
                    <Monitor className={cn('h-5 w-5', theme === 'system' ? 'text-accent' : 'text-foreground-secondary')} />
                    <span className="text-sm font-medium text-foreground">System</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-6">
                <h2 className="mb-1 text-base font-semibold text-foreground">Preferences</h2>
                <p className="mb-4 text-sm text-foreground-secondary">
                  Control how AskDrive behaves.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto-index new uploads</p>
                      <p className="text-xs text-foreground-tertiary">Automatically index files after upload</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Show storage usage in sidebar</p>
                      <p className="text-xs text-foreground-tertiary">Display how much storage you&apos;re using</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Compact file list</p>
                      <p className="text-xs text-foreground-tertiary">Show more files per screen in list view</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
