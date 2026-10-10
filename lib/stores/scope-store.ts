import { create } from 'zustand';
import type { Scope } from '@/types';

interface ScopeStore {
  scope: Scope;
  setScope: (scope: Scope) => void;
}

export const useScopeStore = create<ScopeStore>((set) => ({
  scope: { type: 'all', label: 'All files' },
  setScope: (scope) => set({ scope }),
}));
