# Run from the backend directory
```pwsd
cd backend
docker compose up --build -d
```

# View logs
```pwsd
docker compose logs -f backend
```

# Stop everything
```pwsd
docker compose down
```

# Stop and wipe the database volume (fresh start)
```pwsd
docker compose down -v
```

# Create a Django superuser
```pwsd
docker compose exec backend python manage.py createsuperuser
```

# Run Django shell
```pwsd
docker compose exec backend python manage.py shell
```

# Make migrations
```pwsd
docker compose exec backend python manage.py makemigrations <app_name>
```

# Migrate
```pwsd
docker compose exec backend python manage.py migrate
```

# Clear Database
```pwsd
docker compose down -v
docker compose up --build -d
```

# React Frontend
```pwsd
cd ..\frontend
npm install
npm run dev
```
