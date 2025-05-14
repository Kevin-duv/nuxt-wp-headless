<template>
  <div class="flex-block bloc-image my-6">
    <!-- Skeleton loader pendant le chargement -->
    <div v-if="isLoading" class="skeleton-image rounded overflow-hidden bg-gray-200 animate-pulse">
      <div class="w-full h-48 md:h-64"></div>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="hasError" class="p-3 bg-yellow-100 rounded">
      Image non disponible (ID: {{ imageId }})
    </div>
    
    <!-- L'image chargée -->
    <img v-else :src="media?.url" :alt="media?.alt" class="max-w-full h-auto rounded" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useWordPressMedia } from '~/composables/useWordPressMedia';

const props = defineProps({
  imageId: {
    type: [Number, String],
    required: true
  }
});

const { loadMedia, mediaCache, loadingMedia, errors } = useWordPressMedia();

// Computed pour simplifier les conditions du template
const media = computed(() => mediaCache[props.imageId]);
const isLoading = computed(() => loadingMedia.value.has(props.imageId));
const hasError = computed(() => errors.value.has(props.imageId));

// Charger l'image au montage
onMounted(async () => {
  if (props.imageId) await loadMedia(props.imageId);
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>