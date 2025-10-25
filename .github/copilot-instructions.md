# Instrucciones para Agentes de IA - SmartSales365

## Arquitectura General

Este es un e-commerce **React + Vite** con backend Django REST Framework. Stack: React 19, React Router v7, Axios, Tailwind CSS, Lucide Icons.

### Flujo de Datos Principal

```
AuthContext (localStorage tokens) → api.js (axios interceptors) → Django API (http://localhost:8000/api/)
  ↓
CartContext (localStorage cart) → Checkout → Stripe → PaymentSuccess/Cancelled
```

### Backend Repository
- **Repo Backend**: `https://github.com/Camila-V1/backend_2ex`
- **API Base URL**: `http://localhost:8000/api/`
- **Documentación API**: 
  - Swagger UI: `http://localhost:8000/api/docs/`
  - ReDoc: `http://localhost:8000/api/redoc/`
  - Schema JSON: `API_SCHEMA.json`

## Convenciones Clave del Proyecto

### 1. **Sistema de Roles (RBAC)**
- El backend define **3 roles** de usuario: `ADMIN`, `MANAGER`, `CAJERO`
- **CRÍTICO**: `user.role` determina permisos específicos de cada funcionalidad
- `user.is_staff` determina acceso admin general (ver `AuthContext.jsx` línea 150+)
- Verificar siempre el rol antes de mostrar funcionalidades específicas

**Permisos por Rol:**
```javascript
// Ejemplo de verificación de roles
const hasPermission = (requiredRole) => {
  const roleHierarchy = { ADMIN: 3, MANAGER: 2, CAJERO: 1 };
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

// CAJERO: Crear órdenes, ver historial de ventas
// MANAGER: Todo lo de CAJERO + Dashboard, reportes, predicciones ML, ver clientes
// ADMIN: Control total (usuarios, productos, categorías, órdenes, reseñas)
```

### 2. **Autenticación con JWT**
- Los tokens se guardan en `localStorage`: `access_token`, `refresh_token`, `user`
- **CRÍTICO**: `user.is_staff` determina acceso admin (ver `AuthContext.jsx` línea 150+)
- `api.js` tiene interceptor automático que refresca tokens en 401
### 2. **Autenticación con JWT**
- Los tokens se guardan en `localStorage`: `access_token`, `refresh_token`, `user`
- **CRÍTICO**: `user.is_staff` determina acceso admin, `user.role` determina permisos específicos
- `api.js` tiene interceptor automático que refresca tokens en 401
- Siempre verifica `isAdmin()` antes de mostrar rutas `/admin/*`

Ejemplo real del código:
```javascript
// AuthContext.jsx - Función isAdmin
const isAdmin = () => {
  return state.user?.is_staff === true;
};

// Verificar rol específico
const hasRole = (role) => {
  return state.user?.role === role;
};
```

### 3. **Variables de Entorno**
- `VITE_API_URL` define la URL base del backend (default: `http://localhost:8000/api`)
- Siempre usa: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'`
- Ver ejemplos en `AdminReports.jsx` línea 19, `AdminUsers.jsx` línea 22

### 4. **Servicios API Centralizados**
- **NO** hagas llamadas `axios` directas en componentes
- Usa `services/api.js` que exporta: `authService`, `productService`, `categoryService`, `orderService`, `reportService`
- `config/api.js` configura axios base con interceptores automáticos

Ejemplo correcto:
```javascript
import { productService } from '../../services/api';
const products = await productService.getProducts();
```

### 5. **Rutas Protegidas**
- Usuarios autenticados: `<ProtectedRoute>` (ver `App.jsx` línea 51)
- Solo admins: `<ProtectedAdminRoute>` (ver `App.jsx` línea 75)
- Las rutas de pago (`/payment-success`, `/payment-cancelled`) son **públicas** para Stripe redirects

### 6. **Reportes con Descarga de Archivos**
- Los endpoints de reportes devuelven `Blob` (PDF/Excel)
- Configuración esencial: `{ responseType: 'blob' }` en axios
- Ver `AdminReports.jsx` función `generateSalesReport` líneas 40-120 para patrón completo
- Incluye validación de fechas y manejo de errores detallado

### 7. **Gestión de Estado**
- **AuthContext**: Maneja login, logout, isAdmin check
- **CartContext**: Maneja carrito (localStorage + React state)
- No hay Redux/Zustand, todo es Context API

### 8. **Filtros y Búsqueda**
- Patrón común: estado local + `useEffect` para filtrar
- Ver `ProductCatalog.jsx` línea 20-40: búsqueda, categoría, rango de precios
- Ver `AdminUsers.jsx` línea 35-50: búsqueda por username/email

## Funcionalidades por Actor

### 👤 Usuario Anónimo (No autenticado)
- ✅ Ver catálogo de productos y detalles
- ✅ Ver reseñas y calificaciones de productos
- ✅ Ver recomendaciones de productos relacionados
- ✅ Búsqueda con sugerencias de autocompletado
- ✅ Registrarse como nuevo usuario

### 🛒 Cliente (Usuario Registrado)
Hereda todo de Usuario Anónimo +
- ✅ Login/Logout con JWT
- ✅ Gestión de perfil (ver y actualizar datos)
- ✅ **Carrito con comandos de voz/texto** usando NLP
- ✅ Añadir/modificar/eliminar productos del carrito
- ✅ Checkout y pago con Stripe
- ✅ Ver historial de órdenes propias
- ✅ Descargar comprobantes/facturas en PDF
- ✅ Dejar reseñas en productos (crear, editar, eliminar propias)

### 💼 CAJERO (Rol `CAJERO`)
Hereda todo de Cliente +
- ✅ Crear órdenes para otros clientes
- ✅ Consultar historial de ventas general
- ✅ Generar reportes básicos de ventas

### 📊 MANAGER (Rol `MANAGER`)
Hereda todo de CAJERO +
- ✅ **Dashboard administrativo** con métricas y gráficos
- ✅ **Predicciones de ventas** con Machine Learning (30 días)
- ✅ **Reportes dinámicos con IA** usando prompts de texto/voz
  - Ejemplo: "ventas de octubre en PDF", "productos por categoría en Excel"
- ✅ Descargar reportes en PDF y Excel
- ✅ Ver lista completa de clientes y sus estadísticas
- ✅ Ver análisis de ventas diarias (últimos 30 días)
- ✅ Supervisión de productos más vendidos y stock bajo

### 👨‍💼 ADMIN (Rol `ADMIN`)
Hereda todo de MANAGER +
- ✅ **Gestión total de usuarios** (CRUD + asignación de roles)
- ✅ **Gestión total de productos** (CRUD + activar/desactivar)
- ✅ **Gestión total de categorías** (CRUD)
- ✅ **Gestión total de órdenes** (ver todas, cambiar estado, eliminar)
- ✅ **Moderación de reseñas** (editar/eliminar cualquiera)
- ✅ Configuración del sistema (Stripe, ML, etc.)

**IMPORTANTE**: Validar siempre `user.role` y `user.is_staff` antes de renderizar componentes admin

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

**Autenticación:**
- `POST /token/` - Login (retorna access + refresh)
- `POST /token/refresh/` - Refrescar token
- `POST /token/verify/` - Verificar token válido
- `GET /users/profile/` - Obtener usuario actual (incluye `is_staff` y `role`)

**Usuarios (Admin only):**
- `GET /users/` - Lista todos los usuarios
- `POST /users/` - Crear usuario
- `GET /users/{id}/` - Detalle de usuario
- `PATCH /users/{id}/` - Actualizar usuario
- `DELETE /users/{id}/` - Eliminar usuario

**Productos:**
- `GET /products/` - Listar productos (con paginación)
- `POST /products/` - Crear producto (admin)
- `GET /products/{id}/` - Detalle de producto
- `PATCH /products/{id}/` - Actualizar producto (admin)
- `DELETE /products/{id}/` - Eliminar producto (admin)
- `GET /products/{id}/recommendations/` - Productos relacionados (ML)
- `GET /products/{id}/reviews/` - Reseñas de un producto

**Categorías:**
- `GET /products/categories/` - Listar categorías
- `POST /products/categories/` - Crear categoría (admin)

**Reseñas:**
- `POST /products/reviews/` - Crear reseña
- `PATCH /products/reviews/{id}/` - Actualizar reseña propia
- `DELETE /products/reviews/{id}/` - Eliminar reseña

**Órdenes:**
- `POST /orders/create/` - Crear orden desde carrito
- `GET /orders/` - Mis órdenes (o todas si admin)
- `GET /orders/{id}/` - Detalle de orden
- `POST /orders/{id}/create-checkout-session/` - Crear sesión Stripe
- `POST /orders/stripe-webhook/` - Webhook de Stripe (automático)

**NLP - Carrito Inteligente:**
- `POST /orders/cart/add-natural-language/` - Agregar productos con texto/voz
  - Ejemplo: "Agrega 2 smartphones al carrito"
- `GET /orders/cart/suggestions/?q=texto` - Sugerencias de productos

**Admin - Dashboard:**
- `GET /orders/admin/dashboard/` - Estadísticas completas (caché 5 min)
- `GET /orders/admin/analytics/sales/` - Análisis de ventas diarias
- `GET /orders/admin/users/` - Lista de clientes con estadísticas

**Reportes:**
- `GET /reports/sales/?start_date=X&end_date=Y&format=pdf|excel` - Reporte ventas
- `GET /reports/products/?format=pdf|excel` - Reporte inventario
- `POST /reports/dynamic-parser/` - **Reportes con IA usando prompts**
  - Ejemplo: `{"prompt": "ventas de octubre en PDF"}`
- `GET /reports/orders/{id}/invoice/` - Factura de orden en PDF

**Machine Learning:**
- `GET /predictions/sales/` - Predicciones de ventas (30 días)

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

1. **NO** olvidar `responseType: 'blob'` en reportes PDF/Excel
2. **NO** verificar solo `user` para admin, usar `user.is_staff === true` Y verificar `user.role`
3. **NO** hacer `axios.get()` directo, usar servicios de `services/api.js`
4. **NO** olvidar validación de fechas en reportes (start < end)
5. **NO** mostrar usuarios `is_staff=true` en AdminUsers (línea 58 filtra esto)
6. **NO** renderizar funciones admin sin verificar `isAdmin()` y el rol específico
7. **NO** olvidar que el dashboard usa caché de 5 minutos en el backend
8. **NO** exponer funciones de NLP o ML sin autenticación

## Características Especiales del Proyecto

### 🎤 NLP - Carrito con Lenguaje Natural
- Los usuarios pueden agregar productos usando comandos de texto o voz
- Ejemplos: "Quiero 3 laptops", "Agrega 2 smartphones al carrito"
- Backend usa procesamiento de lenguaje natural para extraer productos y cantidades
- Ver endpoint: `POST /orders/cart/add-natural-language/`

### 🤖 Machine Learning
- **Predicciones de Ventas**: Modelo Random Forest entrenado con datos históricos
- Predice ventas para los próximos 30 días
- Requiere comando previo en backend: `python manage.py train_sales_model`
- Ver endpoint: `GET /predictions/sales/`

### 📊 Reportes con IA
- Generación dinámica de reportes usando prompts de lenguaje natural
- El backend parsea comandos como "ventas de octubre en PDF"
- Soporta PDF y Excel con generación automática
- Ver endpoint: `POST /reports/dynamic-parser/`

### 💳 Integración Stripe
- Checkout completo con redirección a Stripe
- Webhooks automáticos que actualizan estado de órdenes
- URLs de éxito/cancelación son públicas (no requieren auth)
- Comprobantes en PDF generados automáticamente

### ⚡ Optimizaciones del Backend
- **Caché**: Dashboard usa caché de 5 minutos (Redis recomendado)
- **Paginación**: Todos los listados están paginados
- **CORS**: Configurado para `localhost:5173` y `localhost:3000`
- **Throttling**: Rate limiting en endpoints públicos

## Documentación Adicional

El repo tiene ~30 archivos `.md` con guías específicas:
- `ADMIN_REPORTS_COMPLETADO.md` - Implementación reportes
- `SOLUCION_COMPLETA_PAGOS.md` - Integración Stripe
- `ADMIN_USERS_COMPLETADO.md` - CRUD usuarios
- `INDICE_DOCUMENTACION.md` - Índice completo

Consulta estos archivos para detalles de implementación específicos.
