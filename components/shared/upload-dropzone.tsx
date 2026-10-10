'use client';

import { cn } from '@/lib/utils';
import { useUploadStore } from '@/lib/stores/upload-store';
import { getFileTypeLabel } from '@/lib/file-utils';
import { formatFileSizeShort } from '@/lib/utils-format';
import { UploadCloud, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { FileType } from '@/types';

interface UploadDropzoneProps {
  className?: string;
  compact?: boolean;
}

function detectFileType(fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'docx';
  if (ext === 'xls' || ext === 'xlsx') return 'xlsx';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'webp') return 'image';
  if (ext === 'csv') return 'csv';
  return 'txt';
}

export function UploadDropzone({ className, compact }: UploadDropzoneProps) {
  const { isDragging, setDragging, addUploads, uploads, clearCompleted } = useUploadStore();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: f.size,
      type: detectFileType(f.name),
    }));
    if (files.length > 0) addUploads(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      size: f.size,
      type: detectFileType(f.name),
    }));
    if (files.length > 0) addUploads(files);
  };

  const activeUploads = uploads.filter((u) => u.status !== 'done');
  const doneUploads = uploads.filter((u) => u.status === 'done');

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {uploads.length === 0 ? null : (
          <>
            {uploads.slice(-5).map((upload) => (
              <div key={upload.id} className="rounded-lg border border-border bg-surface px-3 py-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="truncate font-medium text-foreground">{upload.fileName}</span>
                  <span className="font-mono tabular-nums text-foreground-tertiary">
                    {formatFileSizeShort(upload.fileSize)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-200"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <span className="font-mono tabular-nums text-xs text-foreground-tertiary">
                    {Math.round(upload.progress)}%
                  </span>
                  {upload.status === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-status-indexed" />}
                  {upload.status === 'processing' && <Loader2 className="h-3.5 w-3.5 animate-spin text-status-processing" />}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150',
          isDragging
            ? 'border-accent bg-accent-tint'
            : 'border-border bg-surface hover:border-border-strong'
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint">
          <UploadCloud className="h-6 w-6 text-accent" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-foreground">
          Drag and drop files here
        </p>
        <p className="mt-1 text-xs text-foreground-secondary">
          or click to browse from your computer
        </p>
        <label className="mt-4 cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <span className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)] transition-all duration-150 hover:bg-surface active:translate-y-px active:shadow-none">
            Select files
          </span>
        </label>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-foreground-tertiary">
              Uploads ({uploads.length})
            </span>
            {doneUploads.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-foreground-secondary transition-colors hover:text-foreground"
              >
                Clear completed
              </button>
            )}
          </div>
          {uploads.map((upload) => (
            <div key={upload.id} className="rounded-lg border border-border bg-background px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs tabular-nums text-foreground-tertiary">
                    {getFileTypeLabel(upload.fileType)}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {upload.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-xs text-foreground-tertiary">
                    {formatFileSizeShort(upload.fileSize)}
                  </span>
                  {upload.status === 'done' && <CheckCircle2 className="h-4 w-4 text-status-indexed" />}
                  {upload.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-status-processing" />}
                  {upload.status === 'error' && <AlertCircle className="h-4 w-4 text-status-failed" />}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-200',
                      upload.status === 'error' ? 'bg-status-failed' : 'bg-accent'
                    )}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                <span className="font-mono tabular-nums text-xs text-foreground-tertiary">
                  {upload.status === 'done'
                    ? 'Done'
                    : upload.status === 'processing'
                    ? 'Indexing...'
                    : upload.status === 'error'
                    ? 'Failed'
                    : `${Math.round(upload.progress)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
