# 🚀 CONTEXTO PROYECTO - SmartSales365 E-commerce
## Última Actualización: Noviembre 11, 2025

---

## 📋 INFORMACIÓN GENERAL

### Stack Tecnológico
- **Frontend**: React 19 + Vite + React Router v7 + Tailwind CSS
- **Backend**: Django REST Framework + PostgreSQL
- **Autenticación**: JWT (access + refresh tokens)
- **Estado**: Context API (AuthContext, CartContext)
- **Pagos**: Stripe Checkout
- **Deploy**: 
  - Frontend: **Vercel** (https://web-2ex.vercel.app)
  - Backend: **Render** (https://backend-2ex-ecommerce.onrender.com)

### Repositorios
- **Frontend**: https://github.com/Camila-V1/web_2ex
- **Backend**: https://github.com/Camila-V1/backend_2ex

---

## 🌐 URLS DE PRODUCCIÓN

### Frontend en Vercel
```
Production: https://web-2ex.vercel.app
Preview URLs: https://web-2ex-[hash].vercel.app
```

### Backend en Render
```
API Base: https://backend-2ex-ecommerce.onrender.com/api/
Admin Django: https://backend-2ex-ecommerce.onrender.com/admin/
Swagger: https://backend-2ex-ecommerce.onrender.com/api/docs/
```

### Variables de Entorno (.env.production)
```env
VITE_API_URL=https://backend-2ex-ecommerce.onrender.com/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51QMkl...
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### Roles de Usuario (RBAC)
1. **CAJERO** - Crear órdenes, ver ventas
2. **MANAGER** - Dashboard, reportes, predicciones ML
3. **ADMIN** - Control total (usuarios, productos, categorías)

### Verificación de Permisos
```javascript
// AuthContext.jsx
const isAdmin = () => state.user?.is_staff === true;
const hasRole = (role) => state.user?.role === role;
const hasPermission = (requiredRole) => {
  const hierarchy = { ADMIN: 3, MANAGER: 2, CAJERO: 1 };
  return hierarchy[user.role] >= hierarchy[requiredRole];
};
```

### Tokens JWT
- Se guardan en `localStorage`: `access_token`, `refresh_token`, `user`
- **Axios interceptor automático** refresca tokens en 401
- Ver: `src/config/api.js`

---

## 📁 ESTRUCTURA DE ARCHIVOS CLAVE

```
src/
├── config/
│   └── api.js              # Axios instance + interceptores JWT
├── constants/
│   └── api.js              # URLs base del backend
├── contexts/
│   ├── AuthContext.jsx     # Login, logout, isAdmin, hasRole
│   └── CartContext.jsx     # Carrito en localStorage
├── services/
│   └── api.js              # authService, productService, orderService, etc.
├── pages/
│   ├── auth/               # Login, Register
│   ├── admin/              # Dashboard, Users, Reports, Products
│   ├── cajero/             # Panel de cajero
│   ├── manager/            # Panel de manager (si existe)
│   ├── products/           # Catálogo, detalle
│   └── cart/               # Cart, Checkout, PaymentSuccess
└── components/
    ├── common/
    │   ├── ProtectedRoute.jsx       # Guard autenticado
    │   ├── ProtectedAdminRoute.jsx  # Guard admin
    │   └── ProtectedCajeroRoute.jsx # Guard cajero
    └── layout/
        ├── Header.jsx
        ├── Footer.jsx
        └── Layout.jsx
```

---

## 🛒 FUNCIONALIDADES PRINCIPALES

### 1. E-commerce Básico ✅
- Catálogo de productos con filtros (categoría, precio, búsqueda)
- Detalle de producto con reseñas
- Carrito de compras (localStorage)
- Checkout y pago con Stripe
- Historial de órdenes
- Descarga de facturas en PDF

### 2. Sistema de Roles ✅
- **CAJERO**: Crear órdenes para clientes
- **MANAGER**: Dashboard con métricas, reportes, predicciones ML
- **ADMIN**: CRUD completo de usuarios, productos, categorías, órdenes

### 3. Carrito Inteligente con NLP ✅
- Comandos de voz y texto para agregar productos
- Endpoint: `POST /orders/cart/add-natural-language/`
- Ejemplo: "Agrega 2 smartphones al carrito"

### 4. Machine Learning ✅
- **Predicciones de ventas** (30 días) con Random Forest
- **Recomendaciones de productos relacionados**
- Endpoint: `GET /predictions/sales/`

### 5. Reportes con IA ✅
- Generación dinámica con prompts de lenguaje natural
- Endpoint: `POST /reports/dynamic-parser/`
- Ejemplo: `{"prompt": "ventas de octubre en PDF"}`
- Soporta PDF y Excel

### 6. Sistema de Devoluciones ✅
- Clientes pueden solicitar devoluciones
- Estados: PENDIENTE, APROBADO, RECHAZADO, COMPLETADO
- Managers aprueban/rechazan devoluciones

### 7. Billetera Virtual ✅
- Saldo virtual para clientes
- Se acredita dinero al aprobar devoluciones
- Se puede usar en checkout para pagar órdenes

---

## 🔧 CONFIGURACIÓN IMPORTANTE

### vercel.json (Frontend)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
**Propósito**: Client-side routing para React Router (sin proxy)

### CORS en Backend
El backend está configurado para aceptar requests de:
- `localhost:5173` (dev)
- `localhost:3000` (dev alternativo)
- `web-2ex.vercel.app` (production)
- `*.vercel.app` (preview URLs de Vercel)

```python
# settings.py
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://web-2ex-[a-zA-Z0-9-]+\.vercel\.app$",
    r"^https://web-2ex\.vercel\.app$",
]
```

---

## 🚨 PROBLEMAS RESUELTOS RECIENTEMENTE

### 1. Mixed Content Error (HTTPS → HTTP) ✅
**Problema**: Frontend HTTPS en Vercel no podía llamar a backend HTTP en AWS
**Solución**: Migrar backend a Render con HTTPS

### 2. CORS en Vercel Preview URLs ✅
**Problema**: URLs preview de Vercel (`web-2ex-[hash].vercel.app`) bloqueadas por CORS
**Solución**: Agregar regex en backend para aceptar `*.vercel.app`

### 3. Client-Side Routing en Vercel ✅
**Problema**: Rutas como `/login` retornaban 404 en refresh
**Solución**: `vercel.json` con rewrite `/(.*) → /index.html`

### 4. Axios Interceptor URL Construction ✅
**Problema**: `new URL(config.url, config.baseURL)` fallaba con paths relativos
**Solución**: Try-catch con fallback a string concatenation

---

## 📊 ENDPOINTS API CRÍTICOS

### Autenticación
```
POST /api/token/               # Login (retorna access + refresh)
POST /api/token/refresh/       # Refrescar token
GET  /api/users/profile/       # Usuario actual (incluye is_staff, role)
```

### Productos
```
GET  /api/products/                      # Listar productos
GET  /api/products/{id}/                 # Detalle
GET  /api/products/{id}/recommendations/ # ML recomendaciones
GET  /api/products/{id}/reviews/         # Reseñas
POST /api/products/reviews/              # Crear reseña
```

### Órdenes
```
POST /api/orders/create/                           # Crear orden desde carrito
GET  /api/orders/                                  # Mis órdenes (o todas si admin)
POST /api/orders/{id}/create-checkout-session/    # Stripe checkout
GET  /api/reports/orders/{id}/invoice/            # Factura PDF
```

### NLP - Carrito Inteligente
```
POST /api/orders/cart/add-natural-language/  # Agregar productos con texto/voz
GET  /api/orders/cart/suggestions/?q=texto   # Sugerencias autocompletado
```

### Admin - Dashboard
```
GET /api/orders/admin/dashboard/          # Métricas (caché 5 min)
GET /api/orders/admin/analytics/sales/    # Ventas diarias (30 días)
GET /api/orders/admin/users/              # Clientes con stats
```

### Reportes
```
GET  /api/reports/sales/?start_date=X&end_date=Y&format=pdf|excel
GET  /api/reports/products/?format=pdf|excel
POST /api/reports/dynamic-parser/         # Reportes con IA (prompts)
```

### Machine Learning
```
GET /api/predictions/sales/  # Predicciones 30 días
```

### Devoluciones (Returns)
```
GET  /api/returns/                    # Lista de devoluciones
POST /api/returns/                    # Crear devolución
GET  /api/returns/{id}/               # Detalle
PATCH /api/returns/{id}/approve/      # Aprobar (manager/admin)
PATCH /api/returns/{id}/reject/       # Rechazar (manager/admin)
```

### Billetera (Wallet)
```
GET /api/wallet/                      # Consultar saldo
GET /api/wallet/transactions/         # Historial transacciones
```

---

## 🐛 DEBUGGING

### Logs en Producción
El proyecto tiene **logging extensivo** en:
- `src/config/api.js` - Axios interceptors
- `src/contexts/AuthContext.jsx` - Login flow (12 pasos)
- `src/pages/auth/Login.jsx` - Form submission

### Verificar Errores Comunes
```javascript
// 1. Ver logs de axios en consola
console.log('🔷 [AXIOS REQUEST]', config);
console.log('✅ [AXIOS RESPONSE]', response);
console.log('❌ [AXIOS ERROR]', error);

// 2. Verificar tokens en localStorage
localStorage.getItem('access_token');
localStorage.getItem('user');

// 3. Verificar permisos
const { isAdmin, hasRole } = useAuth();
console.log('isAdmin:', isAdmin());
console.log('role:', user?.role);
```

---

## 🚀 DEPLOY A PRODUCCIÓN

### Frontend (Vercel)
```powershell
# Vercel detecta automáticamente los pushes a GitHub
git add .
git commit -m "fix: descripción"
git push origin main

# Esperar 2-3 minutos para que Vercel redespliegue
```

### Backend (Render)
```bash
# Render detecta automáticamente los pushes a GitHub
git add .
git commit -m "fix: descripción"
git push origin main

# Esperar 5-10 minutos para que Render redespliegue
# IMPORTANTE: Render free tier tiene cold start (50s en primera request)
```

---

## 📝 CREDENCIALES DE PRUEBA

### Usuario Admin
```
Username: admin
Password: admin123
Role: ADMIN
is_staff: true
```

### Usuario Manager
```
Username: manager
Password: manager123
Role: MANAGER
is_staff: false
```

### Usuario Cajero
```
Username: cajero
Password: cajero123
Role: CAJERO
is_staff: false
```

### Usuario Cliente Normal
```
Username: cliente
Password: cliente123
Role: null
is_staff: false
```

---

## ⚠️ NOTAS IMPORTANTES

### 1. Render Free Tier Limitations
- **Cold Start**: Primera request después de 15 min inactivo tarda ~50 segundos
- **Sleep Mode**: Backend duerme después de 15 min sin tráfico
- **Solución**: Agregar health check cada 10 min (cron job externo)

### 2. Stripe Test Mode
- Usar tarjeta de prueba: `4242 4242 4242 4242`
- CVV: cualquier 3 dígitos
- Fecha: cualquier fecha futura

### 3. Machine Learning
- El modelo Random Forest debe entrenarse primero en el backend
- Comando: `python manage.py train_sales_model`
- Requiere datos históricos de ventas

### 4. Caché en Backend
- Dashboard usa caché de 5 minutos (Redis recomendado en producción)
- Sin Redis usa caché en memoria (se resetea con cada deploy)

### 5. Variables de Entorno en Vercel
**CRÍTICO**: Configurar en Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://backend-2ex-ecommerce.onrender.com/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51...
```

---

## 🔄 PRÓXIMOS PASOS SUGERIDOS

### Optimizaciones Pendientes
- [ ] Implementar Redis para caché persistente
- [ ] Agregar health check externo para evitar cold starts
- [ ] Implementar CDN para imágenes de productos
- [ ] Agregar tests unitarios (Jest + React Testing Library)
- [ ] Implementar CI/CD con GitHub Actions
- [ ] Agregar monitoring (Sentry para errores)
- [ ] Optimizar queries del backend (select_related, prefetch_related)

### Features Sugeridas
- [ ] Chat en vivo con soporte
- [ ] Sistema de notificaciones (email/push)
- [ ] Panel de analytics avanzado (Google Analytics)
- [ ] Sistema de cupones y descuentos
- [ ] Integración con redes sociales
- [ ] PWA (Progressive Web App)
- [ ] Multi-idioma (i18n)

---

## 📚 DOCUMENTACIÓN ADICIONAL

### Archivos de Referencia (Mantener)
- `README.md` - Guía principal del proyecto
- `README_DESPLIEGUE.md` - Guía detallada de deploy
- `IMPLEMENTACION_COMPLETA_DEVOLUCIONES_BILLETERA.md` - Sistema returns/wallet
- `INDICE_DOCUMENTACION.md` - Índice de toda la documentación
- `.github/copilot-instructions.md` - Instrucciones para agentes IA

### Archivos Eliminados (Obsoletos)
Se eliminaron ~50 archivos .md con información vieja de debugging y fixes aplicados.
Solo se mantienen los archivos relevantes para desarrollo futuro.

---

## 🆘 SOPORTE

Si encuentras problemas:
1. **Revisa logs en DevTools** (F12 → Console + Network)
2. **Verifica variables de entorno** en Vercel y Render
3. **Consulta backend logs** en Render Dashboard → Logs
4. **Revisa este documento** para contexto actualizado

---

**Última verificación**: Noviembre 11, 2025
**Estado del proyecto**: ✅ Funcional en producción
**URL producción**: https://web-2ex.vercel.app
**Desarrollado por**: Camila V.
