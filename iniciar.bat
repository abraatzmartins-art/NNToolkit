@echo off
title Apify Research Hub
echo ========================================
echo   Apify Research Hub
echo ========================================
echo.
echo Iniciando servidor...
echo Acesse no navegador: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor.
echo.

cd /d "%~dp0"
npm run dev
pause
