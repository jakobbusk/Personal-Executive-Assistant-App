<template>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Good {{ greeting }}, {{ auth.user?.email?.split('@')[0] }} 👋</h1>
      <p class="text-gray-500 mt-1">{{ todayFormatted }}</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Today's summary card -->
      <div class="lg:col-span-2">
        <div v-if="loadingDaily" class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded"></div>
            <div class="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
        <div v-else-if="latestDaily" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-900">Today's Executive Summary</h2>
            <span class="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-medium">Daily</span>
          </div>
          <SummaryCard :summary="latestDaily" />
        </div>
        <div v-else class="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500 font-medium">No summary yet today</p>
          <p class="text-sm text-gray-400 mt-1">Daily summaries are generated at 7:00 AM</p>
        </div>
      </div>

      <!-- Stats panel -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Total summaries</span>
              <span class="font-semibold text-gray-900">{{ stats?.total ?? '–' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Daily</span>
              <span class="font-semibold text-gray-900">{{ stats?.daily ?? '–' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Weekly</span>
              <span class="font-semibold text-gray-900">{{ stats?.weekly ?? '–' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent summaries -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Recent Summaries</h2>
        <RouterLink to="/summaries" class="text-sm text-primary-600 hover:text-primary-700 font-medium">View all →</RouterLink>
      </div>
      <div v-if="recentSummaries.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard v-for="s in recentSummaries" :key="s.id" :summary="s" />
      </div>
      <div v-else class="text-center py-12 text-gray-400">
        <p>No summaries yet. They'll appear here once generated.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api/client';
import SummaryCard from '@/components/SummaryCard.vue';

const auth = useAuthStore();
const loadingDaily = ref(true);
const latestDaily = ref(null);
const recentSummaries = ref([]);
const stats = ref<{ total: number; daily: number; weekly: number } | null>(null);

const todayFormatted = computed(() => format(new Date(), 'EEEE, MMMM d, yyyy'));
const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
});

onMounted(async () => {
  const [summariesRes, statsRes] = await Promise.allSettled([
    api.get('/summaries?limit=6'),
    api.get('/analytics/summary-stats'),
  ]);

  if (summariesRes.status === 'fulfilled') {
    recentSummaries.value = summariesRes.value.data.summaries;
    const today = new Date().toDateString();
    latestDaily.value = recentSummaries.value.find(
      (s: { type: string; date: string }) => s.type === 'daily' && new Date(s.date).toDateString() === today
    ) ?? null;
  }

  if (statsRes.status === 'fulfilled') {
    stats.value = statsRes.value.data.stats;
  }

  loadingDaily.value = false;
});
</script>
