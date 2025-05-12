<template>
  <div class="site-wrapper">
    <header class="bg-white shadow-sm">
      <div class="container mx-auto py-4">
        <h1 class="text-2xl font-bold">
          <NuxtLink to="/" class="hover:text-blue-600">Mon Site Headless WordPress</NuxtLink>
        </h1>
      </div>
    </header>
    <main class="container mx-auto py-8">
      <NuxtLayout>
        <transition name="page" mode="out-in">
          <NuxtPage />
        </transition>
      </NuxtLayout>
    </main>
    
    <footer class="bg-gray-100 mt-auto">
      <div class="container mx-auto py-4 text-center text-gray-600">
        &copy; {{ new Date().getFullYear() }} - Site propulsé par Nuxt et WordPress
      </div>
    </footer>
  </div>
</template>

<script setup>
// La vue ne dispose pas de Suspense pour éviter les conflits avec les transitions
</script>

<style>
/* Styles spécifiques à la mise en page */
.site-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Transitions améliorées sans saut de position */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>




