<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Controls CORS settings for API and web endpoints.
    | Allows Vercel frontend (https://dreamhouse-pied.vercel.app) to call Render backend.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://dreamhouse-pied.vercel.app',
        'https://dreamhouse-app.onrender.com',
        'http://localhost:5173',
        'http://localhost:3000',
    ],

    // Must be valid regex patterns (not glob), fruitcake uses preg_match()
    'allowed_origins_patterns' => [
        '#^https://[a-z0-9-]+\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
