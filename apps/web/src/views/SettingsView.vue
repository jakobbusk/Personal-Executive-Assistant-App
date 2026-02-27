<template>
  <div class="p-6 lg:p-8 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Profile</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              v-model="form.timezone"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Email Preferences</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input v-model="form.emailPreferences.daily" type="checkbox" class="w-4 h-4 text-primary-600 rounded" />
            <div>
              <p class="text-sm font-medium text-gray-700">Daily executive summary</p>
              <p class="text-xs text-gray-500">Sent every morning at 7:00 AM in your timezone</p>
            </div>
          </label>
          <label class="flex items-center gap-3">
            <input v-model="form.emailPreferences.weekly" type="checkbox" class="w-4 h-4 text-primary-600 rounded" />
            <div>
              <p class="text-sm font-medium text-gray-700">Weekly overview</p>
              <p class="text-xs text-gray-500">Sent every Sunday at 6:00 PM in your timezone</p>
            </div>
          </label>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {{ saving ? 'Saving...' : 'Save settings' }}
        </button>
      </div>

      <div v-if="saved" class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p class="text-green-700 text-sm font-medium">✓ Settings saved successfully</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api/client';

const form = ref({
  name: '',
  timezone: 'UTC',
  emailPreferences: { daily: true, weekly: true },
});

const saving = ref(false);
const saved = ref(false);

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Australia/Sydney',
];

async function saveSettings() {
  saving.value = true;
  await api.patch('/users/profile', form.value);
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 3000);
  saving.value = false;
}

onMounted(async () => {
  const res = await api.get('/users/profile');
  const user = res.data.user;
  form.value.name = user.name ?? '';
  form.value.timezone = user.timezone ?? 'UTC';
  form.value.emailPreferences = user.emailPreferences ?? { daily: true, weekly: true };
});
</script>
