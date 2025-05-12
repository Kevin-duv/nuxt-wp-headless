// composables/useSeo.js
export function useYoastSeo(post) {
    if (!post) return;

    // Yoast ajoute automatiquement ces deux propriétés aux réponses de l'API
    // yoast_head: HTML préfabriqué avec toutes les balises méta
    // yoast_head_json: données brutes en format JSON

    const yoastData = post.yoast_head_json || {};

    useHead({
        title: yoastData.title || post.title?.rendered,
        meta: [
            { name: 'description', content: yoastData.description || '' },
            // Open Graph
            { property: 'og:title', content: yoastData.og_title || '' },
            { property: 'og:description', content: yoastData.og_description || '' },
            { property: 'og:image', content: yoastData.og_image?.[0]?.url || '' },
            { property: 'og:type', content: yoastData.og_type || 'article' },
            { property: 'og:locale', content: yoastData.og_locale || 'fr_FR' },
            // Twitter
            { name: 'twitter:card', content: yoastData.twitter_card || 'summary_large_image' },
            { name: 'twitter:title', content: yoastData.twitter_title || '' },
            { name: 'twitter:description', content: yoastData.twitter_description || '' }
        ],
        link: [
            { rel: 'canonical', href: yoastData.canonical || '' }
        ],
        // Option avancée : injecter directement le HTML de Yoast
        // script: [
        //   { type: 'application/ld+json', innerHTML: yoastData.schema?.raw || '{}' }
        // ]
    })
}