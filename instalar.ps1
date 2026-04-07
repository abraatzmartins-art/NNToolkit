# =============================================
# Apify Research Hub - Instalador Simplificado
# Para quem JA TEM npm/Node.js instalado
# =============================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Apify Research Hub - Instalador" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# === 1. Verificar Node.js ===
Write-Host "[1/4] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = & node --version
    $npmVer = & npm --version
    Write-Host "       Node.js: $nodeVer" -ForegroundColor Green
    Write-Host "       npm: $npmVer" -ForegroundColor Green
} catch {
    Write-Host "       ERRO: Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "       Instale em: https://nodejs.org" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# === 2. Copiar arquivos do projeto ===
$scriptDir = $PSScriptRoot
$projectDir = "$scriptDir"

Write-Host "[2/4] Projeto ja esta na pasta atual." -ForegroundColor Green

# === 3. Instalar dependencias ===
Write-Host "[3/4] Instalando dependencias (npm install)..." -ForegroundColor Yellow
Write-Host "       Isso pode levar alguns minutos..." -ForegroundColor Gray

Set-Location $projectDir
& npm install 2>&1 | ForEach-Object { Write-Host "       $_" -ForegroundColor DarkGray }

Write-Host "       Dependencias instaladas!" -ForegroundColor Green

# === 4. Configurar banco de dados ===
Write-Host "[4/4] Configurando banco de dados SQLite..." -ForegroundColor Yellow

& npx prisma generate 2>&1 | ForEach-Object { Write-Host "       $_" -ForegroundColor DarkGray }
& npx prisma db push 2>&1 | ForEach-Object { Write-Host "       $_" -ForegroundColor DarkGray }

Write-Host "       Banco de dados configurado!" -ForegroundColor Green

# === CONCLUIDO ===
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  INSTALACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar, clique 2x em: iniciar.bat" -ForegroundColor Cyan
Write-Host "Ou rode: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para abrir o navegador"
Start-Process "http://localhost:3000"
