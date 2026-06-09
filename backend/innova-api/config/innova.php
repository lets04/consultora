<?php

return [
    'jwt_secret' => env('JWT_SECRET', 'InnovaDevSecretKey_ChangeInProduction_Min32Chars!'),
    'jwt_issuer' => env('JWT_ISSUER', 'Innova'),
    'jwt_audience' => env('JWT_AUDIENCE', 'Innova.Frontend'),
    'jwt_cookie' => 'innova_token',
    'jwt_ttl_hours' => 8,
    'cors_origins' => array_filter(array_map('trim', explode(',', env('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')))),
];
