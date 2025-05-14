import { ref, reactive } from 'vue';

export function useWordPressMedia() {
    const loadingMedia = ref(new Set());
    const mediaCache = reactive({});
    const errors = ref(new Set());

    // Charger un média par son ID
    async function loadMedia(id) {
        if (!id || mediaCache[id]) return mediaCache[id];

        loadingMedia.value.add(id);

        try {
            const config = useRuntimeConfig();
            const url = `${config.public.wordpressApi}${config.public.mediaEndpoint}/${id}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`Erreur ${response.status}`);

            const data = await response.json();
            if (data.source_url) {
                const mediaData = {
                    url: data.source_url,
                    alt: data.alt_text || data.title?.rendered || `Image ${id}`,
                    id
                };

                mediaCache[id] = mediaData;
                return mediaData;
            }

            throw new Error('URL non trouvée');
        } catch (e) {
            console.error(`Erreur chargement média ${id}:`, e);
            errors.value.add(id);
            return null;
        } finally {
            loadingMedia.value.delete(id);
        }
    }

    return {
        loadMedia,
        mediaCache,
        loadingMedia,
        errors
    };
}