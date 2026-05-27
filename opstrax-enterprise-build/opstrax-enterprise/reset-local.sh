#!/usr/bin/env bash
set -e
docker compose down -v --remove-orphans
docker compose up --build -d
printf "\nOpsTrax reset complete:\nFrontend: http://localhost:10000\nSwagger: http://localhost:8088/swagger\nNode health: http://localhost:8090/health\n"
