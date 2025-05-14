<template>
<div>
    <!-- Fil d'Ariane -->
    <Breadcrumb />
    
    <!-- Affichage pour le débogage -->
    <div class="bg-gray-100 p-4 mb-4 rounded hidden">
      <h3 class="font-bold mb-2">Données reçues de l'API :</h3>
      <pre class="text-xs overflow-auto max-h-60">{{ JSON.stringify(postsData, null, 2) }}</pre>
      <hr class="my-2">
      <p><strong>currentPost:</strong> {{ currentPost ? 'Existe' : 'N\'existe pas' }}</p>
      <p><strong>Slug demandé:</strong> {{ route.params.slug }}</p>
      <p><strong>URL de l'API:</strong> {{ `${config.public.wordpressApi}/posts?slug=${route.params.slug}` }}</p>
    </div>
    
    <!-- Ajouter un état de chargement -->
    <div v-if="pending" class="prose mx-auto py-8 text-center">
      Chargement de l'article..
    </div>
    
    <div v-if="error" class="w-[70%] mx-auto bg-red-100 p-4 mb-4 rounded">
      <h3 class="font-bold text-red-700">Erreur API:</h3>
      <p>{{ error }}</p>
    </div>
    
    <!-- N'afficher l'article que lorsqu'il est complètement chargé -->
    <article v-else-if="currentPost" class="w-[80%] mx-auto py-8">
      <!-- Titre et contenu avec vérifications optionnelles -->
      <h1 v-if="currentPost.title?.rendered" v-html="currentPost.title.rendered" />
      
      <!-- Date de création et temps de lecture -->
      <div v-if="currentPost.date" class="text-gray-600 mb-6 flex items-center gap-3">
        <span>Publié le {{ formatDate(currentPost.date) }}</span>
        <!-- Séparateur et temps de lecture -->
        <span v-if="currentPost.acf?.temps_de_lecture" class="w-1 h-1 rounded-full bg-gray-400"></span>
        <span v-if="currentPost.acf?.temps_de_lecture">
          {{ currentPost.acf.temps_de_lecture }} min de lecture
        </span>
      </div>
     
      <!-- Rendu des blocs flexibles ACF -->
      <FlexibleRenderer 
        :blocks="currentPost?.acf?.flexible || []" 
      />
      <!-- À la place du contenu rendu -->
      <BlockRenderer 
        :blocks="currentPost?.blocks || []" 
        :acf_blocks="currentPost?.acf_blocks || []"
        :content="currentPost?.content?.rendered || ''"
      />
 

      <!-- Pour déboguer les données ACF -->
      <div class="bg-gray-100 p-4 mb-4 rounded hidden ">
        <h3 class="font-bold mb-2">Données ACF Flexible :</h3>
        <p class="text-xs overflow-auto max-h-60">{{ JSON.stringify(currentPost?.acf?.flexible, null, 2) }}</p>
      </div>

      <!-- Navigation entre articles avec vérifications -->
      <div v-if="prevPost || nextPost" class="post-navigation mt-8 flex justify-between">
        <NuxtLink
          v-if="prevPost?.slug && prevPost?.title?.rendered"
          :to="`/articles/${prevPost.slug}`"
          class="prev-post text-blue-600 hover:underline"
          rel="prev"
        >
          &larr; <span v-html="prevPost.title.rendered" />
        </NuxtLink>
        <div v-else></div>
        
        <NuxtLink
          v-if="nextPost?.slug && nextPost?.title?.rendered"
          :to="`/articles/${nextPost.slug}`"
          class="next-post text-blue-600 hover:underline"
          rel="next"
        >
          <span v-html="nextPost.title.rendered" /> &rarr;
        </NuxtLink>
        <div v-else></div>
      </div>
    </article>
    
    <!-- Gestion des erreurs -->
    <div v-else class="prose mx-auto py-8 text-center">
      Article non trouvé
    </div>
</div>
</template>

<script setup>
import { useRuntimeConfig, useRoute, createError } from '#imports'
import { computed, watch } from 'vue'

const config = useRuntimeConfig()
const route = useRoute()

// Fonction pour formater la date avec protection
function formatDate(dateString) {
  if (!dateString) return 'Date inconnue';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date invalide';
  }
}

// Utiliser le proxy avec cache pour l'article spécifique
const { data: postsData, pending, error } = await useFetch(
  () => `/api/wordpress/posts`,
  {
    params: { slug: route.params.slug },
    key: `post-${route.params.slug}`,
    cache: true
  }
)

// Extraire le premier article des résultats
const currentPost = computed(() => {
  if (Array.isArray(postsData.value) && postsData.value.length > 0) {
    return postsData.value[0];
  }
  return null;
});

// Récupérer tous les posts pour la navigation avec cache
const { data: allPostsData } = await useFetch(
  () => `/api/wordpress/posts`, 
  {
    params: { per_page: 100 },
    key: 'all-posts',
    cache: true
  }
)

// Sécurisation des données pour tous les posts
const allPosts = computed(() => {
  if (Array.isArray(allPostsData.value)) {
    return allPostsData.value;
  }
  return [];
});

// Trouver la position actuelle
const currentIndex = computed(() => {
  if (!currentPost.value?.slug) return -1;
  return allPosts.value.findIndex(p => p.slug === currentPost.value.slug);
});

// Articles précédent et suivant
const prevPost = computed(() => 
  currentIndex.value > 0 ? allPosts.value[currentIndex.value - 1] : null
);

const nextPost = computed(() => 
  currentIndex.value >= 0 && currentIndex.value < allPosts.value.length - 1 
    ? allPosts.value[currentIndex.value + 1] 
    : null
);

// SEO - seulement si le post est chargé
watch(currentPost, (newPost) => {
  if (newPost) {
    useYoastSeo(newPost)
  }
}, { immediate: true });

// Mise à jour de la fonction getMediaById pour utiliser le cache
async function getMediaById(id) {
  try {
    const { data } = await useFetch(
      `/api/wordpress/media/${id}`,
      {
        key: `media-${id}`,
        cache: true
      }
    );
    return data.value;
  } catch (error) {
    console.error(`Erreur lors de la récupération du média ${id}:`, error);
    return null;
  }
}

definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})
</script>