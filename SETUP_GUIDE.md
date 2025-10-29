# AI Tools Directory - Setup Guide

A full-stack MVP application for discovering and sharing AI tools, built with Laravel and Next.js.

## Features

- Authentication using Laravel Sanctum (email/password login)
- Role-based access control with 6 predefined roles
- Tool management (add, browse, categorize)
- Role-based tool recommendations
- Clean, responsive UI with Tailwind CSS

## Tech Stack

- **Backend**: Laravel 12 + PHP 8.2 + MySQL 8.0
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Authentication**: Laravel Sanctum
- **Containerization**: Docker + Docker Compose

## Quick Start

### 1. Start the Docker Environment

```bash
./start.sh
```

This will start all services:
- Frontend: http://localhost:8200
- Backend: http://localhost:8201
- MySQL: localhost:8203
- Redis: localhost:8204

### 2. Setup the Backend

Run the setup script to initialize the Laravel backend:

```bash
./setup-backend.sh
```

This script will:
- Install Composer dependencies
- Generate application key
- Run database migrations
- Seed the database with demo data

### 3. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:8200

You will be redirected to the login page.

## Demo Accounts

| Name           | Role                | Email                   | Password |
| -------------- | ------------------- | ----------------------- | -------- |
| Ivan Ivanov    | Owner               | ivan@admin.local        | password |
| Elena Petrova  | Frontend Developer  | elena@frontend.local    | password |
| Petar Georgiev | Backend Developer   | petar@backend.local     | password |

## Application Structure

### Backend (Laravel)

```
backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php      # Login, logout, get user
│   │   ├── ToolController.php      # CRUD operations for tools
│   │   └── CategoryController.php  # List categories
│   ├── Models/
│   │   ├── User.php                # User model with role relationship
│   │   ├── Role.php                # Role model
│   │   ├── Tool.php                # Tool model
│   │   └── Category.php            # Category model
│   └── Policies/
│       └── ToolPolicy.php          # Authorization for tool operations
├── database/
│   ├── migrations/                 # Database schema migrations
│   └── seeders/
│       └── DatabaseSeeder.php      # Seed roles, users, categories, tools
└── routes/
    └── api.php                     # API routes
```

### Frontend (Next.js)

```
frontend/src/
├── app/
│   ├── login/
│   │   └── page.tsx               # Login page with form
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard showing user info and tools
│   ├── layout.tsx                 # Root layout with AuthProvider
│   └── page.tsx                   # Home page (redirects to login/dashboard)
├── contexts/
│   └── AuthContext.tsx            # Authentication context and hooks
└── lib/
    └── api.ts                     # API client for backend communication
```

## API Endpoints

### Public Endpoints

- `POST /api/login` - User login

### Protected Endpoints (require authentication)

- `GET /api/me` - Get current user with role
- `POST /api/logout` - Logout current user
- `GET /api/categories` - List all categories
- `GET /api/tools` - List all tools
- `POST /api/tools` - Add a new tool (authenticated users only)
- `GET /api/tools/{id}` - Get tool details
- `PUT /api/tools/{id}` - Update tool (owner only)
- `DELETE /api/tools/{id}` - Delete tool (owner only)

## Database Schema

### Tables

1. **roles** - User roles (Owner, Backend Developer, Frontend Developer, QA, Designer, Project Manager)
2. **users** - Application users with role assignment
3. **categories** - Tool categories
4. **tools** - AI tools with category and user associations
5. **role_tool_recommendations** - Many-to-many relationship for role-based recommendations

## Development

### Backend Commands

```bash
# Access PHP container
docker compose exec php_fpm sh

# Run migrations
docker compose exec php_fpm php artisan migrate

# Seed database
docker compose exec php_fpm php artisan db:seed

# Clear cache
docker compose exec php_fpm php artisan cache:clear
docker compose exec php_fpm php artisan config:clear

# View logs
docker compose logs php_fpm -f
docker compose logs backend -f
```

### Frontend Commands

```bash
# Access frontend container
docker compose exec frontend sh

# Install packages
docker compose exec frontend npm install

# View logs
docker compose logs frontend -f
```

### Database Access

```bash
# Connect to MySQL
./db-manage.sh connect

# Or directly
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app
```

## Stopping the Environment

```bash
./stop.sh
```

## Troubleshooting

### Port Conflicts

If ports 8200-8205 are already in use, you can modify them in `docker-compose.yml`.

### Permission Issues

If you encounter permission issues with Laravel:

```bash
./laravel-setup.sh
```

### Database Connection Issues

Make sure the MySQL container is running:

```bash
docker compose ps
```

If the database is not accessible, restart the containers:

```bash
docker compose restart
```

### Frontend Not Connecting to Backend

Check that the `NEXT_PUBLIC_API_URL` environment variable is set correctly in the frontend container. It should be `http://localhost:8201/api`.

## Features Demonstration

1. **Authentication Flow**
   - Visit http://localhost:8200
   - Login with one of the demo accounts
   - You'll be redirected to the dashboard

2. **Role Display**
   - Dashboard shows: "Welcome, [name]! You have the role: [role]"
   - Role is displayed with a colored badge

3. **Tool Management**
   - View all existing tools
   - Add new tools (requires authentication)
   - See tool categories
   - View tool details including creator

4. **Responsive Design**
   - Clean, modern interface
   - Works on mobile, tablet, and desktop

## Next Steps for Expansion

This MVP provides a solid foundation. Potential enhancements:

1. Tool filtering by category
2. Role-based tool recommendations
3. Search functionality
4. User profiles and avatars
5. Tool ratings and reviews
6. Admin panel for managing users and roles
7. Tool bookmarking/favorites
8. Social features (comments, discussions)
9. API documentation with Swagger
10. Unit and integration tests

## Support

For issues or questions, check:
- Docker logs: `docker compose logs -f`
- Laravel logs: `backend/storage/logs/laravel.log`
- Browser console for frontend errors
