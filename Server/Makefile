coverage:
	cd CamQuizzBE.Tests && \
	dotnet test --collect:"XPlat Code Coverage" \
		-- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=cobertura && \
	reportgenerator -reports:"./TestResults/**/*.cobertura.xml" -targetdir:"./CoverageReport" && \
	xdg-open ./CoverageReport/index.html
test:
	cd CamQuizzBE.Tests && dotnet test
server:
	cd CamQuizzBE && dotnet run
	
container-up:
	docker compose up -d

sync:
	cd CamQuizzBE && dotnet ef database update

migrate:
	cd CamQuizzBE && dotnet ef migrations add $(name) --output-dir ./Infras/Data/Migrations

.PHONY: coverage container-up sync migrate test
