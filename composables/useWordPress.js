import { useRuntimeConfig } from '#app';

export function useWordPress() {
    const config = useRuntimeConfig();

    /**
     * Récupère l'URL de l'image à la une d'un article, optimisée pour l'affichage
     * @param {Object} post - L'objet post WordPress avec les données _embedded
     * @param {String} preferredSize - Taille d'image préférée (optionnel)
     * @returns {String|null} - L'URL de l'image ou null si pas d'image
     */
    function getFeaturedImage(post, preferredSize = 'card-thumbnail') {
        if (!post ||
            !post._embedded ||
            !post._embedded['wp:featuredmedia'] ||
            !post._embedded['wp:featuredmedia'][0]) {
            return null;
        }

        const media = post._embedded['wp:featuredmedia'][0];

        if (media.media_details && media.media_details.sizes) {
            const sizes = media.media_details.sizes;

            // Chercher d'abord la taille préférée
            if (preferredSize && sizes[preferredSize]) {
                return sizes[preferredSize].source_url;
            }

            // Ordre de priorité des tailles de secours
            return sizes['card-thumbnail']?.source_url ||
                sizes.medium_large?.source_url ||
                sizes.medium?.source_url ||
                sizes.large?.source_url ||
                media.source_url;
        }

        return media.source_url || null;
    }

    /**
     * Récupère l'extrait formaté d'un article
     */
    function getPostExcerpt(post, maxLength = 150) {
        if (!post || !post.excerpt || !post.excerpt.rendered) {
            return '';
        }

        // Enlever les balises HTML
        const excerpt = post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, "");

        // Tronquer si nécessaire
        if (excerpt.length <= maxLength) {
            return excerpt;
        }

        return excerpt.substring(0, maxLength) + '...';
    }

    // Fonction pour récupérer les articles avec cache
    async function fetchPosts(params = {}) {
        // Construire les paramètres de requête
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        
        // Utiliser le proxy avec cache automatique
        const { data, error } = await useFetch(`/api/wordpress/posts?${queryParams.toString()}`, {
            key: `posts-${JSON.stringify(params)}`,
            server: true, // Important pour le SSR
            cache: true
        });
        
        if (error.value) {
            console.error('Erreur de récupération des articles:', error.value);
            return [];
        }
        
        return data.value || [];
    }
    
    // Fonction pour récupérer un article par slug
    async function fetchPostBySlug(slug) {
        const { data } = await useFetch(`/api/wordpress/posts`, {
            key: `post-${slug}`,
            params: { slug, _embed: true },
            server: true,
            cache: true
        });
        
        return data.value?.[0] || null;
    }

    // Fonction pour récupérer les produits
    async function fetchProducts(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, value);
        });
        
        const { data, error } = await useFetch(`/api/wordpress/products?${queryParams.toString()}`, {
            key: `products-${JSON.stringify(params)}`,
            server: true,
            cache: true
        });
        
        if (error.value) {
            console.error('Erreur de récupération des produits:', error.value);
            return [];
        }
        
        return data.value || [];
    }

    // Fonction pour récupérer un produit par slug
    async function fetchProductBySlug(slug) {
        const { data } = await useFetch(`/api/wordpress/products`, {
            key: `product-${slug}`,
            params: { slug, _embed: true },
            server: true,
            cache: true
        });
        
        return data.value?.[0] || null;
    }

    return {
        getFeaturedImage,
        getPostExcerpt,
        fetchPosts,
        fetchPostBySlug,
        fetchProducts,
        fetchProductBySlug,
        // Vous pourrez ajouter d'autres fonctions utiles ici
    };
}