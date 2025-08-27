import { create } from 'zustand';
import { Editor } from '@/types/types';

interface EditorState {
  editors: Editor[];
  setEditors: (editors: Editor[]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  editors: [],
  setEditors: (editors) => set({ editors }),
})); 