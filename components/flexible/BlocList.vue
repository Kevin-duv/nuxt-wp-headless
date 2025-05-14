<template>
  <div class="flex-block bloc-list my-6">
    <ul class="list-items space-y-4">
      <ListItem 
        v-for="(item, index) in items" 
        :key="index"
        :iconId="item.iconId"
        :text="item.texte"
      />
    </ul>
  </div>
</template>

<script setup>
import ListItem from './ListItem.vue';

defineProps({
  items: {
    type: Array,
    default: () => []
  }
});
</script>