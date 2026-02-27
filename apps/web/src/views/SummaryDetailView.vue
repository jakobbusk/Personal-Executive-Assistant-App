<template>
  <div class="p-6 lg:p-8 max-w-4xl mx-auto">
    <RouterLink to="/summaries" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
      ← Back to summaries
    </RouterLink>

    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-1/2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>

    <div v-else-if="summary">
      <div class="flex items-start justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="summary.type === 'daily' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
            >
              {{ summary.type === 'daily' ? 'Daily Executive Summary' : 'Weekly Overview' }}
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">{{ formattedDate }}</h1>
        </div>
        <span class="text-sm text-gray-500">{{ summary.status }}</span>
      </div>

      <div class="space-y-6">
        <div
          v-for="section in summary.sections"
          :key="section.id"
          class="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">{{ section.title }}</h2>
          <pre class="text-sm text-gray-700 whitespace-pre-wrap font-sans">{{ JSON.stringify(section.content, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <p class="text-gray-500">Summary not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { format } from 'date-fns';
import { api } from '@/api/client';

interface Section { id: string; title: string; content: unknown }
interface Summary { id: string; type: string; date: string; status: string; sections: Section[] }

const route = useRoute();
const loading = ref(true);
const summary = ref<Summary | null>(null);

const formattedDate = computed(() =>
  summary.value ? format(new Date(summary.value.date), 'EEEE, MMMM d, yyyy') : ''
);

onMounted(async () => {
  try {
    const res = await api.get(`/summaries/${route.params.id}`);
    summary.value = res.data.summary;
  } catch {
    // not found
  } finally {
    loading.value = false;
  }
});
</script>
