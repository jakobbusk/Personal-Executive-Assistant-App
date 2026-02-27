<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
      <input
        v-model="email"
        type="email"
        required
        placeholder="you@example.com"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
      />
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span v-if="loading">Sending link...</span>
      <span v-else>Send magic link</span>
    </button>

    <div v-if="sent" class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
      <p class="text-green-800 text-sm font-medium">✓ Check your email for a login link</p>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm">{{ error }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api/client';

const email = ref('');
const loading = ref(false);
const sent = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  try {
    await api.post('/auth/magic-link', { email: email.value });
    sent.value = true;
  } catch {
    error.value = 'Failed to send magic link. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>
