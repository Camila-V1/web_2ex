# Instrucciones para Agentes de IA - SmartSales365

## Arquitectura General

Este es un e-commerce **React + Vite** con backend Django REST Framework (no incluido en este repo). Stack: React 19, React Router v7, Axios, Tailwind CSS, Lucide Icons.

### Flujo de Datos Principal

```
AuthContext (localStorage tokens) → api.js (axios interceptors) → Django API (http://localhost:8000/api/)
  ↓
CartContext (localStorage cart) → Checkout → Stripe → PaymentSuccess/Cancelled
```

## Convenciones Clave del Proyecto

### 1. **Autenticación con JWT**
- Los tokens se guardan en `localStorage`: `access_token`, `refresh_token`, `user`
- **CRÍTICO**: `user.is_staff` determina acceso admin (ver `AuthContext.jsx` línea 150+)
- `api.js` tiene interceptor automático que refresca tokens en 401
- Siempre verifica `isAdmin()` antes de mostrar rutas `/admin/*`

Ejemplo real del código:
```javascript
// AuthContext.jsx - Función isAdmin
const isAdmin = () => {
  return state.user?.is_staff === true;
};
```

### 2. **Variables de Entorno**
- `VITE_API_URL` define la URL base del backend (default: `http://localhost:8000/api`)
- Siempre usa: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'`
- Ver ejemplos en `AdminReports.jsx` línea 19, `AdminUsers.jsx` línea 22

### 3. **Servicios API Centralizados**
- **NO** hagas llamadas `axios` directas en componentes
- Usa `services/api.js` que exporta: `authService`, `productService`, `categoryService`, `orderService`, `reportService`
- `config/api.js` configura axios base con interceptores automáticos

Ejemplo correcto:
```javascript
import { productService } from '../../services/api';
const products = await productService.getProducts();
```

### 4. **Rutas Protegidas**
- Usuarios autenticados: `<ProtectedRoute>` (ver `App.jsx` línea 51)
- Solo admins: `<ProtectedAdminRoute>` (ver `App.jsx` línea 75)
- Las rutas de pago (`/payment-success`, `/payment-cancelled`) son **públicas** para Stripe redirects

### 5. **Reportes con Descarga de Archivos**
- Los endpoints de reportes devuelven `Blob` (PDF/Excel)
- Configuración esencial: `{ responseType: 'blob' }` en axios
- Ver `AdminReports.jsx` función `generateSalesReport` líneas 40-120 para patrón completo
- Incluye validación de fechas y manejo de errores detallado

### 6. **Gestión de Estado**
- **AuthContext**: Maneja login, logout, isAdmin check
- **CartContext**: Maneja carrito (localStorage + React state)
- No hay Redux/Zustand, todo es Context API

### 7. **Filtros y Búsqueda**
- Patrón común: estado local + `useEffect` para filtrar
- Ver `ProductCatalog.jsx` línea 20-40: búsqueda, categoría, rango de precios
- Ver `AdminUsers.jsx` línea 35-50: búsqueda por username/email

## Comandos de Desarrollo

```powershell
# Iniciar dev server (puerto 5173)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Estructura de Archivos Importante

```
src/
├── contexts/          # AuthContext, CartContext (estado global)
├── services/api.js    # Servicios centralizados (authService, productService, etc.)
├── config/api.js      # Configuración axios + interceptores
├── pages/
│   ├── admin/        # AdminDashboard, AdminUsers, AdminReports, AIReportGenerator
│   ├── auth/         # Login, Register
│   ├── products/     # ProductCatalog, ProductDetail
│   └── cart/         # Cart, Checkout, PaymentSuccess, PaymentCancelled
└── components/
    ├── ProtectedRoute.jsx        # Guard para rutas autenticadas
    └── ProtectedAdminRoute.jsx   # Guard para rutas admin
```

## Integración con Backend Django

### Endpoints Principales (http://localhost:8000/api/)
- `POST /token/` - Login (retorna access + refresh)
- `POST /token/refresh/` - Refrescar token
- `GET /users/profile/` - Obtener usuario actual (incluye `is_staff`)
- `GET /products/` - Listar productos
- `GET /reports/sales/?start_date=X&end_date=Y&format=pdf|excel` - Reporte ventas
- `GET /reports/products/?format=pdf|excel` - Reporte inventario
- `POST /orders/{id}/create-checkout-session/` - Crear sesión Stripe

### Headers Requeridos
Todos los endpoints protegidos necesitan: `Authorization: Bearer <access_token>`

## Debugging y Logs

Este proyecto usa **console.log extensivo** para debugging (ver `AdminReports.jsx` líneas 30-120):
- Prefijos con emojis: `🔷 [1]`, `🔷 [2]`, etc. para seguir flujo de ejecución
- Logs de validación, tokens, URLs, errores detallados
- Mantener este patrón al agregar features nuevas

## Pagos con Stripe

1. Usuario hace checkout → `orderService.createCheckoutSession(orderId, urls)`
2. Backend crea sesión Stripe, retorna `{ url: 'stripe-checkout-url' }`
3. Frontend redirige a Stripe
4. Stripe redirige a `/payment-success?session_id=X` o `/payment-cancelled`

## Errores Comunes a Evitar

1. **NO** olvidar `responseType: 'blob'` en reportes
2. **NO** verificar solo `user` para admin, usar `user.is_staff === true`
3. **NO** hacer `axios.get()` directo, usar servicios de `services/api.js`
4. **NO** olvidar validación de fechas en reportes (start < end)
5. **NO** mostrar usuarios `is_staff=true` en AdminUsers (línea 58 filtra esto)

## Documentación Adicional

El repo tiene ~30 archivos `.md` con guías específicas:
- `ADMIN_REPORTS_COMPLETADO.md` - Implementación reportes
- `SOLUCION_COMPLETA_PAGOS.md` - Integración Stripe
- `ADMIN_USERS_COMPLETADO.md` - CRUD usuarios
- `INDICE_DOCUMENTACION.md` - Índice completo

Consulta estos archivos para detalles de implementación específicos.
