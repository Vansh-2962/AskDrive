'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileTypeLabel } from '@/lib/file-utils';
import { formatFileSizeShort, formatRelativeTime } from '@/lib/utils-format';
import { IndexStatusBadge } from '@/components/shared/index-status-badge';
import { AvatarGroup } from '@/components/shared/avatar-group';
import { FileText } from 'lucide-react';
import type { FileItem } from '@/types';
import { useUploadStore } from '@/lib/stores/upload-store';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Star, FolderOpen, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FileCardProps {
  file: FileItem;
  onRename?: (file: FileItem) => void;
  onStar?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  onMove?: (file: FileItem) => void;
}

export function FileCard({ file, onRename, onStar, onDelete, onMove }: FileCardProps) {
  const { icon: Icon, color } = getFileIcon(file.type);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Link
            href={`/files/${file.id}`}
            className="group block rounded-xl border border-border bg-background p-4 transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon className={cn('h-5 w-5', color)} strokeWidth={1.5} />
              </div>
              {file.starred && (
                <svg className="h-4 w-4 fill-foreground-tertiary" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </div>
            <p className="mb-1 truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            <div className="mb-3 flex items-center gap-2 text-xs text-foreground-tertiary">
              <span className="font-mono tabular-nums">{getFileTypeLabel(file.type)}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{formatFileSizeShort(file.size)}</span>
            </div>
            <div className="flex items-center justify-between">
              <IndexStatusBadge status={file.indexStatus} compact={file.indexStatus === 'indexed'} />
              {file.sharedWith.length > 0 && (
                <AvatarGroup users={file.sharedWith} size={20} />
              )}
            </div>
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem asChild>
            <Link href={`/files/${file.id}`} className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" /> Open
            </Link>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onRename?.(file)}>
            <Pencil className="mr-2 h-4 w-4" /> Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onStar?.(file)}>
            <Star className="mr-2 h-4 w-4" /> {file.starred ? 'Unstar' : 'Star'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onMove?.(file)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Move
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move &ldquo;{file.name}&rdquo; to trash. You can restore it later from the Trash folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete?.(file)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
