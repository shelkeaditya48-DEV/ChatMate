@echo off

title ChatMate

cd /d "%~dp0backend\chatmate-backend"

start cmd /k ".\mvnw.cmd spring-boot:run"

timeout /t 10 /nobreak >nul

start "" "http://127.0.0.1:5500/frontend/"

exit