import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
    // Récupérer le chemin demandé après /api/wordpress/
    const path = event.context.params._;
    const query = getQuery(event);

    // Obtenir la configuration runtime depuis #imports (automatique dans Nuxt 3)
    const config = useRuntimeConfig();

    // Construire l'URL complète
    const wpApiBase = config.public.wordpressApi || 'http://nuxt-test.local/wp-json/wp/v2';
    const url = new URL(`${wpApiBase}/${path}`);

    // Ajouter les paramètres
    Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    // Faire la requête à WordPress
    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: `WordPress API error: ${response.statusText}`
            });
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur API WordPress:', error);
        throw createError({
            statusCode: 500,
            message: "Erreur lors de l'appel à l'API WordPress"
        });
    }
});