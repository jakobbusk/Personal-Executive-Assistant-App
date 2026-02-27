<template>
  <div class="text-center space-y-4">
    <div v-if="loading">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">Verifying your link...</p>
    </div>
    <div v-else-if="success">
      <p class="text-green-700 font-medium">✓ Successfully logged in!</p>
      <p class="text-sm text-gray-500 mt-1">Redirecting to dashboard...</p>
    </div>
    <div v-else>
      <p class="text-red-700 font-medium">Invalid or expired link</p>
      <RouterLink to="/auth" class="text-primary-600 text-sm hover:underline">Try again</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api/client';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const success = ref(false);

onMounted(async () => {
  const token = route.query.token as string;
  if (!token) {
    loading.value = false;
    return;
  }
  try {
    await api.get(`/auth/verify?token=${token}`);
    await auth.checkAuth();
    success.value = true;
    setTimeout(() => router.push('/'), 1500);
  } catch {
    // error state
  } finally {
    loading.value = false;
  }
});
</script>
