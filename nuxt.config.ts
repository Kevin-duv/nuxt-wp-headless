// nuxt.config.js
export default defineNuxtConfig({
  ssr: true, // Option 1: Si vous voulez une SPA sans rendu côté serveur

  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/critters',
    '@nuxt/image'  // Ajoutez cette ligne
  ],

  // Configuration des transitions
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      wordpressApi: process.env.WORDPRESS_API_URL || 'http://nuxt-test.local/wp-json/wp/v2',
      mediaEndpoint: '/media'
    }
  },

  critters: {
    // Inliner le CSS critique
    preload: 'swap'
  },

  vite: {
    build: {
      minify: true
    }
  },

  // Ajoutez cette configuration pour le cache
  nitro: {
    routeRules: {
      '/api/wordpress/**': process.env.NODE_ENV === 'development' 
        ? { // Mode développement : pas de cache
            cache: false
          } 
        : { // Mode production/preview : cache activé
            cache: { 
              maxAge: 120, // 10 minutes
            }
          }
    }
  },

  image: {
    provider: 'ipx',
    format: ['webp']

  }
})