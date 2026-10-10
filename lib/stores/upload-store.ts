import { create } from 'zustand';
import type { UploadItem, FileType } from '@/types';

interface UploadStore {
  uploads: UploadItem[];
  isDragging: boolean;
  setDragging: (dragging: boolean) => void;
  addUploads: (files: { name: string; size: number; type: FileType }[]) => void;
  updateProgress: (id: string, progress: number) => void;
  completeUpload: (id: string) => void;
  failUpload: (id: string) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
}

let counter = 0;

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],
  isDragging: false,
  setDragging: (dragging) => set({ isDragging: dragging }),
  addUploads: (files) => {
    const newUploads: UploadItem[] = files.map((f) => {
      counter++;
      return {
        id: `upload_${Date.now()}_${counter}`,
        fileName: f.name,
        fileSize: f.size,
        fileType: f.type,
        progress: 0,
        status: 'uploading',
      };
    });
    set((state) => ({ uploads: [...state.uploads, ...newUploads] }));

    newUploads.forEach((upload) => {
      const interval = setInterval(() => {
        set((state) => ({
          uploads: state.uploads.map((u) =>
            u.id === upload.id
              ? { ...u, progress: Math.min(u.progress + Math.random() * 20, 100) }
              : u
          ),
        }));
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        set((state) => ({
          uploads: state.uploads.map((u) =>
            u.id === upload.id
              ? { ...u, progress: 100, status: 'processing' }
              : u
          ),
        }));
        setTimeout(() => {
          set((state) => ({
            uploads: state.uploads.map((u) =>
              u.id === upload.id ? { ...u, status: 'done' } : u
            ),
          }));
        }, 1500);
      }, 2000);
    });
  },
  updateProgress: (id, progress) =>
    set((state) => ({
      uploads: state.uploads.map((u) => (u.id === id ? { ...u, progress } : u)),
    })),
  completeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status: 'done', progress: 100 } : u
      ),
    })),
  failUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status: 'error' } : u
      ),
    })),
  removeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    })),
  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== 'done'),
    })),
}));
