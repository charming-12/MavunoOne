# Seed MavunoOne Production Database via API (PowerShell)
# Usage: .\scripts\seed-api.ps1 -Url "https://mavunoone.com"

param(
    [string]$Url = "https://mavunoone.com"
)

Write-Host "🌱 Seeding MavunoOne Database..." -ForegroundColor Green
Write-Host "Target: $Url/api/seed" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$Url/api/seed" -Method POST -ContentType "application/json" -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json

    if ($content.success) {
        Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Test Credentials:" -ForegroundColor Yellow
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host ""
        Write-Host "👤 Admin:" -ForegroundColor Cyan
        Write-Host "   Email: admin@mavunoone.co.tz" -ForegroundColor White
        Write-Host "   Password: Admin@Mavuno2026!" -ForegroundColor White
        Write-Host ""
        Write-Host "👔 Boss:" -ForegroundColor Cyan
        Write-Host "   Email: boss@mavunoone.co.tz" -ForegroundColor White
        Write-Host "   Password: Boss@Mavuno2026!" -ForegroundColor White
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    } else {
        Write-Host "❌ Seeding failed: $($content.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error connecting to $Url" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:"
    Write-Host "  1. The URL is correct"
    Write-Host "  2. The app is deployed and running"
    Write-Host "  3. DATABASE_URL environment variable is set"
}
