# One-click EasyPanel deploy trigger
# Double-click this file or run: powershell -ExecutionPolicy Bypass -File deploy.ps1

$deployUrl = "http://187.124.46.250:3000/api/deploy/2e9f25dc39b576ab8c7aa633ce5018fc53bbe42a2c81fb9d"

Write-Host "Kayn deploy l EasyPanel..." -ForegroundColor Cyan

try {
  $response = Invoke-WebRequest -Uri $deployUrl -Method POST -ContentType "application/json" -Body '{"ref":"refs/heads/main"}' -UseBasicParsing
  Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
  Write-Host $response.Content -ForegroundColor Green
  Write-Host ""
  Write-Host "Deploy bda. Chouf EasyPanel deployments f 1-2 d9ai9." -ForegroundColor Yellow
  Write-Host "http://187.124.46.250:3000/projects/oxiprime/app/frontend/deployments"
} catch {
  Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
