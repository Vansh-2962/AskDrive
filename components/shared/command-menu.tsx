'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useTheme } from 'next-themes';
import { Upload, FolderPlus, Sparkles, Sun, Moon, FileText, Search, Folder as FolderIcon } from 'lucide-react';
import type { FileItem, Folder } from '@/types';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileItem[];
  folders: Folder[];
}

export function CommandMenu({ open, onOpenChange, files, folders }: CommandMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search files, folders, or actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => router.push('/files?action=upload'))}>
            <Upload className="mr-2 h-4 w-4" /> Upload file
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push('/files?action=newfolder'))}>
            <FolderPlus className="mr-2 h-4 w-4" /> New folder
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push('/ask'))}>
            <Sparkles className="mr-2 h-4 w-4" /> Ask AI a question
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="mr-2 h-4 w-4" /> Switch to light mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" /> Switch to dark mode
              </>
            )}
          </CommandItem>
        </CommandGroup>

        {folders.length > 0 && (
          <CommandGroup heading="Folders">
            {folders.slice(0, 6).map((folder) => (
              <CommandItem
                key={folder.id}
                onSelect={() => run(() => router.push(`/files?folder=${folder.id}`))}
              >
                <FolderIcon className="mr-2 h-4 w-4" /> {folder.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {files.length > 0 && (
          <CommandGroup heading="Files">
            {files.slice(0, 8).map((file) => (
              <CommandItem
                key={file.id}
                onSelect={() => run(() => router.push(`/files/${file.id}`))}
              >
                <FileText className="mr-2 h-4 w-4" /> {file.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
