import { create } from 'zustand';
import { Page } from '@/types/types';

interface PageState {
  pages: Page[];
  setPages: (pages: Page[]) => void;
}

export const usePageStore = create<PageState>((set) => ({
  pages: [],
  setPages: (pages) => set({ pages }),
})); 