import { create } from 'zustand';
import { BlogPost, Tag } from '@/types/types';

interface BlogState {
  blogs: BlogPost[];
  tags: Tag[];
  setBlogs: (blogs: BlogPost[]) => void;
  setTags: (tags: Tag[]) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  blogs: [],
  tags: [],
  setBlogs: (blogs) => set({ blogs }),
  setTags: (tags) => set({ tags }),
})); 