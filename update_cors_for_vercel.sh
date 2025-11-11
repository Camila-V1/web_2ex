#!/bin/bash

# ============================================================================
# Script Bash: Actualizar CORS del Backend para Vercel
# ============================================================================
# Uso: ./update_cors_for_vercel.sh tu-app.vercel.app
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
VERCEL_DOMAIN=$1
BACKEND_IP="98.92.49.243"
KEY_FILE="django-backend-key.pem"
BACKEND_PATH="/var/www/django-backend"

# Función para imprimir mensajes
print_header() {
    echo -e "${CYAN}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "   $1"
}

# Validar argumentos
if [ -z "$VERCEL_DOMAIN" ]; then
    print_error "ERROR: Debes proporcionar el dominio de Vercel"
    echo ""
    echo "Uso: ./update_cors_for_vercel.sh tu-app.vercel.app"
    echo ""
    exit 1
fi

# Validar formato del dominio
if [[ ! "$VERCEL_DOMAIN" =~ \.vercel\.app$ ]]; then
    print_warning "El dominio no parece ser de Vercel (.vercel.app)"
    read -p "¿Continuar de todas formas? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_error "Operación cancelada"
        exit 1
    fi
fi

# Verificar archivo de clave
if [ ! -f "$KEY_FILE" ]; then
    print_error "No se encuentra el archivo de clave SSH: $KEY_FILE"
    print_info "Asegúrate de tener el archivo en el directorio actual"
    exit 1
fi

echo ""
print_header "Actualizando CORS del backend para Vercel..."
echo ""

print_success "Configuración:"
print_info "• Dominio Vercel: https://$VERCEL_DOMAIN"
print_info "• Backend IP: $BACKEND_IP"
print_info "• Key File: $KEY_FILE"
echo ""

# Construir valores para CORS
ALLOWED_HOSTS="$BACKEND_IP,localhost,127.0.0.1,$VERCEL_DOMAIN"
CORS_ORIGINS="https://$VERCEL_DOMAIN,http://localhost:3000,http://localhost:5173"

print_success "Valores a configurar:"
print_info "ALLOWED_HOSTS=$ALLOWED_HOSTS"
print_info "CORS_ALLOWED_ORIGINS=$CORS_ORIGINS"
echo ""

# Confirmar
read -p "¿Continuar con la configuración? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_error "Operación cancelada"
    exit 0
fi

echo ""
print_header "Conectando al servidor..."
echo ""

# Crear script para ejecutar en el servidor
REMOTE_SCRIPT=$(cat <<EOF
#!/bin/bash
cd $BACKEND_PATH

# Backup del archivo .env actual
echo "📦 Creando backup de .env..."
sudo cp .env .env.backup_\$(date +%Y%m%d_%H%M%S)

# Actualizar ALLOWED_HOSTS
echo "🔧 Actualizando ALLOWED_HOSTS..."
sudo sed -i "s/^ALLOWED_HOSTS=.*/ALLOWED_HOSTS=$ALLOWED_HOSTS/" .env

# Actualizar CORS_ALLOWED_ORIGINS
echo "🔧 Actualizando CORS_ALLOWED_ORIGINS..."
sudo sed -i "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=$CORS_ORIGINS|" .env

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
echo -n "Gunicorn: "
sudo systemctl is-active gunicorn
echo -n "Nginx: "
sudo systemctl is-active nginx

echo ""
echo "✅ Configuración completada!"
EOF
)

# Ejecutar comandos en el servidor
print_info "Ejecutando comandos en el servidor..."
echo ""

if ssh -i "$KEY_FILE" ubuntu@$BACKEND_IP "$REMOTE_SCRIPT"; then
    echo ""
    print_success "¡Configuración completada exitosamente!"
    echo ""
    print_header "Prueba la conexión desde:"
    print_info "https://$VERCEL_DOMAIN"
    echo ""
    print_warning "Próximos pasos:"
    print_info "1. Abre tu frontend en Vercel"
    print_info "2. Intenta hacer login"
    print_info "3. Verifica que no hay errores de CORS en la consola"
    echo ""
else
    echo ""
    print_error "ERROR al ejecutar el script en el servidor"
    echo ""
    print_header "Intenta manualmente:"
    print_info "1. Conecta por SSH: ssh -i $KEY_FILE ubuntu@$BACKEND_IP"
    print_info "2. Edita .env: sudo nano $BACKEND_PATH/.env"
    print_info "3. Actualiza ALLOWED_HOSTS=$ALLOWED_HOSTS"
    print_info "4. Actualiza CORS_ALLOWED_ORIGINS=$CORS_ORIGINS"
    print_info "5. Reinicia: sudo systemctl restart gunicorn && sudo systemctl restart nginx"
    echo ""
    exit 1
fi

print_success "Script finalizado"
echo ""
