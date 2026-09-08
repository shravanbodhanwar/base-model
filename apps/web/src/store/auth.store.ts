import { create } from 'zustand';
import { apiClient } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  employeeId?: string;
  roleAssignments: any[];
  dids: any[];
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email, pass) => {
    set({ isLoading: true });
    try {
      const data = await apiClient.auth.login(email, pass);
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('bel_token', data.token);
      }
      const userData = await apiClient.auth.getMe();
      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bel_token');
      window.location.href = '/login';
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  loadUser: async () => {
    set({ isLoading: true });
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('bel_token')) {
        const userData = await apiClient.auth.getMe();
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
