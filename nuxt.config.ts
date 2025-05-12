// nuxt.config.js
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss'
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
      wordpressApi: process.env.WORDPRESS_API || 'http://nuxt-test.local/wp-json/wp/v2'
    }
  }
})