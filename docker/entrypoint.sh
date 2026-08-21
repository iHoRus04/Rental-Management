#!/usr/bin/env bash
set -e

echo "==> Entrypoint starting for Rental-Management"

# Ensure storage directories exist and have full write permissions
mkdir -p /var/www/html/storage/logs /var/www/html/storage/framework/views /var/www/html/storage/framework/sessions /var/www/html/storage/framework/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Clear config cache first to ensure Laravel reads current environment variables
echo "==> Clearing config cache"
php artisan config:clear || true

# Run database migrations and seeders
# If there are half-created tables from a failed previous run, we need a fresh start
echo "==> Running database migrations and seeders"
php artisan migrate:fresh --seed --force || php artisan migrate --seed --force || true

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
