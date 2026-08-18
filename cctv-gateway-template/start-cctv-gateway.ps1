$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Go2Rtc = Join-Path $Root "go2rtc.exe"
$Config = Join-Path $Root "go2rtc.yaml"

if (-not (Test-Path $Go2Rtc)) {
  Write-Host "Missing go2rtc.exe in $Root" -ForegroundColor Red
  exit 1
}
if (-not (Test-Path $Config)) {
  Write-Host "Missing go2rtc.yaml. Copy go2rtc.yaml.example and fill real device details first." -ForegroundColor Red
  exit 1
}

Write-Host "Starting go2rtc local gateway..." -ForegroundColor Green
Write-Host "Open http://127.0.0.1:1984 in this desktop to test streams." -ForegroundColor Cyan
& $Go2Rtc -config $Config
