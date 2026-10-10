'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/app/app-shell';
import { PdfViewerPlaceholder } from '@/components/shared/pdf-viewer-placeholder';
import { IndexStatusBadge } from '@/components/shared/index-status-badge';
import { AvatarGroup } from '@/components/shared/avatar-group';
import { HoverCardPreview } from '@/components/shared/hover-card-preview';
import { getFileIcon, getFileTypeLabel } from '@/lib/file-utils';
import { formatFileSizeShort, formatDate, formatTime } from '@/lib/utils-format';
import { getFile, askQuestion } from '@/lib/api';
import { ChevronRight, Star, Download, Share2, Send, Sparkles, Copy, Check } from 'lucide-react';
import type { FileItem, ChatMessage as ChatMessageType } from '@/types';

interface MiniMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function FilePreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [miniMessages, setMiniMessages] = useState<MiniMessage[]>([]);
  const [miniInput, setMiniInput] = useState('');
  const [miniStreaming, setMiniStreaming] = useState(false);
  const [starred, setStarred] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFile(params.id).then((f) => {
      setFile(f);
      setStarred(f?.starred || false);
      setLoading(false);
    });
  }, [params.id]);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) setPage(parseInt(pageParam, 10));
  }, [searchParams]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [miniMessages]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      router.push(`/files/${params.id}?page=${newPage}`);
    },
    [params.id, router]
  );

  const handleMiniAsk = async () => {
    const text = miniInput.trim();
    if (!text || miniStreaming) return;

    const userMsg: MiniMessage = {
      id: `mini_${Date.now()}_u`,
      role: 'user',
      content: text,
    };
    const assistantId = `mini_${Date.now()}_a`;
    const assistantMsg: MiniMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMiniMessages((prev) => [...prev, userMsg, assistantMsg]);
    setMiniInput('');
    setMiniStreaming(true);

    try {
      const response = await askQuestion(text, 'mini', {
        type: 'files',
        fileIds: [params.id],
        label: file?.name || 'this file',
      });

      const words = response.content.split(/(\s+)/);
      let current = '';

      for (let i = 0; i < words.length; i++) {
        current += words[i];
        if (i % 2 === 0 || i === words.length - 1) {
          setMiniMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: current } : m))
          );
          await new Promise((r) => setTimeout(r, 20));
        }
      }

      setMiniMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: response.content, isStreaming: false } : m
        )
      );
    } catch {
      setMiniMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: 'Something went wrong.', isStreaming: false } : m
        )
      );
    } finally {
      setMiniStreaming(false);
    }
  };

  if (loading) {
    return (
      <AppShell showSidebar={false} maxWidth="full">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      </AppShell>
    );
  }

  if (!file) {
    return (
      <AppShell showSidebar={false} maxWidth="full">
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <p className="text-2xl font-semibold tracking-tight">File not found</p>
          <p className="mt-2 text-sm text-foreground-secondary">
            This file may have been deleted or moved.
          </p>
          <button
            onClick={() => router.push('/files')}
            className="mt-6 inline-flex h-8 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-accent-hover active:translate-y-px active:shadow-none"
          >
            Back to files
          </button>
        </div>
      </AppShell>
    );
  }

  const { icon: Icon, color } = getFileIcon(file.type);
  const totalPages = file.pageCount || 1;
  const highlightSnippet = searchParams.get('page')
    ? 'Total Amount Due: $48,250.00'
    : undefined;

  return (
    <AppShell showSidebar={false} maxWidth="full">
      <div className="flex h-[calc(100vh-64px)] gap-6">
        <div className="flex flex-1 flex-col">
          <nav className="mb-4 flex items-center gap-1.5 text-sm">
            <button
              onClick={() => router.push('/files')}
              className="text-foreground-secondary transition-colors hover:text-foreground"
            >
              Files
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-foreground-tertiary" />
            <span className="truncate font-medium text-foreground">{file.name}</span>
          </nav>

          <PdfViewerPlaceholder
            fileName={file.name}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
            highlightSnippet={highlightSnippet}
            className="flex-1"
          />
        </div>

        <div className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto xl:flex">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon className={cn('h-5 w-5', color)} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <HoverCardPreview file={file}>
                  <p className="cursor-pointer truncate text-sm font-semibold text-foreground hover:text-accent">
                    {file.name}
                  </p>
                </HoverCardPreview>
                <p className="font-mono text-xs tabular-nums text-foreground-tertiary">
                  {getFileTypeLabel(file.type)} · {formatFileSizeShort(file.size)}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <IndexStatusBadge status={file.indexStatus} />
              {file.chunkCount > 0 && (
                <span className="font-mono text-xs tabular-nums text-foreground-tertiary">
                  {file.chunkCount} chunks
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStarred(!starred)}
                className={cn(
                  'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-all active:translate-y-px',
                  starred
                    ? 'border-accent bg-accent-tint text-accent'
                    : 'border-border bg-background text-foreground-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-surface'
                )}
              >
                <Star className={cn('h-3.5 w-3.5', starred && 'fill-current')} />
                {starred ? 'Starred' : 'Star'}
              </button>
              <button
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-surface active:translate-y-px"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-status-indexed" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-surface active:translate-y-px">
                <Download className="h-3.5 w-3.5" />
              </button>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground-secondary shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-surface active:translate-y-px">
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground-tertiary">
              Details
            </h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Owner</dt>
                <dd className="font-medium text-foreground">{file.owner}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Modified</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {formatDate(file.modifiedAt)}
                </dd>
              </div>
              {file.pageCount && (
                <div className="flex justify-between">
                  <dt className="text-foreground-secondary">Pages</dt>
                  <dd className="font-mono tabular-nums text-foreground">{file.pageCount}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">Size</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {formatFileSizeShort(file.size)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-secondary">File ID</dt>
                <dd className="font-mono tabular-nums text-foreground-tertiary">{file.id}</dd>
              </div>
              {file.sharedWith.length > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-foreground-secondary">Shared with</dt>
                  <dd>
                    <AvatarGroup users={file.sharedWith} size={22} max={3} />
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-background">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
              <span className="text-sm font-medium text-foreground">Ask about this file</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '300px' }}>
              {miniMessages.length === 0 ? (
                <p className="text-xs text-foreground-tertiary">
                  Ask any question about the contents of this file.
                </p>
              ) : (
                <div className="space-y-3">
                  {miniMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={msg.role === 'user' ? 'flex justify-end' : 'flex gap-2'}
                    >
                      {msg.role === 'user' ? (
                        <span className="max-w-[85%] rounded-lg rounded-br-sm bg-accent px-3 py-2 text-xs font-medium text-white">
                          {msg.content}
                        </span>
                      ) : (
                        <span className="text-xs leading-relaxed text-foreground">
                          {msg.content}
                          {msg.isStreaming && (
                            <span className="ml-0.5 inline-flex h-3 w-1 animate-pulse bg-foreground-tertiary" />
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-lg border border-border bg-background px-2 py-1.5 focus-within:border-accent">
                <input
                  value={miniInput}
                  onChange={(e) => setMiniInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleMiniAsk();
                  }}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-foreground-tertiary"
                  disabled={miniStreaming}
                />
                <button
                  onClick={handleMiniAsk}
                  disabled={!miniInput.trim() || miniStreaming}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-white transition-all hover:bg-accent-hover disabled:opacity-40 active:translate-y-px"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
