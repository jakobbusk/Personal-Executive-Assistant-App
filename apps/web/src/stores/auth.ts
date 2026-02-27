import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/client';

interface User {
  id: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  async function checkAuth() {
    try {
      const res = await api.get('/auth/me');
      user.value = res.data.user;
    } catch {
      user.value = null;
    }
  }

  async function logout() {
    await api.post('/auth/logout');
    user.value = null;
  }

  return { user, isAuthenticated, checkAuth, logout };
});
