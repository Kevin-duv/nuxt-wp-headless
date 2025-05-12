<template>
  <nav v-if="segments.length > 0" aria-label="Fil d'Ariane" class="text-sm mb-4">
    <ol class="flex flex-wrap items-center">
      <!-- Accueil (toujours présent) -->
      <li class="flex items-center">
        <NuxtLink to="/" class="text-blue-600 hover:underline">
          Accueil
        </NuxtLink>
      </li>
      
      <!-- Segments dynamiques générés à partir de l'URL -->
      <template v-for="(segment, index) in segments" :key="index">
        <li class="mx-2 text-gray-500">/</li>
        <li class="flex items-center">
          <template v-if="index === segments.length - 1">
            <!-- Dernier segment (page actuelle) -->
            <span class="font-medium text-gray-700" aria-current="page">
              {{ formatSegment(segment.name) }}
            </span>
          </template>
          <template v-else>
            <!-- Segment intermédiaire -->
            <NuxtLink :to="segment.path" class="text-blue-600 hover:underline">
              {{ formatSegment(segment.name) }}
            </NuxtLink>
          </template>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup>
import { useRoute } from '#app'
import { computed } from 'vue'

const route = useRoute()

// Générer les segments à partir de l'URL actuelle
const segments = computed(() => {
  // Ignorer les paramètres vides et la page d'accueil
  const pathParts = route.path.split('/').filter(part => part)
  
  return pathParts.map((part, index) => {
    // Construire le chemin pour ce segment
    const path = '/' + pathParts.slice(0, index + 1).join('/')
    
    // Si c'est un paramètre de route (comme [slug]), utiliser le titre de page si disponible
    const name = part.startsWith('[') && part.endsWith(']')
      ? route.params[part.slice(1, -1)] || part
      : part
      
    return { name, path }
  })
})

// Fonction pour formater les segments
const formatSegment = (segment) => {
  // Transformer les slugs en texte lisible
  let text = segment.toString()
  
  // Remplacer les tirets par des espaces
  text = text.replace(/-/g, ' ')
  
  // Mettre en majuscule la première lettre
  text = text.charAt(0).toUpperCase() + text.slice(1)
  
  return text
}
</script>