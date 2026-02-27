<template>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Calendar Insights</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Meeting Hours per Day</h2>
        <div v-if="loading" class="h-48 bg-gray-50 animate-pulse rounded-lg"></div>
        <Bar v-else-if="chartData" :data="chartData" :options="chartOptions" class="max-h-64" />
        <p v-else class="text-gray-400 text-sm text-center py-12">No calendar data yet</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Summary Statistics</h2>
        <div v-if="stats" class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span class="text-gray-600">Total Summaries</span>
            <span class="text-2xl font-bold text-gray-900">{{ stats.total }}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span class="text-blue-700">Daily Summaries</span>
            <span class="text-2xl font-bold text-blue-900">{{ stats.daily }}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <span class="text-purple-700">Weekly Summaries</span>
            <span class="text-2xl font-bold text-purple-900">{{ stats.weekly }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { api } from '@/api/client';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const loading = ref(true);
const chartData = ref(null);
const stats = ref(null);

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, title: { display: true, text: 'Hours' } } },
};

onMounted(async () => {
  const [meetingRes, statsRes] = await Promise.allSettled([
    api.get('/analytics/meeting-hours'),
    api.get('/analytics/summary-stats'),
  ]);

  if (meetingRes.status === 'fulfilled') {
    const data = meetingRes.value.data.data as Record<string, number>;
    const labels = Object.keys(data).sort();
    chartData.value = {
      labels,
      datasets: [
        {
          data: labels.map((l) => Math.round(data[l] * 10) / 10),
          backgroundColor: '#6366f1',
          borderRadius: 6,
        },
      ],
    };
  }

  if (statsRes.status === 'fulfilled') {
    stats.value = statsRes.value.data.stats;
  }

  loading.value = false;
});
</script>
