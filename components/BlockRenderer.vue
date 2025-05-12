<template>
  <div v-html="renderedContent"></div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  blocks: {
    type: Array,
    default: () => []
  },
  acf_blocks: {
    type: Array,
    default: () => []
  },
  content: {
    type: String,
    default: ''
  }
});

// Créer un map des blocs ACF pour accès rapide
const acfBlocksMap = computed(() => {
  if (!props.acf_blocks || !props.acf_blocks.length) return {};
  
  const map = {};
  props.acf_blocks.forEach(block => {
    if (block.name) {
      map[block.name] = block.data;
    }
  });
  return map;
});

// Générer tout le HTML en une seule fois pour éviter les éléments supplémentaires
const renderedContent = computed(() => {
  // Si pas de blocs, utiliser le contenu pré-rendu
  if (!props.blocks || props.blocks.length === 0) {
    return props.content || '';
  }
  
  return props.blocks.map(block => {
    // ACF texte-simple
    if (block.blockName === 'acf/texte-simple') {
      // Tenter d'obtenir les données de différentes sources
      let text = '';
      
      // 1. Essayer depuis attrs.data s'il existe
      if (block.attrs?.data?.texte) {
        text = block.attrs.data.texte;
      } 
      // 2. Sinon, chercher dans le map des blocs ACF
      else if (acfBlocksMap.value['acf/texte-simple']?.texte) {
        text = acfBlocksMap.value['acf/texte-simple'].texte;
      }
      
      return `<p class="texte-simple">${text}</p>`;
    }
    // Liste
    else if (block.blockName === 'core/list') {
      const openTag = block.innerContent?.[0] || '<ul>';
      const closeTag = block.innerContent?.[block.innerContent.length - 1] || '</ul>';
      const listItems = block.innerBlocks
        ?.map(item => item.innerHTML)
        .join('') || '';
      
      return openTag + listItems + closeTag;
    }
    // Paragraphes et autres blocs standards
    else if (block.innerHTML) {
      return block.innerHTML;
    }
    return '';
  }).join('');
});
</script>