@echo off
title GameCloud Platform Starter
echo ========================================================
echo       Starting GameCloud Browser Gaming Platform        
echo ========================================================
echo.

cd /d "%~dp0backend"
echo [1/2] Starting Express API Backend on port 5055...
start "GameCloud Backend (Port 5055)" cmd /k "npm run dev"

cd /d "%~dp0frontend"
echo [2/2] Starting React Vite Frontend on port 5173...
start "GameCloud Frontend (Port 5173)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul
echo.
echo Opening GameCloud in your browser...
start http://localhost:5173

echo.
echo ========================================================
echo  GameCloud is running!
echo  URL: http://localhost:5173
echo  Backend: http://localhost:5055
echo ========================================================
