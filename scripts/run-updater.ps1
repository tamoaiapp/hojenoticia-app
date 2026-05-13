# run-updater.ps1
# Wrapper para o Task Scheduler do Windows.
# Executa scripts/daily-update.mjs (orquestrador unificado: loterias + câmbio + horóscopo + feriados)
# e grava log datado em scripts/logs/.
# Faz 1 commit/dia → 1 build/dia no Vercel (economia de minutos de build).

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

# === Setup de paths ===
$ROOT = "C:\Users\Notebook\Workspace\hojenoticia-app"
$LOG_DIR = Join-Path $ROOT "scripts\logs"
if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR | Out-Null }

$today = Get-Date -Format 'yyyy-MM-dd'
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$logFile = Join-Path $LOG_DIR "$today.log"

# === Garantir PATH ===
$env:Path = "$env:LOCALAPPDATA\nodejs;$env:LOCALAPPDATA\PortableGit\bin;$env:LOCALAPPDATA\gh-cli\bin;$env:Path"

# === Header do log ===
"`n==========================================" | Out-File $logFile -Append -Encoding utf8
"  Execução: $timestamp"                       | Out-File $logFile -Append -Encoding utf8
"==========================================`n" | Out-File $logFile -Append -Encoding utf8

# === Internet check (se o PC tiver dormido) ===
$online = Test-NetConnection -ComputerName api.github.com -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $online) {
    "ERRO: sem internet (api.github.com inacessível)" | Out-File $logFile -Append -Encoding utf8
    exit 1
}

# === Rodar daily-update (orquestrador unificado) ===
Set-Location $ROOT
try {
    & node scripts\daily-update.mjs *>&1 | Out-File $logFile -Append -Encoding utf8
    $exitCode = $LASTEXITCODE
    "`nExit code: $exitCode" | Out-File $logFile -Append -Encoding utf8
} catch {
    "ERRO ao rodar node: $($_.Exception.Message)" | Out-File $logFile -Append -Encoding utf8
    exit 1
}

# === Limpar logs antigos (>30 dias) ===
Get-ChildItem $LOG_DIR -Filter "*.log" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force -ErrorAction SilentlyContinue
