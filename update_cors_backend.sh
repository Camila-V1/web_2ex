#!/bin/bash
# Script para actualizar CORS en el backend
# Ejecutar en el servidor AWS

echo "🔧 Actualizando CORS para permitir Vercel..."

cd /var/www/django-backend

# Backup del archivo .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Actualizar ALLOWED_HOSTS
echo "📝 Actualizando ALLOWED_HOSTS..."
sed -i 's/^ALLOWED_HOSTS=.*/ALLOWED_HOSTS=98.92.49.243,localhost,127.0.0.1,web-2ex-qo3ksddz3-vazquescamila121-7209s-projects.vercel.app/' .env

# Actualizar CORS_ALLOWED_ORIGINS
echo "📝 Actualizando CORS_ALLOWED_ORIGINS..."
sed -i 's|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://web-2ex-qo3ksddz3-vazquescamila121-7209s-projects.vercel.app,http://localhost:5173,http://localhost:3000|' .env

echo "✅ Configuración actualizada"
echo ""
echo "📋 Configuración actual:"
grep -E '^(ALLOWED_HOSTS|CORS_ALLOWED_ORIGINS)' .env

echo ""
echo "🔄 Reiniciando servicios..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Servicios reiniciados"
echo ""
echo "🎉 CORS configurado correctamente para Vercel"
