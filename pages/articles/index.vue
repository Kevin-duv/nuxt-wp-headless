<template>
  <div>
    <Breadcrumb />
    <div class="py-8">
      <h1 class="text-3xl font-bold mb-8">Tous les articles</h1>
      <div v-if="sortedPosts.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="post in sortedPosts" :key="post.id" class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <NuxtLink :to="`/articles/${post.slug}`" class="block p-4">
            <h2 class="text-xl font-semibold mb-2" v-html="post.title?.rendered"></h2>
            <div class="text-gray-500 text-sm mb-2">
              {{ formatDate(post.date) }}
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
    </div>
  </div>
</template>

<script setup>
import { useRuntimeConfig } from '#imports'
import { computed } from 'vue'

const config = useRuntimeConfig()

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

const { data: postsResponse = [], pending, error } = await useFetch(
  () => `${config.public.wordpressApi}/posts?per_page=12&_embed`
)

const posts = computed(() => {
  if (Array.isArray(postsResponse.value)) {
    return postsResponse.value;
  }
  else if (postsResponse.value && typeof postsResponse.value === 'object') {
    if (Array.isArray(postsResponse.value.posts)) {
      return postsResponse.value.posts;
    }
    return [postsResponse.value];
  }
  return [];
})

const sortedPosts = computed(() => 
  [...posts.value].sort((a, b) => new Date(b.date) - new Date(a.date))
)

if (error.value) {
  console.error('Erreur lors du chargement des articles:', error.value)
}

definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in'
  }
})
</script>