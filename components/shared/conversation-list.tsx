'use client';

import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { formatRelativeTime } from '@/lib/utils-format';
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';
import type { Conversation } from '@/types';

interface ConversationListProps {
  onNewChat?: () => void;
  className?: string;
}

export function ConversationList({ onNewChat, className }: ConversationListProps) {
  const { conversations, activeConversationId, setActiveConversation, renameConversation, deleteConversation } = useChatStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleRename = (conv: Conversation) => {
    setRenameId(conv.id);
    setRenameValue(conv.title);
  };

  const applyRename = () => {
    if (renameId && renameValue.trim()) {
      renameConversation(renameId, renameValue.trim());
    }
    setRenameId(null);
    setRenameValue('');
  };

  const confirmDelete = () => {
    if (deleteId) deleteConversation(deleteId);
    setDeleteId(null);
  };

  return (
    <div className={cn('space-y-1', className)}>
      {conversations.length === 0 ? (
        <p className="px-3 py-8 text-center text-xs text-foreground-tertiary">
          No conversations yet
        </p>
      ) : (
        conversations.map((conv) => (
          <ContextMenu key={conv.id}>
            <ContextMenuTrigger asChild>
              <div
                onClick={() => setActiveConversation(conv.id)}
                className={cn(
                  'group flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                  activeConversationId === conv.id
                    ? 'bg-surface font-medium text-foreground'
                    : 'text-foreground-secondary hover:bg-surface hover:text-foreground'
                )}
              >
                <MessageSquare
                  className={cn(
                    'h-4 w-4 shrink-0',
                    activeConversationId === conv.id ? 'text-accent' : 'text-foreground-tertiary'
                  )}
                  strokeWidth={1.5}
                />
                <div className="min-w-0 flex-1">
                  {renameId === conv.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={applyRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') applyRename();
                        if (e.key === 'Escape') {
                          setRenameId(null);
                          setRenameValue('');
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-sm outline-none focus:border-accent"
                    />
                  ) : (
                    <p className="truncate">{conv.title}</p>
                  )}
                </div>
                <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-foreground-tertiary sm:block">
                  {formatRelativeTime(conv.updatedAt)}
                </span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-44">
              <ContextMenuItem onClick={() => handleRename(conv)}>
                <Pencil className="mr-2 h-4 w-4" /> Rename
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => setDeleteId(conv.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This conversation and all its messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
