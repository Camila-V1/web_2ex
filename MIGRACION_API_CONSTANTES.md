# 🔄 Guía de Migración - Usar Constantes API

## 📦 Importación

```javascript
import { 
  getFullUrl, 
  API_ENDPOINTS, 
  getAuthHeaders,
  getAuthHeadersForDownload 
} from '../constants/api';
// O si estás en una subcarpeta: '../../constants/api'
```

---

## 🎯 Patrones de Migración

### Patrón 1: GET Simple

**❌ ANTES:**
```javascript
const response = await axios.get('http://localhost:8000/api/users/', {
  headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});
```

**✅ DESPUÉS:**
```javascript
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.USERS),
  { headers: getAuthHeaders() }
);
```

---

### Patrón 2: GET con ID

**❌ ANTES:**
```javascript
const response = await axios.get(`http://localhost:8000/api/users/${userId}/`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});
```

**✅ DESPUÉS:**
```javascript
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  { headers: getAuthHeaders() }
);
```

---

### Patrón 3: POST con Body

**❌ ANTES:**
```javascript
const response = await axios.post(
  'http://localhost:8000/api/users/',
  { username: 'test', email: 'test@test.com' },
  { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
);
```

**✅ DESPUÉS:**
```javascript
const response = await axios.post(
  getFullUrl(API_ENDPOINTS.USERS),
  { username: 'test', email: 'test@test.com' },
  { headers: getAuthHeaders() }
);
```

---

### Patrón 4: PUT/PATCH

**❌ ANTES:**
```javascript
await axios.put(
  `http://localhost:8000/api/users/${userId}/`,
  userData,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**✅ DESPUÉS:**
```javascript
await axios.put(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  userData,
  { headers: getAuthHeaders() }
);
```

---

### Patrón 5: DELETE

**❌ ANTES:**
```javascript
await axios.delete(`http://localhost:8000/api/users/${userId}/`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**✅ DESPUÉS:**
```javascript
await axios.delete(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  { headers: getAuthHeaders() }
);
```

---

### Patrón 6: GET con Query Params

**❌ ANTES:**
```javascript
const response = await axios.get('http://localhost:8000/api/products/', {
  params: { category: 5, search: 'laptop' },
  headers: { Authorization: `Bearer ${token}` }
});
```

**✅ DESPUÉS:**
```javascript
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.PRODUCTS),
  { 
    params: { category: 5, search: 'laptop' },
    headers: getAuthHeaders() 
  }
);
```

---

### Patrón 7: Descarga de Archivos (Blob)

**❌ ANTES:**
```javascript
const response = await axios.get('http://localhost:8000/api/reports/sales/', {
  params: { format: 'pdf', start_date: '2024-01-01' },
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'blob'
});
```

**✅ DESPUÉS:**
```javascript
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.REPORTS_SALES),
  { 
    params: { format: 'pdf', start_date: '2024-01-01' },
    headers: getAuthHeadersForDownload(),
    responseType: 'blob'
  }
);
```

---

## 📋 Checklist de Migración por Componente

### AdminDashboard.jsx
- [x] Importar constantes ✅ (ya hecho con URL actualizada)
- [ ] Reemplazar `fetchDashboard()` para usar `getFullUrl(API_ENDPOINTS.ADMIN_DASHBOARD)`
- [ ] Reemplazar headers con `getAuthHeaders()`

### AdminReports.jsx
- [ ] Importar constantes
- [ ] Reemplazar `generateSalesReport()` URL
- [ ] Reemplazar `generateProductsReport()` URL
- [ ] Usar `getAuthHeadersForDownload()` en lugar de construir headers manualmente

### AdminUsers.jsx (cuando se cree)
- [ ] Importar constantes desde el inicio
- [ ] Usar `API_ENDPOINTS.USERS` para lista
- [ ] Usar `API_ENDPOINTS.USER_DETAIL(id)` para operaciones individuales

### ProductList.jsx o similar
- [ ] Importar constantes
- [ ] Reemplazar URL de productos con `API_ENDPOINTS.PRODUCTS`
- [ ] Reemplazar URL de categorías con `API_ENDPOINTS.CATEGORIES`

---

## 🎨 Ejemplo Completo: AdminUsers.jsx

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  getFullUrl, 
  API_ENDPOINTS, 
  getAuthHeaders 
} from '../constants/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET - Lista de usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        getFullUrl(API_ENDPOINTS.USERS),
        { headers: getAuthHeaders() }
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // POST - Crear usuario
  const createUser = async (userData) => {
    try {
      const response = await axios.post(
        getFullUrl(API_ENDPOINTS.USERS),
        userData,
        { headers: getAuthHeaders() }
      );
      setUsers([...users, response.data]);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // PUT - Actualizar usuario
  const updateUser = async (userId, userData) => {
    try {
      const response = await axios.put(
        getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
        userData,
        { headers: getAuthHeaders() }
      );
      setUsers(users.map(u => u.id === userId ? response.data : u));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // DELETE - Eliminar usuario
  const deleteUser = async (userId) => {
    try {
      await axios.delete(
        getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
        { headers: getAuthHeaders() }
      );
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      {/* UI del componente */}
    </div>
  );
};

export default AdminUsers;
```

---

## 🔄 Búsqueda y Reemplazo Rápido

### En VS Code (Ctrl + Shift + H):

1. **Buscar:** `'http://localhost:8000/api/users/'`
   **Reemplazar:** `getFullUrl(API_ENDPOINTS.USERS)`

2. **Buscar:** `'http://localhost:8000/api/products/'`
   **Reemplazar:** `getFullUrl(API_ENDPOINTS.PRODUCTS)`

3. **Buscar:** `'http://localhost:8000/api/orders/'`
   **Reemplazar:** `getFullUrl(API_ENDPOINTS.ORDERS)`

4. **Buscar:** `headers: { Authorization: \`Bearer \${.*?}\` }`
   **Reemplazar:** `headers: getAuthHeaders()`
   *(Nota: Requiere regex)*

---

## 🎯 Ventajas de Usar Constantes

### 1. **Mantenimiento Centralizado**
Un solo lugar para actualizar todas las URLs.

### 2. **Prevención de Errores**
Autocomplete del IDE previene typos.

### 3. **Configuración por Entorno**
`.env.production`:
```env
VITE_API_URL=https://api.smartsales365.com/api
```

`.env.development`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 4. **Testing Más Fácil**
Mock de `API_BASE_URL` en tests.

### 5. **Documentación Automática**
El archivo `api.js` sirve como referencia rápida de endpoints disponibles.

---

## 🚀 Próximos Pasos

1. ✅ Archivo `api.js` creado
2. ✅ AdminDashboard actualizado con nueva URL
3. ⏳ **Verificar que reportes funcionen** (prioridad #1)
4. ⏳ Migrar AdminReports a usar constantes (opcional pero recomendado)
5. ⏳ Crear nuevos componentes (AdminUsers, AdminProducts) usando constantes desde el inicio

---

## 📌 Regla de Oro

**Para nuevos componentes:**
- ✅ SIEMPRE importar `src/constants/api.js`
- ✅ NUNCA hardcodear URLs como `'http://localhost:8000/api/...'`
- ✅ SIEMPRE usar `getAuthHeaders()` para autenticación

**Para componentes existentes:**
- Migrar progresivamente
- Priorizar componentes que cambien URLs frecuentemente
- No es urgente para componentes que ya funcionan correctamente
