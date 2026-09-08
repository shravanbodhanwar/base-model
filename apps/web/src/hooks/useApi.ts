import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const res = await apiClient.users.getUsers();
    return res?.data || res || [];
  }
});

export const useUser = (id: string) => useQuery({
  queryKey: ['user', id],
  queryFn: async () => {
    const res = await apiClient.users.getUser(id);
    return res?.data || res;
  },
  enabled: !!id
});

export const useCredentials = () => useQuery({
  queryKey: ['credentials'],
  queryFn: async () => {
    const res = await apiClient.credentials.getCredentials();
    return res?.data || res || [];
  }
});

export const useCredential = (id: string) => useQuery({
  queryKey: ['credential', id],
  queryFn: async () => {
    const res = await apiClient.credentials.getCredential(id);
    return res?.data || res;
  },
  enabled: !!id
});

export const useAssets = () => useQuery({
  queryKey: ['assets'],
  queryFn: async () => {
    const res = await apiClient.assets.getAssets();
    return res?.data || res || [];
  }
});

export const useAsset = (id: string) => useQuery({
  queryKey: ['asset', id],
  queryFn: async () => {
    const res = await apiClient.assets.getAsset(id);
    return res?.data || res;
  },
  enabled: !!id
});
