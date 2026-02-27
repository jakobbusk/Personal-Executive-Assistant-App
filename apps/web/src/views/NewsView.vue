<template>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">News Feeds</h1>
      <button
        @click="showAddFeed = true"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        + Add Feed
      </button>
    </div>

    <!-- Add feed modal -->
    <div v-if="showAddFeed" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="font-semibold text-gray-900 mb-4">Add RSS Feed</h2>
        <form @submit.prevent="addFeed" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Feed URL</label>
            <input
              v-model="newFeed.url"
              type="url"
              required
              placeholder="https://example.com/feed.xml"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
            <input
              v-model="newFeed.category"
              type="text"
              placeholder="Technology, Business..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div class="flex gap-3">
            <button type="submit" class="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700">
              Add Feed
            </button>
            <button type="button" @click="showAddFeed = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Feed list -->
      <div class="space-y-3">
        <h2 class="font-medium text-gray-900 text-sm uppercase tracking-wide">Your Feeds</h2>
        <div v-for="feed in feeds" :key="feed.id" class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ feed.title || feed.url }}</p>
              <p v-if="feed.category" class="text-xs text-gray-500 mt-0.5">{{ feed.category }}</p>
            </div>
            <button @click="deleteFeed(feed.id)" class="text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="feeds.length === 0" class="text-center py-8 text-gray-400 text-sm">
          No feeds yet. Add one to get started.
        </div>
      </div>

      <!-- Recent items -->
      <div class="lg:col-span-2">
        <h2 class="font-medium text-gray-900 text-sm uppercase tracking-wide mb-3">Recent Items</h2>
        <div class="space-y-3">
          <div v-for="item in items" :key="item.id" class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <a :href="item.url" target="_blank" rel="noopener noreferrer" class="font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                  {{ item.title }}
                </a>
                <p v-if="item.description" class="text-sm text-gray-500 mt-1 line-clamp-2">{{ item.description }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <span v-if="item.feed?.category" class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ item.feed.category }}</span>
                  <span v-if="item.publishedAt" class="text-xs text-gray-400">{{ formatDate(item.publishedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="items.length === 0" class="text-center py-12 text-gray-400 text-sm">
            No news items yet. Feed items are fetched hourly.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api/client';
import { format } from 'date-fns';

const feeds = ref([]);
const items = ref([]);
const showAddFeed = ref(false);
const newFeed = ref({ url: '', category: '' });

function formatDate(d: string) {
  return format(new Date(d), 'MMM d');
}

async function fetchData() {
  const [feedsRes, itemsRes] = await Promise.allSettled([
    api.get('/rss/feeds'),
    api.get('/rss/items?limit=20'),
  ]);
  if (feedsRes.status === 'fulfilled') feeds.value = feedsRes.value.data.feeds;
  if (itemsRes.status === 'fulfilled') items.value = itemsRes.value.data.items;
}

async function addFeed() {
  await api.post('/rss/feeds', newFeed.value);
  newFeed.value = { url: '', category: '' };
  showAddFeed.value = false;
  await fetchData();
}

async function deleteFeed(id: string) {
  await api.delete(`/rss/feeds/${id}`);
  await fetchData();
}

onMounted(fetchData);
</script>
