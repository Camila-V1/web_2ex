# 🎯 GUÍA RÁPIDA - Endpoints API

**Para copiar y pegar rápido**

---

## 🔐 AUTENTICACIÓN

```javascript
// Login
POST /api/token/
Body: { email: "user@email.com", password: "pass123" }

// Refresh Token  
POST /api/token/refresh/
Body: { refresh: "..." }
```

---

## 👥 USUARIOS

```javascript
// Listar (Admin)
GET /api/users/
Headers: Authorization: Bearer {token}

// Crear (Registro)
POST /api/users/
Body: { email, password, first_name, last_name }

// Ver uno
GET /api/users/{id}/

// Actualizar
PUT /api/users/{id}/
PATCH /api/users/{id}/

// Eliminar
DELETE /api/users/{id}/

// Perfil actual
GET /api/users/profile/
```

---

## 📦 PRODUCTOS

```javascript
// Listar
GET /api/products/

// Ver uno
GET /api/products/{id}/

// Crear (Admin)
POST /api/products/
Body: { name, description, price, stock, category, image_url }

// Actualizar (Admin)
PUT /api/products/{id}/

// Eliminar (Admin)
DELETE /api/products/{id}/
```

---

## 🏷️ CATEGORÍAS

```javascript
// Listar
GET /api/products/categories/

// Ver una
GET /api/products/categories/{id}/

// Crear (Admin)
POST /api/products/categories/

// Actualizar (Admin)
PUT /api/products/categories/{id}/

// Eliminar (Admin)
DELETE /api/products/categories/{id}/
```

---

## 🛒 ÓRDENES (Usuarios)

```javascript
// Mis órdenes
GET /api/orders/

// Ver una orden
GET /api/orders/{id}/

// Crear orden
POST /api/orders/create/
Body: { items: [{ product: 1, quantity: 2 }] }

// Checkout Stripe
POST /api/orders/{id}/create-checkout-session/
```

---

## 👨‍💼 ADMIN - ÓRDENES

```javascript
// Todas las órdenes
GET /api/orders/admin/

// Ver detalle
GET /api/orders/admin/{id}/

// Cambiar estado
PATCH /api/orders/admin/{id}/update_status/
Body: { status: "shipped" }
// Estados: pending, paid, shipped, delivered, cancelled
```

---

## 📊 ADMIN - DASHBOARD

```javascript
// Dashboard general
GET /api/orders/admin/dashboard/

// Lista de usuarios
GET /api/orders/admin/users/

// Analytics de ventas
GET /api/orders/admin/analytics/sales/
?start_date=2025-01-01&end_date=2025-12-31
```

---

## 📄 REPORTES (Admin)

```javascript
// Reporte de ventas PDF
GET /api/reports/sales/?format=pdf&start_date=2025-10-01&end_date=2025-10-31

// Reporte de ventas Excel
GET /api/reports/sales/?format=excel&start_date=2025-10-01&end_date=2025-10-31

// Reporte de productos PDF
GET /api/reports/products/?format=pdf

// Reporte de productos Excel
GET /api/reports/products/?format=excel
```

---

## 💻 USAR EN CÓDIGO

### Importar constantes:

```javascript
import { 
  getFullUrl, 
  API_ENDPOINTS, 
  getAuthHeaders 
} from './constants/api';
```

### Ejemplos:

```javascript
// GET simple
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.PRODUCTS),
  { headers: getAuthHeaders() }
);

// GET con ID
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.PRODUCT_DETAIL(5)),
  { headers: getAuthHeaders() }
);

// POST con body
const response = await axios.post(
  getFullUrl(API_ENDPOINTS.USERS),
  { email: 'test@test.com', password: 'pass123' },
  { headers: getAuthHeaders() }
);

// PUT
await axios.put(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  userData,
  { headers: getAuthHeaders() }
);

// DELETE
await axios.delete(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  { headers: getAuthHeaders() }
);

// Descarga de archivo (reporte)
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.REPORTS_SALES),
  {
    params: { format: 'pdf', start_date: '2025-01-01', end_date: '2025-12-31' },
    headers: getAuthHeadersForDownload(),
    responseType: 'blob'
  }
);
```

---

## 🔑 HEADERS REQUERIDOS

```javascript
// Para peticiones JSON
Authorization: Bearer {access_token}
Content-Type: application/json

// Para descargas (blob)
Authorization: Bearer {access_token}
// No incluir Content-Type
```

---

## ⚠️ PERMISOS

| Endpoint | Requiere Auth | Solo Admin |
|----------|---------------|------------|
| `/api/token/` | ❌ No | ❌ No |
| `/api/users/` (POST - registro) | ❌ No | ❌ No |
| `/api/users/` (GET - listar) | ✅ Sí | ✅ Sí |
| `/api/users/profile/` | ✅ Sí | ❌ No |
| `/api/products/` (GET) | ❌ No | ❌ No |
| `/api/products/` (POST/PUT/DELETE) | ✅ Sí | ✅ Sí |
| `/api/orders/` | ✅ Sí | ❌ No |
| `/api/orders/create/` | ✅ Sí | ❌ No |
| `/api/orders/admin/*` | ✅ Sí | ✅ Sí |
| `/api/reports/*` | ✅ Sí* | ✅ Sí* |

*Según configuración del backend

---

## 🧪 TESTING RÁPIDO

```bash
# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Listar productos
curl http://localhost:8000/api/products/

# Dashboard (con token)
curl http://localhost:8000/api/orders/admin/dashboard/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Descargar reporte
curl "http://localhost:8000/api/reports/sales/?format=pdf&start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output reporte.pdf
```

---

## 📊 RESPUESTAS TÍPICAS

### Success (200):
```json
{
  "id": 1,
  "name": "Producto",
  "price": "99.99"
}
```

### Error 401:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Error 403:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Error 404:
```json
{
  "detail": "Not found."
}
```

---

## 🎯 ENDPOINTS POR COMPONENTE

### AdminDashboard:
- `GET /api/orders/admin/dashboard/`

### AdminUsers:
- `GET /api/users/`
- `PUT /api/users/{id}/`
- `DELETE /api/users/{id}/`

### AdminReports:
- `GET /api/reports/sales/`
- `GET /api/reports/products/`

### AdminOrders (futuro):
- `GET /api/orders/admin/`
- `GET /api/orders/admin/{id}/`
- `PATCH /api/orders/admin/{id}/update_status/`

### AdminProducts (futuro):
- `GET /api/products/`
- `POST /api/products/`
- `PUT /api/products/{id}/`
- `DELETE /api/products/{id}/`
- `GET /api/products/categories/`

---

**Última actualización:** 18/10/2025  
**Backend:** Django 5.2.6 + DRF 3.x  
**Frontend:** React 18 + Vite 5
