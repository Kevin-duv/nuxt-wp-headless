<?php
// Proxy toutes les requêtes vers ton serveur Nuxt en dev
$uri  = $_SERVER['REQUEST_URI'];
$host = 'http://localhost:3000';
header("Location: {$host}{$uri}", true, 307);
exit;


