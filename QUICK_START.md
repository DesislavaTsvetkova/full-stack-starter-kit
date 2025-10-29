# Quick Start Guide

## Start the Application

```bash
# 1. Start Docker containers
./start.sh

# 2. Setup Laravel backend (first time only)
./setup-backend.sh
```

## Access the Application

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:8201/api

## Login Credentials

| Email                   | Password | Role               |
| ----------------------- | -------- | ------------------ |
| ivan@admin.local        | password | Owner              |
| elena@frontend.local    | password | Frontend Developer |
| petar@backend.local     | password | Backend Developer  |

## What You Can Do

1. **Login** with any of the demo accounts
2. **View Dashboard** showing your name and role
3. **Browse AI Tools** in the tools list
4. **Add New Tools** by clicking "Add Tool" button
5. **Categorize Tools** by selecting from available categories
6. **Logout** when done

## Stop the Application

```bash
./stop.sh
```

## Need Help?

See `SETUP_GUIDE.md` for detailed documentation.
