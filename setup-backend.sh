#!/bin/bash

echo "🚀 Setting up Laravel backend..."

echo "📦 Installing Composer dependencies..."
docker compose exec php_fpm composer install

echo "🔑 Generating application key..."
docker compose exec php_fpm php artisan key:generate

echo "🗄️ Running database migrations..."
docker compose exec php_fpm php artisan migrate --force

echo "🌱 Seeding database..."
docker compose exec php_fpm php artisan db:seed --force

echo "✨ Backend setup complete!"
echo ""
echo "📝 Demo accounts:"
echo "  - ivan@admin.local / password (Owner)"
echo "  - elena@frontend.local / password (Frontend Developer)"
echo "  - petar@backend.local / password (Backend Developer)"
echo ""
echo "🌐 Access your application at:"
echo "  - Frontend: http://localhost:8200"
echo "  - Backend API: http://localhost:8201/api"
