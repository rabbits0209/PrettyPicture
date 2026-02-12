import { create } from 'zustand';
import type { ToastMessage } from '../types';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toasts: ToastMessage[];
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  sidebarOpen: false,
  toasts: [],
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  addToast: (message, type) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const theme = savedTheme || 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
