<template>
  <li class="flex items-start gap-4">
    <!-- Skeleton loader -->
    <div v-if="isLoading" class="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
    
    <!-- Image si disponible -->
    <img 
      v-else-if="media?.url" 
      :src="media.url" 
      :alt="media.alt" 
      class="w-10 h-10 object-contain"
    />
    
    <!-- Fallback -->
    <div v-else class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
      icon
    </div>
    
    <!-- Texte de l'élément -->
    <div v-html="text" class="flex-1"></div>
  </li>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useWordPressMedia } from '~/composables/useWordPressMedia';

const props = defineProps({
  iconId: {
    type: [Number, String],
    default: 0
  },
  text: {
    type: String,
    default: ''
  }
});

const { loadMedia, mediaCache, loadingMedia } = useWordPressMedia();

const media = computed(() => mediaCache[props.iconId]);
const isLoading = computed(() => loadingMedia.value.has(props.iconId));

onMounted(async () => {
  if (props.iconId) await loadMedia(props.iconId);
});
</script>