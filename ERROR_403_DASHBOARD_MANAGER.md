# 🔴 ERROR 403 - Dashboard MANAGER

## Problema Detectado

Al ingresar como usuario MANAGER, el dashboard muestra error 403 Forbidden al intentar acceder al endpoint `/api/orders/admin/dashboard/`.

## Log del Error

```
backend-2ex-ecommerce.onrender.com/api/orders/admin/dashboard/:1 
Failed to load resource: the server responded with a status of 403 ()
```

## Contexto

- **Usuario**: `role: MANAGER`, `is_staff: true`, `is_superuser: false`
- **Endpoint**: `GET /api/orders/admin/dashboard/`
- **Status**: 403 Forbidden
- **Fecha**: 2025-11-12

## Causa Raíz

El backend Django está rechazando el acceso al endpoint porque los permisos están configurados solo para usuarios ADMIN, excluyendo a MANAGER.

Según la documentación del proyecto (`.github/copilot-instructions.md`):

```markdown
### 📊 MANAGER (Rol `MANAGER`)
Hereda todo de CAJERO +
- ✅ **Dashboard administrativo** con métricas y gráficos
- ✅ **Predicciones de ventas** con Machine Learning (30 días)
```

**MANAGER debería tener acceso al dashboard**, pero el backend no está respetando esta regla.

## Solución Requerida (BACKEND)

### Ubicación del Código Backend

Repo: `https://github.com/Camila-V1/backend_2ex`

### Archivo a Modificar

`apps/orders/views.py` o similar (donde esté definida la vista `AdminDashboardView`)

### Cambio Necesario

Modificar los permisos de la vista para permitir acceso a usuarios con `role='MANAGER'`:

```python
# ANTES (solo ADMIN):
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]  # ❌ Solo ADMIN
    
    def get(self, request):
        # ...

# DESPUÉS (ADMIN y MANAGER):
from rest_framework.permissions import BasePermission

class IsAdminOrManager(BasePermission):
    """
    Permite acceso a usuarios ADMIN o MANAGER
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['ADMIN', 'MANAGER'] or 
            request.user.is_superuser
        )

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManager]  # ✅ ADMIN y MANAGER
    
    def get(self, request):
        # ...
```

### Alternativa con Decoradores

Si usas `@api_view`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

def is_admin_or_manager(user):
    return user.is_authenticated and (
        user.role in ['ADMIN', 'MANAGER'] or user.is_superuser
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not is_admin_or_manager(request.user):
        return Response(
            {'detail': 'No tienes permisos para acceder a este recurso'}, 
            status=403
        )
    
    # ... resto del código
```

## Cambios Aplicados en Frontend

### AdminDashboard.jsx

Se actualizó la URL del endpoint y se mejoró el manejo de errores:

```javascript
// Línea 33: URL actualizada
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-2ex-ecommerce.onrender.com/api';

// Líneas 35-45: Logs detallados para debugging
console.log('🔷 [DASHBOARD] Fetching dashboard data...');
console.log('🔷 [DASHBOARD] API_URL:', API_URL);
console.log('🔷 [DASHBOARD] Token:', token ? 'present' : 'missing');

// Líneas 51-58: Mensaje específico para error 403
if (err.response?.status === 403) {
  setError('No tienes permisos para acceder al dashboard. Contacta al administrador.');
} else {
  setError('Error al cargar el dashboard');
}
```

## Verificación de Permisos

### Usuarios Afectados

- ✅ **ADMIN**: Acceso correcto
- ❌ **MANAGER**: Error 403 (debería tener acceso)
- ❌ **CAJERO**: Sin acceso (correcto según diseño)
- ❌ **Cliente**: Sin acceso (correcto según diseño)

### Endpoints Relacionados

Verificar que estos endpoints también permitan acceso a MANAGER:

- `GET /api/orders/admin/dashboard/` ← **Principal (este genera el error)**
- `GET /api/orders/admin/analytics/sales/`
- `GET /api/orders/admin/users/`
- `GET /api/predictions/sales/` ← Este SÍ funciona para MANAGER
- `GET /api/reports/*` ← Verificar si funcionan

## Testing

### Pasos para Probar el Fix

1. Aplicar cambios en el backend
2. Deploy o restart del servidor Django
3. Login como MANAGER en frontend
4. Navegar a `/admin/dashboard`
5. Verificar que el dashboard carga sin errores 403

### Usuario de Prueba

Según los logs, el usuario MANAGER actual:
- `is_staff: true`
- `is_superuser: false`
- `role: MANAGER`

## Estado Actual

- ✅ Frontend actualizado con mejor manejo de errores
- ✅ Logs detallados para debugging
- ✅ Mensaje claro para usuarios sin permisos
- ❌ **Backend necesita modificación de permisos** ← ACCIÓN REQUERIDA

## Referencias

- Documentación proyecto: `.github/copilot-instructions.md`
- Commit relacionado: `ce05fde` (carousel de recomendaciones)
- Issue relacionado: Error 403 en AdminOrders (resuelto anteriormente)

---

**IMPORTANTE**: Este es un problema de BACKEND que requiere modificación en el repositorio `backend_2ex`. El frontend ya está preparado para manejar el error correctamente.
