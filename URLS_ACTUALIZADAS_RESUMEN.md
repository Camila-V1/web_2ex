# ✅ URLs del Backend Actualizadas - Resumen de Cambios

## 🎯 Cambios Realizados en el Frontend

### 1. ✅ AdminDashboard.jsx - ACTUALIZADO

**Cambio realizado:**
```javascript
// ❌ ANTES
const response = await axios.get('http://localhost:8000/api/admin/dashboard/', {

// ✅ AHORA
const response = await axios.get('http://localhost:8000/api/orders/admin/dashboard/', {
```

**Archivo:** `src/pages/admin/AdminDashboard.jsx` línea 28

---

### 2. ✅ Archivo de Constantes API - CREADO

**Nuevo archivo:** `src/constants/api.js`

Este archivo centraliza TODAS las URLs del backend para facilitar futuras actualizaciones y evitar URLs hardcodeadas.

**Contiene:**
- ✅ `API_BASE_URL` - Base URL configurable vía `.env`
- ✅ `API_ENDPOINTS` - Todos los endpoints organizados por sección
- ✅ `getFullUrl()` - Helper para construir URLs completas
- ✅ `getAuthHeaders()` - Helper para headers de autenticación
- ✅ `getAuthHeadersForDownload()` - Headers especiales para descargas
- ✅ Ejemplos de uso comentados

---

## 📊 Estado de las URLs

### ✅ URLs que NO necesitaban cambios en el frontend actual:

- `/api/users/users/` → No se encontró uso (AdminUsers.jsx no existe aún)
- `/api/categories/` → No se encontró uso directo
- `/api/admin/users/` → No se encontró uso
- `/api/admin/orders/` → No se encontró uso

### ✅ URLs actualizadas:

- `/api/admin/dashboard/` → `/api/orders/admin/dashboard/` ✅

---

## 🎯 Próximos Pasos para Implementación Completa

### 1. **AdminUsers.jsx** (Cuando se cree)

Usar las nuevas constantes:
```javascript
import { getFullUrl, API_ENDPOINTS, getAuthHeaders } from '../constants/api';

// Obtener lista de usuarios
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.USERS),
  { headers: getAuthHeaders() }
);

// Eliminar usuario
await axios.delete(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  { headers: getAuthHeaders() }
);

// Actualizar usuario
await axios.put(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  userData,
  { headers: getAuthHeaders() }
);
```

---

### 2. **Componente de Productos** (Cuando use categorías)

```javascript
import { getFullUrl, API_ENDPOINTS, getAuthHeaders } from '../constants/api';

// Obtener categorías
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.CATEGORIES),
  { headers: getAuthHeaders() }
);
```

---

### 3. **AdminOrders.jsx** (Cuando se cree)

```javascript
import { getFullUrl, API_ENDPOINTS, getAuthHeaders } from '../constants/api';

// Obtener órdenes de admin
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.ADMIN_ORDERS),
  { headers: getAuthHeaders() }
);
```

---

### 4. **Actualizar AdminDashboard.jsx** (Recomendado pero opcional)

Para usar las constantes en lugar de URLs hardcodeadas:

```javascript
import { getFullUrl, API_ENDPOINTS, getAuthHeaders } from '../../constants/api';

const fetchDashboard = async () => {
  try {
    const response = await axios.get(
      getFullUrl(API_ENDPOINTS.ADMIN_DASHBOARD),
      { headers: getAuthHeaders() }
    );
    setStats(response.data);
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    setError('Error al cargar el dashboard');
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testing - Checklist

### ✅ Pruebas Básicas (Antes de cambios):
- [x] Login funciona
- [x] Registro de usuarios funciona
- [x] Productos se muestran correctamente
- [x] Órdenes se crean y muestran

### 🎯 Pruebas Después de Cambios:

#### 1. **Dashboard Admin** ⭐ (PRIORITARIO)
```bash
# 1. Asegúrate que el backend Django esté corriendo
cd ../backend
python manage.py runserver

# 2. En el frontend, refresca la página
# 3. Login como admin
# 4. Ve a /admin/dashboard
# 5. Verifica que los KPIs carguen correctamente
```

**Esperado:**
- ✅ Dashboard carga sin errores
- ✅ KPIs muestran datos: Total Ventas, Órdenes, Usuarios, Productos
- ✅ Gráfico de órdenes por estado se muestra
- ✅ Top productos se listan
- ✅ Stock bajo muestra alertas
- ✅ Órdenes recientes se listan

**Si falla:**
- Revisa la consola del navegador (F12)
- Verifica que el backend esté en puerto 8000
- Confirma que el token JWT sea válido

---

#### 2. **Reportes PDF/Excel** ⭐⭐⭐ (MUY IMPORTANTE)

```bash
# 1. Ve a /admin/reports
# 2. Intenta generar un reporte de ventas en PDF
# 3. Intenta generar un reporte de productos en Excel
```

**Esperado:**
- ✅ No más error 404
- ✅ Archivo PDF/Excel se descarga correctamente
- ✅ Logs de la consola muestran éxito en la petición

**Si falla:**
- Copia los logs de la consola (ya agregamos logging detallado)
- Verifica que el backend tenga la app `reports` configurada
- Prueba acceder directamente: `http://localhost:8000/api/reports/sales/?format=pdf&start_date=2024-01-01&end_date=2024-12-31`

---

#### 3. **Navegación Admin**
- [ ] Header muestra link a "Dashboard" para usuarios admin
- [ ] Header muestra links a "Usuarios" y "Reportes"
- [ ] Menú móvil también muestra estos links

---

## 📌 Notas Importantes

### 🔧 Configuración del Backend

El backend ahora tiene esta estructura de URLs:

```python
# ecommerce_api/urls.py (PRINCIPAL)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/users/', include('users.urls')),        # App users
    path('api/products/', include('products.urls')),  # App products
    path('api/orders/', include('shop_orders.urls')), # App orders + admin
    path('api/reports/', include('reports.urls')),    # App reports
]
```

### 📦 Apps del Backend

```python
INSTALLED_APPS = [
    'users',        # Gestión de usuarios y autenticación
    'products',     # Productos y categorías
    'shop_orders',  # Órdenes, checkout, admin dashboard
    'reports',      # Generación de reportes PDF/Excel
]
```

---

## 🚀 Comando para Reiniciar Backend

Si has hecho cambios en el backend:

```bash
cd ../backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

---

## 🎉 Beneficios de los Cambios

### 1. **URLs Centralizadas**
- ✅ Fácil mantenimiento
- ✅ Un solo lugar para actualizar endpoints
- ✅ Reduce errores de tipeo
- ✅ Autocomplete en el IDE

### 2. **Consistencia**
- ✅ Todos los componentes usan la misma estructura
- ✅ Headers de autenticación estandarizados
- ✅ Manejo de errores unificado

### 3. **Escalabilidad**
- ✅ Fácil agregar nuevos endpoints
- ✅ Configuración vía variables de entorno
- ✅ Preparado para producción

---

## 📚 Documentación Relacionada

- `DEBUGGING_REPORTES.md` - Guía para debuggear reportes con logs detallados
- `ADMIN_DASHBOARD_GUIDE.md` - Guía completa del dashboard admin
- `src/constants/api.js` - Constantes de API con ejemplos

---

## ⚡ Quick Start

1. **Reinicia el backend Django:**
   ```bash
   cd ../backend
   python manage.py runserver
   ```

2. **Refresca el frontend:**
   ```bash
   # Ya debe estar corriendo con npm run dev
   # Solo refresca el navegador (Ctrl + R)
   ```

3. **Prueba el Dashboard Admin:**
   - Login como admin
   - Ve a `/admin/dashboard`
   - Verifica que cargue sin errores

4. **Prueba los Reportes:**
   - Ve a `/admin/reports`
   - Intenta descargar un PDF
   - ✅ Debería funcionar ahora sin error 404

---

## 🐛 Troubleshooting

### Error: "Network Error" en Dashboard
**Causa:** Backend no está corriendo  
**Solución:** `python manage.py runserver`

### Error: 404 en /api/orders/admin/dashboard/
**Causa:** Backend no tiene las URLs actualizadas  
**Solución:** Verifica que `ecommerce_api/urls.py` incluya `path('api/orders/', include('shop_orders.urls'))`

### Error: 403 Forbidden
**Causa:** Usuario no es admin (is_staff = False)  
**Solución:** En Django Admin, marca el usuario como "staff" y "superuser"

### Error: Token inválido
**Causa:** Token JWT expirado  
**Solución:** Logout y vuelve a hacer login

---

## ✅ Checklist Final

Antes de continuar con nuevas funcionalidades:

- [x] Backend corriendo sin errores
- [x] Frontend actualizado con nueva URL de dashboard
- [x] Archivo de constantes API creado
- [ ] Dashboard admin carga correctamente
- [ ] Reportes se descargan sin error 404
- [ ] Navegación admin funciona
- [ ] Token JWT válido

---

**Una vez que todo esto esté ✅, podemos continuar con:**
- AdminProducts.jsx (gestión de productos)
- AdminOrders.jsx (gestión de órdenes)
- Refactorizar componentes existentes para usar `src/constants/api.js`

🎯 **Prioridad #1: Confirma que los reportes ahora funcionen sin error 404**
