'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/app/app-shell';
import { FileCard } from '@/components/shared/file-card';
import { FileRow } from '@/components/shared/file-row';
import { UploadDropzone } from '@/components/shared/upload-dropzone';
import { EmptyState } from '@/components/shared/empty-state';
import { getFileIcon } from '@/lib/file-utils';
import { listFiles, listFolders } from '@/lib/api';
import { LayoutGrid, List, Folder as FolderIcon, ChevronRight, UploadCloud, FolderPlus } from 'lucide-react';
import type { FileItem, Folder } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUploadStore } from '@/lib/stores/upload-store';

type Filter = 'all' | 'recent' | 'starred' | 'trash';

export default function FilesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<Filter>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const { uploads } = useUploadStore();

  const loadData = useCallback(async (f: Filter, fid: string | null) => {
    setLoading(true);
    const folderFilter = f === 'recent' ? 'all' : f;
    const [fileData, folderData] = await Promise.all([
      listFiles({ filter: f, folderId: fid }),
      listFolders({ filter: folderFilter }),
    ]);
    setFiles(fileData);
    setFolders(folderData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const fid = searchParams.get('folder');
    const action = searchParams.get('action');
    setFolderId(fid);
    if (action === 'upload') setShowUpload(true);
    loadData(filter, fid);
  }, [searchParams, filter, loadData]);

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    router.push('/files');
    loadData(f, null);
  };

  const currentFolder = folders.find((f) => f.id === folderId);

  const sortedFolders = folderId ? [] : folders.filter((f) => !f.trashed);

  return (
    <AppShell activeFilter={filter} onFilterChange={handleFilterChange}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {filter === 'starred' ? 'Starred' : filter === 'trash' ? 'Trash' : filter === 'recent' ? 'Recent' : currentFolder ? currentFolder.name : 'My Files'}
            </h1>
            <p className="mt-1 text-sm text-foreground-secondary">
              {files.length + sortedFolders.length} {files.length + sortedFolders.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border p-0.5">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  view === 'grid' ? 'bg-surface text-foreground' : 'text-foreground-tertiary hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  view === 'list' ? 'bg-surface text-foreground' : 'text-foreground-tertiary hover:text-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => {
              setFolderId(null);
              router.push('/files');
              loadData(filter, null);
            }}
            className="text-foreground-secondary transition-colors hover:text-foreground"
          >
            Files
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-foreground-tertiary" />
              <span className="font-medium text-foreground">{currentFolder.name}</span>
            </>
          )}
        </nav>

        {uploads.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wide text-foreground-tertiary">
              Active uploads
            </span>
            <UploadDropzone compact />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl border border-border bg-surface">
                <div className="shimmer h-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : files.length === 0 && sortedFolders.length === 0 ? (
          <EmptyState
            emoji="📁"
            title={filter === 'trash' ? 'Trash is empty' : 'No files here yet'}
            description={
              filter === 'trash'
                ? 'Deleted files will appear here. You can restore them or empty the trash.'
                : 'Upload your first file to get started. AskDrive will index it so you can ask questions about it.'
            }
            action={
              filter !== 'trash' ? (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex h-8 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-accent-hover active:translate-y-px active:shadow-none"
                >
                  <UploadCloud className="h-4 w-4" /> Upload files
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {sortedFolders.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wide text-foreground-tertiary">Folders</span>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {sortedFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setFolderId(folder.id);
                        router.push(`/files?folder=${folder.id}`);
                        loadData(filter, folder.id);
                      }}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors duration-150 hover:bg-surface"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                        <FolderIcon className="h-5 w-5 text-foreground-secondary" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{folder.name}</p>
                        <p className="font-mono text-xs tabular-nums text-foreground-tertiary">
                          {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-3">
                {sortedFolders.length > 0 && (
                  <span className="text-xs uppercase tracking-wide text-foreground-tertiary">Files</span>
                )}
                {view === 'grid' ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {files.map((file) => (
                      <FileCard key={file.id} file={file} />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-surface">
                          <th className="py-2.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary">Name</th>
                          <th className="hidden py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary md:table-cell">Type</th>
                          <th className="hidden py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary sm:table-cell">Size</th>
                          <th className="hidden py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary lg:table-cell">Modified</th>
                          <th className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary">Status</th>
                          <th className="hidden py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-tertiary lg:table-cell">Shared</th>
                          <th className="py-2.5 pr-4 pl-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((file) => (
                          <FileRow key={file.id} file={file} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload files</DialogTitle>
            <DialogDescription>
              Drag and drop or browse to upload. Files will be automatically indexed for AI search.
            </DialogDescription>
          </DialogHeader>
          <UploadDropzone />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
