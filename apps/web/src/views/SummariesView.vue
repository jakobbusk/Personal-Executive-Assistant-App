<template>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Summaries</h1>
      <div class="flex items-center gap-3">
        <select
          v-model="filterType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">All types</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="space-y-2">
          <div class="h-3 bg-gray-200 rounded"></div>
          <div class="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    </div>

    <div v-else-if="summaries.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SummaryCard v-for="s in summaries" :key="s.id" :summary="s" />
    </div>

    <div v-else class="text-center py-16">
      <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-500 font-medium">No summaries found</p>
      <p class="text-gray-400 text-sm mt-1">Summaries will appear here once generated</p>
    </div>

    <div v-if="total > limit" class="mt-6 flex justify-center gap-2">
      <button
        :disabled="offset === 0"
        @click="offset -= limit"
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        :disabled="offset + limit >= total"
        @click="offset += limit"
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { api } from '@/api/client';
import SummaryCard from '@/components/SummaryCard.vue';

const summaries = ref([]);
const loading = ref(true);
const total = ref(0);
const offset = ref(0);
const limit = 12;
const filterType = ref('');

async function fetchSummaries() {
  loading.value = true;
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset.value) });
  if (filterType.value) params.set('type', filterType.value);
  const res = await api.get(`/summaries?${params}`);
  summaries.value = res.data.summaries;
  total.value = res.data.total;
  loading.value = false;
}

watch([filterType, offset], fetchSummaries);
onMounted(fetchSummaries);
</script>
