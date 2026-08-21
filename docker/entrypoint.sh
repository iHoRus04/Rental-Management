#!/usr/bin/env bash
set -e

echo "==> Entrypoint starting for Rental-Management"

# Clear config cache first to ensure Laravel reads current environment variables
echo "==> Clearing config cache"
php artisan config:clear || true

# Set storage and cache permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Run database migrations and seeders
echo "==> Running database migrations and seeders"
php artisan migrate --seed --force || true

# Ensure storage link
echo "==> Creating storage symlink"
php artisan storage:link || true

# Cache config & routes in production
if [ "${APP_ENV:-production}" = "production" ]; then
  echo "==> Caching config and routes"
  php artisan config:cache || true
  php artisan route:cache || true
fi

echo "==> Starting supervisord"
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
