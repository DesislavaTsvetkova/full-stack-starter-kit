# Troubleshooting Guide

## Common Issues and Solutions

### 1. Cannot Connect to Backend API

**Symptom**: Frontend shows "Failed to fetch" errors or login doesn't work.

**Solutions**:

a) Check if backend is running:
```bash
docker compose ps
```

b) Check backend logs:
```bash
docker compose logs backend -f
docker compose logs php_fpm -f
```

c) Verify API is accessible:
```bash
curl http://localhost:8201/api/me
```

d) Check NEXT_PUBLIC_API_URL in frontend:
```bash
docker compose exec frontend env | grep API
```

### 2. Database Connection Failed

**Symptom**: Laravel shows "Connection refused" or "Access denied" errors.

**Solutions**:

a) Check MySQL is running:
```bash
docker compose ps mysql
```

b) Verify database credentials in backend/.env:
```
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vibecode-full-stack-starter-kit_app
DB_USERNAME=root
DB_PASSWORD=vibecode-full-stack-starter-kit_mysql_pass
```

c) Restart MySQL container:
```bash
docker compose restart mysql
```

d) Wait for MySQL to fully start (30 seconds), then run migrations:
```bash
./setup-backend.sh
```

### 3. Migrations Failed

**Symptom**: "php artisan migrate" fails with errors.

**Solutions**:

a) Check if database exists:
```bash
./db-manage.sh connect
SHOW DATABASES;
```

b) Drop and recreate database (WARNING: destroys all data):
```bash
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass -e "DROP DATABASE IF EXISTS \`vibecode-full-stack-starter-kit_app\`;"
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass -e "CREATE DATABASE \`vibecode-full-stack-starter-kit_app\`;"
./setup-backend.sh
```

c) Reset migrations:
```bash
docker compose exec php_fpm php artisan migrate:fresh --seed
```

### 4. "Class not found" Errors in Laravel

**Symptom**: Laravel shows "Target class [ClassName] does not exist".

**Solutions**:

a) Clear Laravel cache:
```bash
docker compose exec php_fpm php artisan cache:clear
docker compose exec php_fpm php artisan config:clear
docker compose exec php_fpm php artisan route:clear
```

b) Regenerate autoload files:
```bash
docker compose exec php_fpm composer dump-autoload
```

### 5. Frontend Not Hot-Reloading

**Symptom**: Changes to frontend code don't appear in browser.

**Solutions**:

a) Check frontend logs:
```bash
docker compose logs frontend -f
```

b) Restart frontend container:
```bash
docker compose restart frontend
```

c) Clear Next.js cache:
```bash
docker compose exec frontend rm -rf .next
docker compose restart frontend
```

### 6. Port Already in Use

**Symptom**: "Error: Port 8200 is already allocated" when starting Docker.

**Solutions**:

a) Check what's using the port:
```bash
lsof -i :8200
# or
netstat -tulpn | grep 8200
```

b) Stop the conflicting service or change port in docker-compose.yml:
```yaml
ports:
  - "8210:3000"  # Change 8200 to 8210
```

### 7. Permission Denied Errors

**Symptom**: Laravel shows permission errors for storage or cache directories.

**Solutions**:

```bash
./laravel-setup.sh
```

Or manually:
```bash
docker compose exec php_fpm chmod -R 777 storage bootstrap/cache
```

### 8. CORS Errors

**Symptom**: Browser console shows "CORS policy" errors.

**Solutions**:

a) Verify CORS configuration in backend/config/cors.php:
```php
'allowed_origins' => ['http://localhost:8200'],
'supports_credentials' => true,
```

b) Check Sanctum configuration in backend/.env:
```
SANCTUM_STATEFUL_DOMAINS=localhost:8200
```

c) Restart backend:
```bash
docker compose restart backend php_fpm
```

### 9. Login Token Not Persisting

**Symptom**: User is logged out after page refresh.

**Solutions**:

a) Check browser console for localStorage errors
b) Clear browser cache and localStorage
c) Verify token is being saved in AuthContext
d) Check if browser blocks localStorage (private browsing mode)

### 10. Composer Install Fails

**Symptom**: "composer install" shows dependency errors.

**Solutions**:

a) Clear Composer cache:
```bash
docker compose exec php_fpm composer clear-cache
```

b) Remove vendor directory and reinstall:
```bash
docker compose exec php_fpm rm -rf vendor
docker compose exec php_fpm composer install
```

c) Update Composer:
```bash
docker compose exec php_fpm composer self-update
```

## Getting Help

### Check Logs

Always start by checking the logs:

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs frontend -f
docker compose logs php_fpm -f
docker compose logs mysql -f
```

### Service Status

Check if all services are running:

```bash
docker compose ps
```

All services should show "Up" status.

### Database Access

Connect to database to verify data:

```bash
./db-manage.sh connect
```

Then run SQL queries:
```sql
SELECT * FROM users;
SELECT * FROM roles;
SELECT * FROM tools;
```

### Fresh Start

If all else fails, completely reset:

```bash
# Stop and remove everything
docker compose down -v

# Remove all project containers and volumes
docker volume ls | grep vibecode-full-stack-starter-kit | awk '{print $2}' | xargs docker volume rm

# Start fresh
./start.sh
./setup-backend.sh
```

## Still Having Issues?

1. Check the logs for specific error messages
2. Search for the error message online
3. Verify Docker is running: `docker ps`
4. Check available disk space: `df -h`
5. Verify port availability: `netstat -tulpn | grep -E '8200|8201|8203'`
