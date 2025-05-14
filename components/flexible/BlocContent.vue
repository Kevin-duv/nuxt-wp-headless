<template>
  <div class="flex-block bloc-content my-6">
    <div v-html="content"></div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    default: ''
  }
});
</script> 