@echo off
title Stop GameCloud Platform
echo Stopping GameCloud services on ports 5055 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5055') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a >nul 2>&1

echo GameCloud services stopped.
pause
