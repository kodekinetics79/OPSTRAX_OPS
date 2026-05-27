#!/usr/bin/env bash
set -e
docker compose down --remove-orphans
docker rm -f opstrax-frontend opstrax-dotnet-api opstrax-node-events opstrax-mysql 2>/dev/null || true
printf "\nStarting OpsTrax...\n\n"
docker compose up --build -d
printf "\nOpsTrax is available at:\nFrontend: http://localhost:10000\nSwagger: http://localhost:8088/swagger\nNode health: http://localhost:8090/health\n\nUse './stop-local.sh' to stop the stack.\n"
