'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/app/app-shell';
import { Logo } from '@/components/app/logo';
import { ConversationList } from '@/components/shared/conversation-list';
import { ChatMessage } from '@/components/shared/chat-message';
import { ScopeSelector } from '@/components/shared/scope-selector';
import { EmptyState } from '@/components/shared/empty-state';
import { useChatStore } from '@/lib/stores/chat-store';
import { useScopeStore } from '@/lib/stores/scope-store';
import { listConversations, askQuestion, listFiles, listFolders } from '@/lib/api';
import { suggestedPrompts } from '@/lib/mock/data';
import { Plus, Send, Sparkles, MessageSquare } from 'lucide-react';
import type { FileItem, Folder, ChatMessage as ChatMessageType, Conversation } from '@/types';

export default function AskPage() {
  const router = useRouter();
  const {
    conversations,
    activeConversationId,
    setConversations,
    setActiveConversation,
    addConversation,
    addMessage,
    updateMessage,
  } = useChatStore();
  const { scope } = useScopeStore();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listFiles().then(setFiles);
    listFolders().then(setFolders);
    listConversations().then(setConversations);
  }, [setConversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const newConversation = useCallback((): Conversation => {
    const id = `conv_${Date.now()}`;
    return {
      id,
      title: 'New conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  const handleSend = async (question?: string) => {
    const text = (question || input).trim();
    if (!text || isStreaming) return;

    let convId: string = activeConversationId || '';
    let conv = activeConversation;

    if (!conv) {
      conv = newConversation();
      conv.title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
      convId = conv.id;
      addConversation(conv);
    }

    setInput('');

    const userMsg: ChatMessageType = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    addMessage(convId, userMsg);

    const assistantMsgId = `msg_${Date.now()}_a`;
    const assistantMsg: ChatMessageType = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    addMessage(convId, assistantMsg);
    setIsStreaming(true);

    try {
      const response = await askQuestion(text, convId, scope);

      const words = response.content.split(/(\s+)/);
      let currentContent = '';

      for (let i = 0; i < words.length; i++) {
        currentContent += words[i];
        if (i % 2 === 0 || i === words.length - 1) {
          updateMessage(convId, assistantMsgId, {
            content: currentContent,
          });
          await new Promise((r) => setTimeout(r, 20));
        }
      }

      const sourceFiles = response.sourceFileIds
        .map((fid) => files.find((f) => f.id === fid))
        .filter(Boolean) as FileItem[];

      updateMessage(convId, assistantMsgId, {
        content: response.content,
        citations: response.citations,
        sources: sourceFiles,
        isStreaming: false,
        notFound: response.notFound,
      });
    } catch {
      updateMessage(convId, assistantMsgId, {
        content: 'Something went wrong. Please try again.',
        isStreaming: false,
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversation(null);
    setInput('');
  };

  const showEmptyState = !activeConversation || messages.length === 0;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <Logo showText={false} />
        <button
          onClick={handleNewChat}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-surface hover:text-foreground"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="px-3 pb-2">
        <button
          onClick={handleNewChat}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)] transition-all hover:bg-surface active:translate-y-px active:shadow-none"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="px-3 py-1">
        <span className="px-3 text-xs uppercase tracking-wide text-foreground-tertiary">
          History
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <ConversationList onNewChat={handleNewChat} />
      </div>
    </div>
  );

  return (
    <AppShell showSidebar={false} maxWidth="chat" sidebarContent={sidebarContent}>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {showEmptyState ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-tint">
                <Sparkles className="h-8 w-8 text-accent" strokeWidth={1.5} />
              </div>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground text-balance">
                Ask anything about your files
              </h1>
              <p className="mb-8 max-w-md text-center text-sm text-foreground-secondary text-balance">
                I&apos;ll search through your indexed documents and answer with citations you can click to verify.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground-secondary transition-colors duration-150 hover:bg-surface hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  conversationId={activeConversation!.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <div className="mb-2 flex items-center gap-2">
            <ScopeSelector files={files} folders={folders} />
            <span className="text-xs text-foreground-tertiary">
              {files.filter((f) => f.indexStatus === 'indexed').length} files indexed
            </span>
          </div>
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-accent">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question about your files..."
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-foreground-tertiary"
              disabled={isStreaming}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-accent-hover active:translate-y-px active:shadow-none disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-foreground-tertiary">
            AskDrive searches your indexed files and cites its sources. Answers may be incomplete.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
