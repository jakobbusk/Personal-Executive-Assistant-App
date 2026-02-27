<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-4">
      <div>
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="summary.type === 'daily' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
        >
          {{ summary.type === 'daily' ? 'Daily' : 'Weekly' }}
        </span>
        <p class="text-sm text-gray-500 mt-1">{{ formattedDate }}</p>
      </div>
      <span
        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
        :class="statusClass"
      >
        {{ summary.status }}
      </span>
    </div>

    <div v-if="summary.content" class="space-y-2 mb-4">
      <p class="text-sm text-gray-600">
        <span class="font-medium">{{ (summary.content as SummaryContent).totalMeetings ?? 0 }}</span> meetings
        <span v-if="(summary.content as SummaryContent).totalMeetingHours">
          · <span class="font-medium">{{ ((summary.content as SummaryContent).totalMeetingHours ?? 0).toFixed(1) }}h</span> in meetings
        </span>
      </p>
    </div>

    <RouterLink :to="`/summaries/${summary.id}`" class="text-sm font-medium text-primary-600 hover:text-primary-700">
      View details →
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { format } from 'date-fns';

interface SummaryContent {
  totalMeetings?: number;
  totalMeetingHours?: number;
}

interface Summary {
  id: string;
  type: 'daily' | 'weekly';
  date: string;
  status: string;
  content: unknown;
}

const props = defineProps<{ summary: Summary }>();

const formattedDate = computed(() => format(new Date(props.summary.date), 'EEEE, MMMM d, yyyy'));

const statusClass = computed(() => ({
  'bg-green-100 text-green-800': props.summary.status === 'sent',
  'bg-yellow-100 text-yellow-800': props.summary.status === 'generated',
  'bg-gray-100 text-gray-800': props.summary.status === 'pending',
  'bg-red-100 text-red-800': props.summary.status === 'error',
}));
</script>
