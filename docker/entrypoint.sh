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

# Drop entire public schema and recreate it — this clears ALL tables including partial ones
# This is the most reliable way to handle failed PostgreSQL transactions
echo "==> Resetting PostgreSQL public schema"
php -r "
\$host = getenv('DB_HOST') ?: '127.0.0.1';
\$port = getenv('DB_PORT') ?: '5432';
\$db   = getenv('DB_DATABASE') ?: 'neondb';
\$user = getenv('DB_USERNAME') ?: 'root';
\$pass = getenv('DB_PASSWORD') ?: '';
try {
    \$pdo = new PDO(\"pgsql:host=\$host;port=\$port;dbname=\$db;sslmode=require\", \$user, \$pass);
    \$pdo->exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    echo '==> Schema reset successfully' . PHP_EOL;
} catch (Exception \$e) {
    echo '==> Schema reset skipped: ' . \$e->getMessage() . PHP_EOL;
}
" || true

# Run database migrations and seeders from clean slate
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
