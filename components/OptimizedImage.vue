<!-- components/OptimizedImage.vue -->
<template>
  <nuxt-img
    :src="src"
    :alt="alt"
    format="webp"
    :width="width"
    :height="height"
    :class="className"
    loading="lazy"

  />
</template>

<script setup>
defineProps({
  src: String,
  alt: String,
  width: Number,
  height: Number,
  className: String
})
</script>