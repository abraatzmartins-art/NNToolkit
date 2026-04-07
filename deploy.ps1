# =============================================
# Apify Research Hub - Deploy no Vercel
# =============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Apify Research Hub - Deploy no Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# === 1. Verificar se Vercel CLI esta instalado ===
Write-Host "[1/4] Verificando Vercel CLI..." -ForegroundColor Yellow
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "       Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    $vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercelCmd) {
        Write-Host "       ERRO: Nao foi possivel instalar o Vercel CLI" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}
Write-Host "       Vercel CLI encontrado!" -ForegroundColor Green

# === 2. Verificar Node.js ===
Write-Host "[2/4] Verificando Node.js..." -ForegroundColor Yellow
$nodeVer = & node --version
Write-Host "       Node.js: $nodeVer" -ForegroundColor Green

# === 3. Instalar dependencias ===
Write-Host "[3/4] Instalando dependencias..." -ForegroundColor Yellow
& npm install
Write-Host "       Dependencias instaladas!" -ForegroundColor Green

# === 4. Fazer deploy ===
Write-Host "[4/4] Fazendo deploy no Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  IMPORTANTE: Siga as instrucoes na tela:" -ForegroundColor White
Write-Host "  - Se perguntar 'Set up and deploy?', responda Y" -ForegroundColor White
Write-Host "  - Escolha as opcoes padrao (pressione Enter)" -ForegroundColor White
Write-Host "  - Faca login com GitHub, GitLab ou email" -ForegroundColor White
Write-Host ""
Write-Host "  Apos o deploy, voce recebera uma URL como:" -ForegroundColor Cyan
Write-Host "  https://apify-research-hub-xxx.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Depois, va em:" -ForegroundColor White
Write-Host "  https://vercel.com/seu-usuario/apify-research-hub/settings/environment-variables" -ForegroundColor Gray
Write-Host "  E adicione:" -ForegroundColor Gray
Write-Host "  APIFY_API_KEY = apify_api_sua_chave_aqui" -ForegroundColor Yellow
Write-Host ""

& vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deploy concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor White
Write-Host "  1. Acesse o painel do Vercel: vercel.com/dashboard" -ForegroundColor Gray
Write-Host "  2. Vá em Settings > Environment Variables" -ForegroundColor Gray
Write-Host "  3. Adicione: APIFY_API_KEY = sua_chave" -ForegroundColor Yellow
Write-Host "  4. Re-deploy: vercel --prod" -ForegroundColor Gray
Write-Host ""
