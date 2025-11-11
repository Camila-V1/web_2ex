# ============================================================================
# Script PowerShell: Actualizar CORS del Backend para Vercel
# ============================================================================
# Uso: .\update_cors_for_vercel.ps1 -VercelDomain "tu-app.vercel.app"
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelDomain,
    
    [string]$BackendIP = "98.92.49.243",
    [string]$KeyFile = "django-backend-key.pem",
    [string]$BackendPath = "/var/www/django-backend"
)

Write-Host "🚀 Actualizando CORS del backend para Vercel..." -ForegroundColor Cyan
Write-Host ""

# Validar formato del dominio
if ($VercelDomain -notmatch "\.vercel\.app$") {
    Write-Host "⚠️  ADVERTENCIA: El dominio no parece ser de Vercel (.vercel.app)" -ForegroundColor Yellow
    $continue = Read-Host "¿Continuar de todas formas? (s/n)"
    if ($continue -ne "s") {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit 1
    }
}

# Verificar que existe el archivo de clave
if (-not (Test-Path $KeyFile)) {
    Write-Host "❌ ERROR: No se encuentra el archivo de clave SSH: $KeyFile" -ForegroundColor Red
    Write-Host "   Asegúrate de tener el archivo en el directorio actual" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Configuración:" -ForegroundColor Green
Write-Host "   • Dominio Vercel: https://$VercelDomain" -ForegroundColor White
Write-Host "   • Backend IP: $BackendIP" -ForegroundColor White
Write-Host "   • Key File: $KeyFile" -ForegroundColor White
Write-Host ""

# Construir los valores para CORS
$allowedHosts = "$BackendIP,localhost,127.0.0.1,$VercelDomain"
$corsOrigins = "https://$VercelDomain,http://localhost:3000,http://localhost:5173"

Write-Host "📝 Valores a configurar:" -ForegroundColor Green
Write-Host "   ALLOWED_HOSTS=$allowedHosts" -ForegroundColor White
Write-Host "   CORS_ALLOWED_ORIGINS=$corsOrigins" -ForegroundColor White
Write-Host ""

# Confirmar antes de continuar
$confirm = Read-Host "¿Continuar con la configuración? (s/n)"
if ($confirm -ne "s") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔌 Conectando al servidor..." -ForegroundColor Cyan

# Crear script temporal para ejecutar en el servidor
$remoteScript = @"
#!/bin/bash
cd $BackendPath

# Backup del archivo .env actual
echo "📦 Creando backup de .env..."
sudo cp .env .env.backup_\$(date +%Y%m%d_%H%M%S)

# Actualizar ALLOWED_HOSTS
echo "🔧 Actualizando ALLOWED_HOSTS..."
sudo sed -i 's/^ALLOWED_HOSTS=.*/ALLOWED_HOSTS=$allowedHosts/' .env

# Actualizar CORS_ALLOWED_ORIGINS
echo "🔧 Actualizando CORS_ALLOWED_ORIGINS..."
sudo sed -i 's|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=$corsOrigins|' .env

# Verificar cambios
echo ""
echo "✅ Cambios aplicados:"
grep "ALLOWED_HOSTS=" .env
grep "CORS_ALLOWED_ORIGINS=" .env

# Reiniciar servicios
echo ""
echo "🔄 Reiniciando servicios..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# Verificar estado
echo ""
echo "📊 Estado de servicios:"
sudo systemctl is-active gunicorn
sudo systemctl is-active nginx

echo ""
echo "✅ Configuración completada!"
"@

# Guardar script temporal
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$remoteScript | Out-File -FilePath $tempScript -Encoding ASCII

try {
    # Ejecutar comandos en el servidor
    Write-Host "📤 Subiendo y ejecutando script en el servidor..." -ForegroundColor Cyan
    Write-Host ""
    
    # Usar SSH para ejecutar comandos
    $sshCommand = "ssh -i `"$KeyFile`" ubuntu@$BackendIP 'bash -s' < `"$tempScript`""
    Invoke-Expression $sshCommand
    
    Write-Host ""
    Write-Host "✅ ¡Configuración completada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Prueba la conexión desde:" -ForegroundColor Cyan
    Write-Host "   https://$VercelDomain" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Abre tu frontend en Vercel" -ForegroundColor White
    Write-Host "   2. Intenta hacer login" -ForegroundColor White
    Write-Host "   3. Verifica que no hay errores de CORS en la consola" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR al ejecutar el script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Intenta manualmente:" -ForegroundColor Cyan
    Write-Host "   1. Conecta por SSH: ssh -i $KeyFile ubuntu@$BackendIP" -ForegroundColor White
    Write-Host "   2. Edita .env: sudo nano $BackendPath/.env" -ForegroundColor White
    Write-Host "   3. Actualiza ALLOWED_HOSTS=$allowedHosts" -ForegroundColor White
    Write-Host "   4. Actualiza CORS_ALLOWED_ORIGINS=$corsOrigins" -ForegroundColor White
    Write-Host "   5. Reinicia: sudo systemctl restart gunicorn && sudo systemctl restart nginx" -ForegroundColor White
    Write-Host ""
    exit 1
} finally {
    # Limpiar archivo temporal
    if (Test-Path $tempScript) {
        Remove-Item $tempScript -Force
    }
}

Write-Host "🎉 Script finalizado" -ForegroundColor Green
