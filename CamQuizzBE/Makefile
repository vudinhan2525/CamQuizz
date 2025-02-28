container-up:
	docker compose up -d

sync:
	dotnet ef database update

migrate:
	dotnet ef migrations add $(name) --output-dir ./Infras/Data/Migrations

.PHONY: container-up sync migrate
