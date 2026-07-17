# Deploy frontend: wait is not needed if GitHub Action deploys after image push.
# Use this to manually re-trigger EasyPanel after CI finishes.

$deployUrl = "http://187.124.46.250:3000/api/deploy/2c96c24d31693f02a63dac28e2b47ef00631a8115cfe9758"

Write-Host "Trigger EasyPanel deploy (use AFTER GitHub Action build succeeds)..." -ForegroundColor Cyan
Write-Host "Actions: https://github.com/khadriouiabdoerrak-max/frontend/actions" -ForegroundColor Yellow

try {
  $response = Invoke-WebRequest -Uri $deployUrl -Method POST -ContentType "application/json" -Body '{"ref":"refs/heads/main"}' -UseBasicParsing
  Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
  Write-Host $response.Content -ForegroundColor Green
  Write-Host ""
  Write-Host "Check deployments:" -ForegroundColor Yellow
  Write-Host "http://187.124.46.250:3000/projects/oxiprime/app/frontend/deployments"
  Write-Host ""
  Write-Host "If site stays old: open EasyPanel -> frontend -> Deployments -> Force Rebuild" -ForegroundColor Yellow
} catch {
  Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
