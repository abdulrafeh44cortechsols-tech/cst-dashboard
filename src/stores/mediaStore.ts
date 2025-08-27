import { create } from 'zustand';
import { MediaResponse } from '@/services/media';

interface MediaState {
  media: MediaResponse | null;
  setMedia: (media: MediaResponse) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  media: null,
  setMedia: (media) => set({ media }),
})); 