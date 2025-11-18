# Makefile for SGTU Event Management Server
# Simplifies Docker commands

.PHONY: help build up down logs shell migrate seed clean prod-up prod-down prod-logs

# Default target
help:
	@echo "🎓 SGTU Event Management Server - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - View application logs"
	@echo "  make shell      - Access container shell"
	@echo "  make restart    - Restart application"
	@echo ""
	@echo "Database:"
	@echo "  make migrate    - Run database migrations"
	@echo "  make seed       - Seed database with test data"
	@echo "  make setup      - Run migrations + seed"
	@echo ""
	@echo "Production:"
	@echo "  make prod-build - Build production image"
	@echo "  make prod-up    - Start production services"
	@echo "  make prod-down  - Stop production services"
	@echo "  make prod-logs  - View production logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean      - Remove containers and volumes"
	@echo "  make prune      - Remove all unused Docker data"

# Development
build:
	docker compose build

up:
	docker compose up -d
	@echo "✅ Server running at http://localhost:5000"
	@echo "📡 API available at http://localhost:5000/api"
	@echo "💚 Health check: http://localhost:5000/health"

down:
	docker compose down

logs:
	docker compose logs -f app

shell:
	docker compose exec app sh

restart:
	docker compose restart app

# Database
migrate:
	docker compose exec app npm run migrate

seed:
	docker compose exec app npm run seed

setup:
	docker compose exec app npm run setup

# Production
prod-build:
	docker compose -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.prod.yml up -d
	@echo "✅ Production server running"

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

# Cleanup
clean:
	docker compose down -v

prune:
	docker system prune -a -f
	docker volume prune -f

# Status
status:
	docker compose ps
	@echo ""
	docker stats --no-stream

# Health check
health:
	@curl -s http://localhost:5000/health | jq
