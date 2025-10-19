# Start dev environment
up:
	docker compose up -d --build

# Run migrations
migrate:
	docker compose exec backend python manage.py migrate

# Create superuser
superuser:
	docker compose exec backend python manage.py createsuperuser

# Stop dev
down:
	docker compose down

test:
	docker compose exec backend pytest $(file)

# Start production
up-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Stop production
down-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down