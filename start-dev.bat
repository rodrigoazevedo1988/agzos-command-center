@echo off
setlocal EnableDelayedExpansion

echo ============================================================
echo   Agzos Command Center - Ambiente de Desenvolvimento
echo ============================================================
echo.

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

if not exist "%ROOT%\.env" (
    echo [ERRO] Arquivo .env nao encontrado.
    echo        Copie .env.example para .env e preencha DATABASE_URL.
    pause
    exit /b 1
)

for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%ROOT%\.env") do (
    if not "%%A"=="" if not "%%B"=="" set "%%A=%%B"
)

if "!DATABASE_URL!"=="" (
    echo [ERRO] DATABASE_URL nao definida no .env.
    pause
    exit /b 1
)

if "!API_PORT!"=="" set "API_PORT=8080"
if "!FRONTEND_PORT!"=="" set "FRONTEND_PORT=5173"

echo [INFO] API Server   -> http://localhost:!API_PORT!
echo [INFO] Frontend Web -> http://localhost:!FRONTEND_PORT!
echo.

echo [1/2] Iniciando API Server...
start "Agzos API Server" cmd /k "set PORT=!API_PORT! && set NODE_ENV=development && set LOG_LEVEL=info && set DATABASE_URL=!DATABASE_URL! && cd /d "!ROOT!" && pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/api-server run start"

echo Aguardando API iniciar (8s)...
timeout /t 8 /nobreak >nul

echo [2/2] Iniciando Frontend Web...
start "Agzos Frontend" cmd /k "set PORT=!FRONTEND_PORT! && set BASE_PATH=/ && set NODE_ENV=development && cd /d "!ROOT!" && pnpm --filter @workspace/agzos-hub run dev"

echo.
echo Abrindo navegador em 8 segundos...
timeout /t 8 /nobreak >nul
start "" "http://localhost:!FRONTEND_PORT!"

echo.
echo ============================================================
echo   Servicos rodando. Feche as janelas para encerrar.
echo ============================================================
endlocal