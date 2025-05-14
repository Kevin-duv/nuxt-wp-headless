<?php
// functions.php

// Autoriser CORS pour l'API REST
function add_cors_headers() {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Si c'est une requête OPTIONS (preflight), renvoyer 200 OK
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit();
    }
}
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        add_cors_headers();
        return $value;
    });
});

// Ajouter les headers CORS aux requêtes normales aussi
add_action('init', 'add_cors_headers');

// Enregistrer les blocs ACF
add_action('acf/init', 'my_acf_headless_register_blocks');
function my_acf_headless_register_blocks() {
    if (!function_exists('acf_register_block_type')) {
        return;
    }

    acf_register_block_type(array(
        'name'              => 'texte-simple',
        'title'             => 'Texte simple',
        'description'       => 'Un bloc de texte simple',
        'render_callback'   => 'my_acf_headless_render',
        'category'          => 'common',
        'icon'              => 'text',
        'keywords'          => array('texte', 'simple'),
        'supports'          => array(
            'mode'        => false,
            'align'       => false,
            'multiple'    => true,
            'anchor'      => true,
        ),
        'enqueue_assets'    => function() {
            wp_enqueue_script('acf-texte-simple', get_template_directory_uri() . '/assets/js/acf-texte-simple.js', array('acf-input'), null, true);
        }
    ));
}

function my_acf_headless_render($block, $content = '', $is_preview = false) {
    $fields = get_fields();

    if ($is_preview) {
        echo '<div style="padding:1em;border:1px dashed #888;background:#f7f7f7">';
        echo '<strong>Texte simple :</strong><br>';
        echo nl2br(esc_html($fields['texte'] ?? ''));
        echo '</div>';
    } else {
        return '<div class="texte-simple">' . nl2br(esc_html($fields['texte'] ?? '')) . '</div>';
    }
}

// Ajouter les données de blocs à l'API standard de WordPress
function add_blocks_to_posts($data, $post, $context) {
    // Ne pas exécuter cette fonction si la requête vient de l'admin WordPress
    // Cela permet d'éviter d'interférer avec Gutenberg
    if (is_admin() || (defined('REST_REQUEST') && REST_REQUEST && strpos($_SERVER['HTTP_REFERER'] ?? '', admin_url()) !== false)) {
        return $data;
    }
    
    // Pour les requêtes externes uniquement (Nuxt.js), ajouter les données de blocs
    $data->data['blocks'] = parse_blocks(get_post_field('post_content', $post->ID));
    
    // Ajouter les données ACF des blocs
    $acf_blocks = [];
    foreach ($data->data['blocks'] as $block) {
        if (!empty($block['blockName']) && strpos($block['blockName'], 'acf/') === 0) {
            if (!empty($block['attrs']['data'])) {
                $acf_blocks[] = [
                    'name' => $block['blockName'],
                    'data' => $block['attrs']['data']
                ];
            }
        }
    }
    $data->data['acf_blocks'] = $acf_blocks;
    
    return $data;
}
add_filter('rest_prepare_post', 'add_blocks_to_posts', 10, 3);





// Activer le support des images à la une (thumbnails/featured images)
function theme_setup() {
    // Ajouter le support des images à la une
    add_theme_support('post-thumbnails');
    
    // Définir des tailles d'images personnalisées (optionnel)
    add_image_size('card-thumbnail', 600, 400, true); // Taille optimisée pour les cartes d'articles
    add_image_size('featured-large', 1200, 800, true); // Taille pour les grandes images à la une
}
add_action('after_setup_theme', 'theme_setup');




// Ajouter les tailles d'images personnalisées à l'API REST
function add_image_sizes_to_api($response, $attachment, $request) {
    $data = $response->get_data();
    
    // Vérifier si l'on a des tailles d'images
    if (isset($data['media_details']) && isset($data['media_details']['sizes'])) {
        // Ajouter les URLs pour nos tailles personnalisées
        $sizes = $data['media_details']['sizes'];
        
        if (isset($sizes['card-thumbnail'])) {
            $data['media_details']['sizes']['card-thumbnail']['source_url'] = 
                wp_get_attachment_image_url($attachment->ID, 'card-thumbnail');
        }
        
        if (isset($sizes['featured-large'])) {
            $data['media_details']['sizes']['featured-large']['source_url'] = 
                wp_get_attachment_image_url($attachment->ID, 'featured-large');
        }
        
        $response->set_data($data);
    }
    
    return $response;
}
add_filter('rest_prepare_attachment', 'add_image_sizes_to_api', 10, 3);


// Supprimer tout le code de l'endpoint personnalisé ci-dessous
// (supprimer les fonctions register_rest_route, get_all_custom_posts, 
// get_single_custom_post, extract_acf_blocks et format_post_data)