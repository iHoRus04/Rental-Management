#!/usr/bin/env bash
set -e

# Xóa config cache trước để Laravel đọc đúng biến môi trường .env
php artisan config:clear || true

# Run migrations and seed data
php artisan migrate --seed --force || true
php artisan storage:link || true

# Cache lại config và routes cho production
php artisan config:cache || true
php artisan route:cache || true

exec php -S 0.0.0.0:${PORT:-10000} -t public
