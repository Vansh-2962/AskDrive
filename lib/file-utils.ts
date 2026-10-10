import type { FileType, IndexStatus } from '@/types';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  FileType2,
} from 'lucide-react';

export function getFileIcon(type: FileType) {
  switch (type) {
    case 'pdf':
      return { icon: FileText, color: 'text-orange-500' };
    case 'docx':
    case 'txt':
      return { icon: FileText, color: 'text-foreground-secondary' };
    case 'xlsx':
    case 'csv':
      return { icon: FileSpreadsheet, color: 'text-teal-600 dark:text-teal-400' };
    case 'image':
      return { icon: FileImage, color: 'text-foreground-secondary' };
    default:
      return { icon: FileIcon, color: 'text-foreground-secondary' };
  }
}

export function getFileTypeLabel(type: FileType): string {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'docx':
      return 'DOCX';
    case 'xlsx':
      return 'XLSX';
    case 'image':
      return 'IMG';
    case 'txt':
      return 'TXT';
    case 'csv':
      return 'CSV';
    default:
      return 'FILE';
  }
}

export function getIndexStatusConfig(status: IndexStatus) {
  switch (status) {
    case 'indexed':
      return {
        label: 'Indexed',
        color: 'text-status-indexed',
        bgColor: 'bg-accent-tint',
        dotColor: 'bg-status-indexed',
      };
    case 'processing':
      return {
        label: 'Processing',
        color: 'text-status-processing',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        dotColor: 'bg-status-processing',
      };
    case 'failed':
      return {
        label: 'Failed',
        color: 'text-status-failed',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        dotColor: 'bg-status-failed',
      };
  }
}
