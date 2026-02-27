<template>
  <div class="p-6 lg:p-8 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Integrations</h1>

    <div class="space-y-4">
      <div
        v-for="provider in availableProviders"
        :key="provider.id"
        class="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="provider.bgClass">
              <span class="text-2xl">{{ provider.emoji }}</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ provider.name }}</h3>
              <p class="text-sm text-gray-500">{{ provider.description }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="getIntegration(provider.id)" class="flex items-center gap-1.5 text-sm">
              <span class="w-2 h-2 rounded-full" :class="getIntegration(provider.id)?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'"></span>
              <span :class="getIntegration(provider.id)?.status === 'active' ? 'text-green-700' : 'text-yellow-700'">
                {{ getIntegration(provider.id)?.status }}
              </span>
            </span>
            <button
              v-if="getIntegration(provider.id)"
              @click="disconnect(getIntegration(provider.id)!.id)"
              class="text-sm text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg"
            >
              Disconnect
            </button>
            <button
              v-else
              class="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Connect
            </button>
          </div>
        </div>

        <div v-if="getIntegration(provider.id)?.lastSyncAt" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs text-gray-400">Last synced: {{ formatDate(getIntegration(provider.id)!.lastSyncAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api/client';
import { format } from 'date-fns';

interface Integration { id: string; provider: string; status: string; lastSyncAt?: string }

const integrations = ref<Integration[]>([]);

const availableProviders = [
  { id: 'google_calendar', name: 'Google Calendar', description: 'Sync your Google Calendar events', emoji: '📅', bgClass: 'bg-blue-50' },
  { id: 'microsoft_365', name: 'Microsoft 365', description: 'Sync your Outlook calendar events', emoji: '🗓️', bgClass: 'bg-indigo-50' },
];

function getIntegration(providerId: string) {
  return integrations.value.find((i) => i.provider === providerId);
}

function formatDate(d?: string) {
  if (!d) return 'Never';
  return format(new Date(d), 'MMM d, yyyy HH:mm');
}

async function disconnect(id: string) {
  await api.delete(`/integrations/${id}`);
  const res = await api.get('/integrations');
  integrations.value = res.data.integrations;
}

onMounted(async () => {
  const res = await api.get('/integrations');
  integrations.value = res.data.integrations;
});
</script>
