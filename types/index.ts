export type FileType = 'pdf' | 'docx' | 'xlsx' | 'image' | 'txt' | 'csv';
export type IndexStatus = 'indexed' | 'processing' | 'failed';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  folderId: string | null;
  modifiedAt: string;
  starred: boolean;
  trashed: boolean;
  indexStatus: IndexStatus;
  chunkCount: number;
  pageCount?: number;
  sharedWith: SharedUser[];
  owner: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  modifiedAt: string;
  starred: boolean;
  trashed: boolean;
  fileCount: number;
}

export interface SharedUser {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
}

export interface Citation {
  fileId: string;
  fileName: string;
  page: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  sources?: FileItem[];
  createdAt: string;
  feedback?: 'up' | 'down' | null;
  feedbackNote?: string;
  isStreaming?: boolean;
  notFound?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type ScopeType = 'all' | 'folder' | 'files';

export interface Scope {
  type: ScopeType;
  folderId?: string;
  fileIds?: string[];
  label: string;
}

export interface UploadItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: FileType;
  progress: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface StorageInfo {
  used: number;
  total: number;
}
