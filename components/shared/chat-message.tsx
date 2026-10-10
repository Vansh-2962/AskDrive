'use client';

import { cn } from '@/lib/utils';
import { CitationChip } from '@/components/shared/citation-chip';
import { SourceCard } from '@/components/shared/source-card';
import { useChatStore } from '@/lib/stores/chat-store';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  conversationId: string;
}

function renderContent(content: string, citations?: ChatMessageType['citations']) {
  if (!citations || citations.length === 0) {
    return renderMarkdown(content);
  }

  let parts = content.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      const index = parseInt(match[1], 10) - 1;
      const citation = citations[index];
      if (citation) {
        return <CitationChip key={i} citation={citation} index={index} />;
      }
    }
    return <span key={i}>{renderMarkdown(part)}</span>;
  });
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-3 font-mono text-xs tabular-nums text-foreground"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith('- ') || line.match(/^\d+\./)) {
      const isOrdered = !!line.match(/^\d+\./);
      const content = line.replace(/^(- |\d+\.\s)/, '');
      elements.push(
        <div key={`li-${i}`} className={cn('flex gap-2 my-0.5', isOrdered && 'gap-1')}>
          {isOrdered ? (
            <span className="font-mono text-xs tabular-nums text-foreground-tertiary mt-0.5">
              {line.match(/^(\d+)\./)?.[1]}.
            </span>
          ) : (
            <span className="text-foreground-tertiary mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground-tertiary" />
          )}
          <span className="text-sm text-foreground">{renderInlineFormatting(content)}</span>
        </div>
      );
      return;
    }

    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      return;
    }

    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre
        key="code-final"
        className="my-2 overflow-x-auto rounded-lg border border-border bg-surface p-3 font-mono text-xs text-foreground"
      >
        <code>{codeLines.join('\n')}</code>
      </pre>
    );
  }

  return elements;
}

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatMessage({ message, conversationId }: ChatMessageProps) {
  const { setMessageFeedback } = useChatStore();
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (feedback: 'up' | 'down') => {
    if (feedback === 'down') {
      if (message.feedback === 'down') {
        setMessageFeedback(conversationId, message.id, null);
      } else {
        setShowFeedback(true);
      }
    } else {
      setMessageFeedback(
        conversationId,
        message.id,
        message.feedback === 'up' ? null : 'up'
      );
    }
  };

  const submitFeedback = () => {
    setMessageFeedback(conversationId, message.id, 'down', feedbackNote);
    setShowFeedback(false);
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] rounded-xl rounded-br-sm bg-accent px-4 py-3 text-sm font-medium text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z M8 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {message.notFound ? (
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-status-processing" />
              <span className="text-sm font-medium text-foreground">Not found in your files</span>
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-foreground-secondary">
              {renderContent(message.content, message.citations)}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {renderContent(message.content, message.citations)}
          </div>
        )}

        {message.isStreaming && (
          <span className="inline-flex h-4 w-2 animate-pulse bg-foreground-tertiary" />
        )}

        {message.sources && message.sources.length > 0 && !message.isStreaming && (
          <div className="space-y-2 pt-2">
            <span className="text-xs uppercase tracking-wide text-foreground-tertiary">
              Sources
            </span>
            <div className="grid gap-2">
              {message.sources.map((source, i) => (
                <SourceCard
                  key={source.id}
                  file={source}
                  page={message.citations?.find((c) => c.fileId === source.id)?.page}
                />
              ))}
            </div>
          </div>
        )}

        {!message.isStreaming && (
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={handleCopy}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-tertiary transition-colors duration-150 hover:bg-surface hover:text-foreground"
              title="Copy"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-status-indexed" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-tertiary transition-colors duration-150 hover:bg-surface hover:text-foreground"
              title="Regenerate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
              onClick={() => handleFeedback('up')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150',
                message.feedback === 'up'
                  ? 'text-accent'
                  : 'text-foreground-tertiary hover:bg-surface hover:text-foreground'
              )}
              title="Good answer"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('down')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150',
                message.feedback === 'down'
                  ? 'text-destructive'
                  : 'text-foreground-tertiary hover:bg-surface hover:text-foreground'
              )}
              title="Bad answer"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {showFeedback && (
          <div className="rounded-lg border border-border bg-surface p-3 animate-fade-in">
            <p className="mb-2 text-xs text-foreground-secondary">
              What was wrong with this answer?
            </p>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Optional — tell us how to improve"
              className="mb-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFeedback(false)}
                className="rounded-md px-3 py-1.5 text-xs text-foreground-secondary transition-colors hover:bg-hover"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="rounded-md bg-foreground px-4 py-1 text-xs font-medium text-background shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_-1px_0_rgba(0,0,0,0.12)] transition-all hover:opacity-90 active:translate-y-px active:shadow-none"
              >
                Submit feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
