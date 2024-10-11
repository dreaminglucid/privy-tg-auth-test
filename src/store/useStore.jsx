// src/store/useStore.js
import { create } from 'zustand';

const useStore = create((set) => ({
  isInTelegram: false,
  setIsInTelegram: (value) => set({ isInTelegram: value }),
}));

export default useStore;
