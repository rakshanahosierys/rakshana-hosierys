// store/useProductModal.js
import { create } from 'zustand';

export const useCampareProductModal = create((set) => ({
  selectedCampareProduct: null,
  setSelectedCampareProduct: (product) => set({ selectedCampareProduct: product }),
}));