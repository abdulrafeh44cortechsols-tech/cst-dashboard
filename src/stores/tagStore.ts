import { create } from 'zustand';
import { Tag } from '@/types/types';

interface TagState {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
})); 