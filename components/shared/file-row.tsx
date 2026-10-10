'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileTypeLabel } from '@/lib/file-utils';
import { formatFileSizeShort, formatDate } from '@/lib/utils-format';
import { IndexStatusBadge } from '@/components/shared/index-status-badge';
import { AvatarGroup } from '@/components/shared/avatar-group';
import type { FileItem } from '@/types';
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

interface FileRowProps {
  file: FileItem;
  onRename?: (file: FileItem) => void;
  onStar?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  onMove?: (file: FileItem) => void;
}

export function FileRow({ file, onRename, onStar, onDelete, onMove }: FileRowProps) {
  const { icon: Icon, color } = getFileIcon(file.type);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <tr
            className="group cursor-pointer border-b border-border transition-colors duration-150 hover:bg-surface"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/files/${file.id}`;
            }}
          >
            <td className="py-3 pl-4 pr-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                  <Icon className={cn('h-4 w-4', color)} strokeWidth={1.5} />
                </div>
                <span className="truncate text-sm font-medium text-foreground">
                  {file.name}
                </span>
                {file.starred && (
                  <svg className="h-3.5 w-3.5 shrink-0 fill-foreground-tertiary" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
              </div>
            </td>
            <td className="hidden py-3 px-3 md:table-cell">
              <span className="font-mono text-xs tabular-nums text-foreground-secondary">
                {getFileTypeLabel(file.type)}
              </span>
            </td>
            <td className="hidden py-3 px-3 sm:table-cell">
              <span className="font-mono text-xs tabular-nums text-foreground-secondary">
                {formatFileSizeShort(file.size)}
              </span>
            </td>
            <td className="hidden py-3 px-3 lg:table-cell">
              <span className="font-mono text-xs tabular-nums text-foreground-secondary">
                {formatDate(file.modifiedAt)}
              </span>
            </td>
            <td className="py-3 px-3">
              <IndexStatusBadge status={file.indexStatus} />
            </td>
            <td className="hidden py-3 px-3 lg:table-cell">
              {file.sharedWith.length > 0 ? (
                <AvatarGroup users={file.sharedWith} size={22} max={2} />
              ) : (
                <span className="text-xs text-foreground-tertiary">—</span>
              )}
            </td>
            <td className="py-3 pr-4 pl-3 text-right">
              <span className="text-xs text-foreground-tertiary opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                ···
              </span>
            </td>
          </tr>
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
