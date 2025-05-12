(function ($) {
    // Forcer la sauvegarde des données ACF lorsqu'elles changent
    $(document).on('change', '.acf-block-fields input, .acf-block-fields textarea', function () {
        // Utiliser setTimeout pour laisser le temps à ACF de mettre à jour les données
        setTimeout(function () {
            // Déclencher une sauvegarde automatique
            wp.data.dispatch('core/editor').savePost();
        }, 500);
    });
})(jQuery);