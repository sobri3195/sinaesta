/**
 * UI Store
 * Global state management for UI-related state (modals, toasts, loading states, etc.)
 */

import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  data?: any;
}

interface LoadingState {
  [key: string]: boolean;
}

interface UIState {
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modals
  modals: Record<string, Modal>;
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;

  // Loading states
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // Toasts
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${toastId++}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Modals
  modals: {},

  openModal: (id, data) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: {
          id,
          isOpen: true,
          data
        }
      }
    }));
  },

  closeModal: (id) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: {
          ...state.modals[id],
          isOpen: false
        }
      }
    }));
  },

  isModalOpen: (id) => {
    return get().modals[id]?.isOpen || false;
  },

  // Loading states
  loadingStates: {},

  setLoading: (key, isLoading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading
      }
    }));
  },

  isLoading: (key) => {
    return get().loadingStates[key] || false;
  },

  // Sidebar
  sidebarOpen: true,

  setSidebarOpen: (isOpen) => {
    set({ sidebarOpen: isOpen });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  // Theme
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  }
}));

// Selectors
export const selectToasts = (state: UIState) => state.toasts;
export const selectSidebarOpen = (state: UIState) => state.sidebarOpen;
export const selectTheme = (state: UIState) => state.theme;
