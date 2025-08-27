import { create } from 'zustand';
import { Service } from '@/types/types';

interface ServiceState {
  services: Service[];
  setServices: (services: Service[]) => void;
}

export const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  setServices: (services) => set({ services }),
})); 