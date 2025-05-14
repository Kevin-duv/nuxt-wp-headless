<template>
  <div>
    <Breadcrumb />
    <div class="py-8">
      <h1 class="text-3xl font-bold mb-8">Tous les articles</h1>
      <div v-if="sortedPosts.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="post in sortedPosts" :key="post.id" class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <NuxtLink :to="`/articles/${post.slug}`" class="block">
            <!-- Image à la une avec placeholder en attendant le chargement -->
            <div class="aspect-video relative bg-gray-200 overflow-hidden">
              <img 
                v-if="getFeaturedImage(post)" 
                :src="getFeaturedImage(post)" 
                :alt="post.title?.rendered"
                class="w-full h-full object-cover transition-transform hover:scale-105"
              />
              <div v-else class="flex items-center justify-center h-full text-gray-400">
                <span>Pas d'image</span>
              </div>
            </div>
            
            <div class="p-4">
              <h2 class="text-xl font-semibold mb-2" v-html="post.title?.rendered"></h2>
              <div class="text-gray-500 text-sm mb-2">
                {{ formatDate(post.date) }}
              </div>
              <div class="text-gray-500 text-sm mb-2">
                {{ getPostExcerpt(post) }}
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>
      
      <div v-else-if="pending" class="text-center py-12">
        Chargement des articles...
      </div>
      
      <div v-else class="text-center py-12 text-gray-500">
        Aucun article trouvé.
      </div>

<!-- Affichage de débogage pour voir les données de l'API -->
<div class="mt-12 p-4 bg-gray-100 rounded-md">
  <h2 class="text-xl font-bold mb-4">Données de l'API (Débogage)</h2>
  
  <div v-if="sortedPosts.length > 0" class="space-y-6">
    <!-- Afficher les données du premier article -->
    <div>
      <h3 class="font-semibold text-lg">Structure d'un article:</h3>
      <details>
        <summary class="cursor-pointer text-blue-600">Afficher l'objet article complet</summary>
        <pre class="mt-2 p-2 bg-gray-800 text-white text-xs overflow-auto max-h-96 rounded">{{ JSON.stringify(sortedPosts[0], null, 2) }}</pre>
      </details>
    </div>
    
    <!-- Afficher les données d'image à la une -->
    <div v-if="sortedPosts[0]._embedded && sortedPosts[0]._embedded['wp:featuredmedia']">
      <h3 class="font-semibold text-lg">Données de l'image à la une:</h3>
      <details>
        <summary class="cursor-pointer text-blue-600">Afficher les données de l'image</summary>
        <pre class="mt-2 p-2 bg-gray-800 text-white text-xs overflow-auto max-h-96 rounded">{{ JSON.stringify(sortedPosts[0]._embedded['wp:featuredmedia'][0], null, 2) }}</pre>
      </details>
    </div>
    
    <!-- Afficher les tailles d'images disponibles -->
    <div v-if="sortedPosts[0]._embedded && sortedPosts[0]._embedded['wp:featuredmedia'] && sortedPosts[0]._embedded['wp:featuredmedia'][0].media_details && sortedPosts[0]._embedded['wp:featuredmedia'][0].media_details.sizes">
      <h3 class="font-semibold text-lg">Tailles d'images disponibles:</h3>
      <ul class="list-disc pl-5 mt-2">
        <li v-for="(size, key) in sortedPosts[0]._embedded['wp:featuredmedia'][0].media_details.sizes" :key="key">
          <strong>{{ key }}:</strong> {{ size.width }}x{{ size.height }} - 
          <a :href="size.source_url" target="_blank" class="text-blue-600 underline">Voir l'image</a>
        </li>
      </ul>
    </div>
  </div>
  
  <div v-else-if="pending">Chargement des données...</div>
  <div v-else>Aucune donnée disponible</div>
</div>

    </div>
  </div>
</template>

<script setup>
import { useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import { useWordPress } from '~/composables/useWordPress'

const config = useRuntimeConfig()
const { getFeaturedImage, getPostExcerpt, fetchPosts } = useWordPress()

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Assurez-vous que votre appel API retourne bien un tableau
const { data: postsData, pending, error: fetchError } = await useFetch(
  () => `/api/wordpress/posts`,
  {
    params: { per_page: 12, _embed: true },
    key: 'posts-list',
    cache: true
  }
)

// Ajoutez une protection pour s'assurer que posts est toujours un tableau
const posts = computed(() => {
  // Vérifier que postsData.value existe et est itérable
  if (!postsData.value) return [];
  
  // Si c'est déjà un tableau, le retourner
  if (Array.isArray(postsData.value)) {
    return postsData.value;
  }
  
  // Si c'est un objet qui contient un tableau 'posts'
  if (postsData.value && typeof postsData.value === 'object') {
    if (Array.isArray(postsData.value.posts)) {
      return postsData.value.posts;
    }
    
    // Si c'est un seul post, le mettre dans un tableau
    if (postsData.value.id) {
      return [postsData.value];
    }
  }
  
  console.warn('Format de données inattendu:', postsData.value);
  return [];
})

// Assurez-vous que sortedPosts a aussi une protection
const sortedPosts = computed(() => {
  if (!posts.value || !Array.isArray(posts.value)) return [];
  return [...posts.value].sort((a, b) => new Date(b.date) - new Date(a.date));
})

if (fetchError.value) {
  console.error('Erreur lors du chargement des articles:', fetchError.value)
}

definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})
</script>