# Test Login - Verificar Backend
# Ejecutar: .\test_login_simple.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST DE LOGIN - BACKEND AWS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BACKEND_URL = "http://98.92.49.243/api"
$USERNAME = "admin"
$PASSWORD = "admin123"

Write-Host "[1] Configuracion:" -ForegroundColor Yellow
Write-Host "    Backend: $BACKEND_URL" -ForegroundColor Gray
Write-Host "    Username: $USERNAME" -ForegroundColor Gray
Write-Host "    Password: $PASSWORD`n" -ForegroundColor Gray

$body = @{
    username = $USERNAME
    password = $PASSWORD
} | ConvertTo-Json

Write-Host "[2] Enviando POST a ${BACKEND_URL}/token/`n" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod `
        -Uri "${BACKEND_URL}/token/" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "SUCCESS! Login exitoso" -ForegroundColor Green
    Write-Host "`n[3] Tokens recibidos:" -ForegroundColor Yellow
    Write-Host "    Access Token: $($response.access.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "    Refresh Token: $($response.refresh.Substring(0, 50))...`n" -ForegroundColor Gray

    # Obtener info del usuario
    Write-Host "[4] Obteniendo informacion del usuario...`n" -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $($response.access)"
    }

    $userInfo = Invoke-RestMethod `
        -Uri "${BACKEND_URL}/users/profile/" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "SUCCESS! Usuario obtenido" -ForegroundColor Green
    Write-Host "`n[5] Datos del usuario:" -ForegroundColor Yellow
    Write-Host "    ID: $($userInfo.id)" -ForegroundColor Gray
    Write-Host "    Username: $($userInfo.username)" -ForegroundColor Gray
    Write-Host "    Email: $($userInfo.email)" -ForegroundColor Gray
    Write-Host "    Is Staff: $($userInfo.is_staff)" -ForegroundColor Gray
    Write-Host "    Role: $($userInfo.role)`n" -ForegroundColor Gray

    if ($userInfo.is_staff -eq $true) {
        Write-Host "ADMIN DETECTADO - Redirigir a /admin/dashboard" -ForegroundColor Magenta
    } else {
        Write-Host "CLIENTE DETECTADO - Redirigir a /products" -ForegroundColor Blue
    }
    
    Write-Host "`nTODO FUNCIONA CORRECTAMENTE!`n" -ForegroundColor Green

} catch {
    Write-Host "ERROR en la peticion" -ForegroundColor Red
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDescription = $_.Exception.Response.StatusDescription
    
    Write-Host "`n[ERROR] Detalles:" -ForegroundColor Red
    Write-Host "    Status Code: $statusCode" -ForegroundColor Gray
    Write-Host "    Status: $statusDescription`n" -ForegroundColor Gray
    
    if ($_.ErrorDetails.Message) {
        $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "    Detail: $($errorJson.detail)`n" -ForegroundColor Gray
    }
    
    Write-Host "POSIBLES CAUSAS:" -ForegroundColor Yellow
    if ($statusCode -eq 401) {
        Write-Host "  - Username o password incorrectos" -ForegroundColor Gray
        Write-Host "  - Usuario desactivado" -ForegroundColor Gray
    } else {
        Write-Host "  - Backend no esta corriendo" -ForegroundColor Gray
        Write-Host "  - URL incorrecta" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "OTRAS CREDENCIALES PARA PROBAR:" -ForegroundColor Cyan
Write-Host "  admin / admin123 (Admin)" -ForegroundColor Gray
Write-Host "  juan_cliente / juan123 (Cliente)" -ForegroundColor Gray
Write-Host "  carlos_manager / carlos123 (Manager)" -ForegroundColor Gray
Write-Host "  luis_cajero / luis123 (Cajero)" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
