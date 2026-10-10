'use client';

import { cn } from '@/lib/utils';
import { useScopeStore } from '@/lib/stores/scope-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Files, Folder, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';
import type { FileItem, Folder } from '@/types';

interface ScopeSelectorProps {
  files: FileItem[];
  folders: Folder[];
  className?: string;
}

export function ScopeSelector({ files, folders, className }: ScopeSelectorProps) {
  const { scope, setScope } = useScopeStore();
  const [open, setOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const indexedFiles = files.filter((f) => f.indexStatus === 'indexed');

  const selectAll = () => {
    setScope({ type: 'all', label: 'All files' });
    setOpen(false);
  };

  const selectFolder = (folder: Folder) => {
    setScope({ type: 'folder', folderId: folder.id, label: folder.name });
    setOpen(false);
  };

  const toggleFile = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId];
      return next;
    });
  };

  const applyFileSelection = () => {
    if (selectedFileIds.length > 0) {
      const selected = files.filter((f) => selectedFileIds.includes(f.id));
      setScope({
        type: 'files',
        fileIds: selectedFileIds,
        label: `${selectedFileIds.length} file${selectedFileIds.length > 1 ? 's' : ''} selected`,
      });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)] transition-all duration-150 hover:bg-surface active:translate-y-px active:shadow-none',
            className
          )}
        >
          <Files className="h-4 w-4 text-foreground-secondary" strokeWidth={1.5} />
          <span className="max-w-[180px] truncate">{scope.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-foreground-tertiary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="space-y-1">
          <button
            onClick={selectAll}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface',
              scope.type === 'all' && 'bg-surface'
            )}
          >
            <span className="flex items-center gap-2 font-medium">
              <Files className="h-4 w-4 text-foreground-secondary" /> All files
            </span>
            {scope.type === 'all' && <Check className="h-4 w-4 text-accent" />}
          </button>

          <div className="px-3 py-1.5">
            <span className="text-xs uppercase tracking-wide text-foreground-tertiary">Folders</span>
          </div>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => selectFolder(folder)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface',
                scope.type === 'folder' && scope.folderId === folder.id && 'bg-surface'
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <Folder className="h-4 w-4 text-foreground-secondary" /> {folder.name}
              </span>
              {scope.type === 'folder' && scope.folderId === folder.id && (
                <Check className="h-4 w-4 shrink-0 text-accent" />
              )}
            </button>
          ))}

          <div className="px-3 py-1.5">
            <span className="text-xs uppercase tracking-wide text-foreground-tertiary">Select files</span>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {indexedFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => toggleFile(file.id)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface"
              >
                {selectedFileIds.includes(file.id) ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-foreground-tertiary" />
                )}
                <span className="truncate text-foreground-secondary">{file.name}</span>
              </button>
            ))}
          </div>
          {selectedFileIds.length > 0 && (
            <button
              onClick={applyFileSelection}
              className="mt-2 flex h-8 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-accent-hover active:translate-y-px active:shadow-none"
            >
              Apply ({selectedFileIds.length} selected)
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
