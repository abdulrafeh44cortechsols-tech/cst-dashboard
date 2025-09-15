import { create } from 'zustand';
import { Industry } from '@/types/types';

interface IndustryState {
  industries: Industry[];
  setIndustries: (industries: Industry[]) => void;
}

export const useIndustryStore = create<IndustryState>((set) => ({
  industries: [],
  setIndustries: (industries) => set({ industries }),
})); 