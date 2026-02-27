<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    :class="isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
  >
    <component :is="iconComponent" class="w-5 h-5" />
    {{ label }}
  </RouterLink>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import DocumentIcon from '@/components/icons/DocumentIcon.vue';
import CalendarIcon from '@/components/icons/CalendarIcon.vue';
import NewspaperIcon from '@/components/icons/NewspaperIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import CogIcon from '@/components/icons/CogIcon.vue';

const props = defineProps<{ to: string; icon: string; label: string }>();
const route = useRoute();
const isActive = computed(() => route.path === props.to || (props.to !== '/' && route.path.startsWith(props.to)));

const icons: Record<string, unknown> = {
  home: HomeIcon,
  document: DocumentIcon,
  calendar: CalendarIcon,
  newspaper: NewspaperIcon,
  link: LinkIcon,
  cog: CogIcon,
};

const iconComponent = computed(() => icons[props.icon] ?? HomeIcon);
</script>
