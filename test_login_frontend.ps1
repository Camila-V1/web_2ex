# Script de Prueba de Login - Frontend con PowerShell
# Simula exactamente lo que hace el frontend

Write-Host "🔍 PRUEBA DE LOGIN - SIMULACIÓN FRONTEND" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Configuración
$BACKEND_URL = "http://98.92.49.243/api"
$USERNAME = "admin"
$PASSWORD = "admin123"

Write-Host "[1] Configuración:" -ForegroundColor Yellow
Write-Host "  Backend URL: $BACKEND_URL"
Write-Host "  Username: $USERNAME"
Write-Host "  Password: $PASSWORD`n"

# Preparar credenciales (simula lo que hace el frontend)
$credentials = @{
    username = $USERNAME
    password = $PASSWORD
} | ConvertTo-Json

Write-Host "[2] Body JSON que se enviará:" -ForegroundColor Yellow
Write-Host $credentials -ForegroundColor Gray
Write-Host ""

# Hacer la petición POST a /token/
Write-Host "[3] Enviando POST a ${BACKEND_URL}/token/" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod `
        -Uri "${BACKEND_URL}/token/" `
        -Method POST `
        -Body $credentials `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "✅ LOGIN EXITOSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[4] Respuesta del servidor:" -ForegroundColor Yellow
    Write-Host "  Access Token Length: $($response.access.Length) caracteres"
    Write-Host "  Refresh Token Length: $($response.refresh.Length) caracteres"
    Write-Host "  Access Token (primeros 50): $($response.access.Substring(0, 50))..."
    Write-Host ""

    # Ahora obtener información del usuario con el token
    Write-Host "[5] Obteniendo información del usuario..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $($response.access)"
    }

    $userInfo = Invoke-RestMethod `
        -Uri "${BACKEND_URL}/users/profile/" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "✅ INFORMACIÓN DEL USUARIO OBTENIDA!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[6] Datos del usuario:" -ForegroundColor Yellow
    Write-Host "  ID: $($userInfo.id)"
    Write-Host "  Username: $($userInfo.username)"
    Write-Host "  Email: $($userInfo.email)"
    Write-Host "  First Name: $($userInfo.first_name)"
    Write-Host "  Last Name: $($userInfo.last_name)"
    Write-Host "  Is Staff: $($userInfo.is_staff)"
    Write-Host "  Is Superuser: $($userInfo.is_superuser)"
    Write-Host "  Is Active: $($userInfo.is_active)"
    Write-Host "  Role: $($userInfo.role)"
    Write-Host ""

    if ($userInfo.is_staff -eq $true) {
        Write-Host "👑 Este usuario es ADMINISTRADOR" -ForegroundColor Magenta
        Write-Host "   Debe redirigir a: /admin/dashboard" -ForegroundColor Magenta
    } else {
        Write-Host "👤 Este usuario es CLIENTE" -ForegroundColor Blue
        Write-Host "   Debe redirigir a: /products" -ForegroundColor Blue
    }
    Write-Host ""
    Write-Host "✅ PRUEBA COMPLETA - TODO FUNCIONA CORRECTAMENTE" -ForegroundColor Green

} catch {
    Write-Host "❌ ERROR EN LA PETICIÓN" -ForegroundColor Red
    Write-Host ""
    Write-Host "[ERROR] Detalles:" -ForegroundColor Red
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDescription = $_.Exception.Response.StatusDescription
    
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    Write-Host "  Status Description: $statusDescription" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error Detail: $($errorJson.detail)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "⚠️ POSIBLES CAUSAS:" -ForegroundColor Yellow
    
    if ($statusCode -eq 401) {
        Write-Host "  - Username o password incorrectos" -ForegroundColor Yellow
        Write-Host "  - Usuario desactivado en el backend" -ForegroundColor Yellow
        Write-Host "  - Verificar CREDENCIALES_ACCESO.txt en el backend" -ForegroundColor Yellow
    } elseif ($statusCode -eq 0 -or $_.Exception.Message -like "*No se puede establecer una conexión*") {
        Write-Host "  - Backend no está corriendo" -ForegroundColor Yellow
        Write-Host "  - URL incorrecta: $BACKEND_URL" -ForegroundColor Yellow
        Write-Host "  - Firewall bloqueando la conexión" -ForegroundColor Yellow
    } else {
        Write-Host "  - Error desconocido: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================`n" -ForegroundColor Cyan
Write-Host "💡 Prueba con otras credenciales:" -ForegroundColor Cyan
Write-Host "   - admin / admin123 (Admin)" -ForegroundColor Cyan
Write-Host "   - juan_cliente / juan123 (Cliente)" -ForegroundColor Cyan
Write-Host "   - carlos_manager / carlos123 (Manager)" -ForegroundColor Cyan
Write-Host "   - luis_cajero / luis123 (Cajero)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Para cambiar credenciales, edita las variables al inicio del script" -ForegroundColor Cyan
