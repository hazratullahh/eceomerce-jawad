// lib/store.js
import { create } from "zustand";

export const useConfirmModal = create((set) => ({
  isOpen: false,
  title: "",
  message: "",
  onConfirm: () => {},
  openModal: (title, message, onConfirm) =>
    set({ isOpen: true, title, message, onConfirm }),
  closeModal: () => set({ isOpen: false }),
}));
