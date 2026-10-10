'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useState } from 'react';

interface PdfViewerPlaceholderProps {
  fileName: string;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  highlightSnippet?: string;
  className?: string;
}

export function PdfViewerPlaceholder({
  fileName,
  totalPages,
  currentPage,
  onPageChange,
  highlightSnippet,
  className,
}: PdfViewerPlaceholderProps) {
  const page = Math.max(1, Math.min(currentPage, totalPages));

  return (
    <div className={cn('flex flex-col rounded-xl border border-border bg-background', className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-foreground-secondary" strokeWidth={1.5} />
          <span className="truncate text-sm font-medium text-foreground">{fileName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-tertiary transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs tabular-nums text-foreground-secondary">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-tertiary transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-surface p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-background p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs uppercase tracking-wide text-foreground-tertiary">
              Page {page}
            </span>
            <span className="font-mono text-xs tabular-nums text-foreground-tertiary">
              {fileName}
            </span>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                {highlightSnippet && i === 3 ? (
                  <p className="text-xs leading-relaxed text-foreground">
                    {mockParagraph(i, page).split(highlightSnippet)[0]}
                    <span className="highlight-snippet">{highlightSnippet}</span>
                    {mockParagraph(i, page).split(highlightSnippet)[1]}
                  </p>
                ) : (
                  <>
                    <div className="h-2.5 w-full rounded bg-border" style={{ opacity: 0.5 + (i % 3) * 0.15 }} />
                    <div className="h-2.5 w-[92%] rounded bg-border" style={{ opacity: 0.4 + (i % 3) * 0.15 }} />
                    <div className="h-2.5 w-[85%] rounded bg-border" style={{ opacity: 0.35 + (i % 3) * 0.15 }} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function mockParagraph(index: number, page: number): string {
  const texts = [
    `This document outlines the terms and conditions applicable as of page ${page}. The parties acknowledge and agree to the provisions set forth herein.`,
    `Total Amount Due: $48,250.00 — Professional Services: $42,000.00, Infrastructure Setup: $6,250.00. Payment is due within 30 days of invoice date.`,
    `The term of this Agreement shall commence on January 1, 2026 and continue for twenty-four (24) months unless terminated as provided herein.`,
    `Service Level Credits: In the event uptime falls below 99.5%, Provider shall issue service credits as follows.`,
    `Each party agrees to maintain the confidentiality of all proprietary information disclosed during the term of this Agreement.`,
    `The annual budget allocation for ${page <= 5 ? 'Engineering' : 'Operations'} department is estimated at ${page <= 5 ? '$480,000' : '$240,000'} representing ${page <= 5 ? '40%' : '20%'} of total expenditure.`,
    `Vendor Comparison: Acme $48,250, Globex $12,800, Initech $180,000, Hooli $22,000. Initech provides the highest service tier.`,
    `All notices shall be in writing and delivered to the addresses specified in Schedule A. Electronic delivery is permitted with confirmation.`,
  ];
  return texts[index % texts.length];
}
