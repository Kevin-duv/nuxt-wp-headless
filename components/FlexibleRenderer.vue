<template>
  <div class="flexible-content">
    <div v-if="blocks && blocks.length > 0">
      <div v-for="(block, index) in blocks" :key="index">
        <!-- Utilisation de composants dynamiques basés sur le type de layout -->
        <component 
          :is="getComponentForLayout(block.acf_fc_layout)" 
          v-bind="getPropsForLayout(block)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, onMounted, watch } from 'vue';
import BlocContent from './flexible/BlocContent.vue';
import BlocImage from './flexible/BlocImage.vue';
import BlocList from './flexible/BlocList.vue';

// Map des composants par type de layout
const layoutComponents = {
  'bloc_content': BlocContent,
  'bloc_image': BlocImage,
  'bloc_list': BlocList
  // Ajoutez d'autres types de blocs ici quand nécessaire
};

const props = defineProps({
  blocks: {
    type: Array,
    default: () => []
  }
});

// Fonction pour déterminer quel composant utiliser
function getComponentForLayout(layout) {
  return layoutComponents[layout] || 'div'; // 'div' comme fallback
}

// Fonction pour charger une image par son ID


// Fonction pour préparer les props à envoyer au composant
function getPropsForLayout(block) {
  // Selon le type de layout, on prépare les props appropriées
  if (block.acf_fc_layout === 'bloc_content') {
    return {
      content: block.texte || ''
    };
  }
  
  if (block.acf_fc_layout === 'bloc_image') {
    return {
      imageId: typeof block.image === 'number' ? block.image : 0
    };
  }
  
  if (block.acf_fc_layout === 'bloc_list') {
    // S'assurer que list est un tableau
    const list = Array.isArray(block.list) ? block.list : [];
    
    // Traiter chaque élément individuellement
    const items = list.map(item => {
      // Vérifier si l'icône est un ID
      const iconId = typeof item.icon === 'number' ? item.icon : 
                    (item.icon && typeof item.icon === 'object' && item.icon.ID) ? item.icon.ID : 0;
      
      // Vérifier si l'icône est un objet avec URL
      const iconUrl = typeof item.icon === 'object' && item.icon && item.icon.url ? item.icon.url : '';
      
      return {
        texte: item.texte || '',
        iconId: iconId,
        iconUrl: iconUrl,
        altText: typeof item.icon === 'object' && item.icon && item.icon.alt ? item.icon.alt : ''
      };
    });
    
    console.log('Liste des items:', items); // Aide au débogage
    
    return { items };
  }
  
  // Par défaut, on retourne un objet vide
  return {};
}
</script> 