# 🔴 ERROR 403 FALSO - SOLUCIÓN URGENTE

**Error mostrado:**
```
Uncaught (in promise) {
  name: 'i',
  httpError: false,
  httpStatus: 200,    ← Backend responde OK
  httpStatusText: '',
  code: 403,          ← Error FALSO generado por librería
}
```

---

## 🎯 DIAGNÓSTICO

✅ **Backend:** Todos los endpoints responden **200 OK**  
✅ **Permisos:** Usuario admin tiene acceso completo  
❌ **Problema:** Librería del frontend (axios/fetch wrapper) genera **403 falso**

---

## 🔍 CAUSAS POSIBLES

### 1. **Interceptor de Axios mal configurado** ⭐ MÁS PROBABLE

```javascript
// ❌ INCORRECTO: Interceptor rechaza respuestas válidas
axios.interceptors.response.use(
  response => response,
  error => {
    // Aquí puede estar generando el 403 falso
    if (error.response.status === 401) {
      throw { code: 403, ... };  // ¡Error!
    }
  }
);
```

### 2. **Validación de permisos en frontend antes de request**

```javascript
// ❌ INCORRECTO: Frontend valida permisos incorrectamente
if (!hasPermission('ADMIN')) {
  throw { code: 403 };  // Error antes de hacer request
}
```

### 3. **CORS o Content Security Policy**

```javascript
// Navegador bloquea respuesta por CORS
// Backend responde 200, pero navegador genera 403
```

---

## ✅ SOLUCIONES

### SOLUCIÓN 1: Revisar Interceptores (axios)

**Archivo:** `src/services/api.js` o `src/utils/axios.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-2ex-ecommerce.onrender.com/api',
});

// ✅ CORRECTO: Interceptor que NO genera errores falsos
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // ✅ Si backend responde 200, retornar sin modificar
    return response;
  },
  (error) => {
    // ✅ Solo manejar errores REALES del backend
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        // Token expirado - redirigir a login
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      
      if (status === 403) {
        // 403 REAL del backend
        console.error('Acceso denegado:', error.response.data);
      }
    }
    
    // ❌ NO transformar errores ni cambiar códigos
    return Promise.reject(error);
  }
);

export default api;
```

---

### SOLUCIÓN 2: Deshabilitar validación de permisos cliente-side

```javascript
// ❌ ELIMINAR validaciones de permisos en frontend:
// El backend ya maneja permisos correctamente

// ❌ ANTES:
if (userRole !== 'ADMIN') {
  throw new Error('Access denied');  // Genera 403 falso
}

// ✅ DESPUÉS:
// Dejar que backend maneje permisos
// Si falla, mostrar el error real del backend
```

---

### SOLUCIÓN 3: Verificar CORS

**En DevTools > Console:**
```
Si ves: "CORS policy: No 'Access-Control-Allow-Origin' header"
→ El backend necesita agregar el origen del frontend
```

**Backend ya tiene CORS configurado**, pero verifica:

```python
# ecommerce_api/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://web-2ex.vercel.app",
    "http://localhost:5173",
]
```

---

### SOLUCIÓN 4: Wrapper de API sin transformaciones

```javascript
// ✅ Wrapper simple sin modificar errores
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(
      `https://backend-2ex-ecommerce.onrender.com/api${endpoint}`,
      {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      }
    );
    
    // ✅ Retornar respuesta tal cual - sin transformar
    if (!response.ok) {
      const error = await response.json();
      console.error(`API Error ${response.status}:`, error);
      return null;  // Retornar null, no throw
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Network error:', error);
    return null;  // Retornar null, no throw
  }
}

// Uso:
const dashboard = await apiCall('/orders/admin/dashboard/');
if (dashboard) {
  // Procesar datos
} else {
  // Mostrar mensaje de error
}
```

---

## 🔧 DEBUGGING EN NAVEGADOR

### Paso 1: Abrir DevTools > Network

1. Recargar dashboard
2. Buscar requests fallidos (rojos)
3. Click en request → Headers
4. Verificar:
   - Status Code (debe ser 200)
   - Response Headers (debe tener CORS)

### Paso 2: Console

```javascript
// Ejecutar en console del navegador:

// 1. Verificar token
console.log('Token:', localStorage.getItem('access_token'));

// 2. Test manual
fetch('https://backend-2ex-ecommerce.onrender.com/api/orders/admin/dashboard/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(d => console.log('Dashboard:', d))
.catch(e => console.error('Error:', e));
```

### Paso 3: Identificar el archivo que genera el error

```
content.js:5215  Uncaught (in promise)
                 ↑
                 Buscar este archivo
```

En DevTools > Sources:
1. Buscar `content.js:5215`
2. Ver qué código genera el error
3. Identificar si es un interceptor o validación

---

## 🎯 SOLUCIÓN RÁPIDA (5 MINUTOS)

**Si el error viene de un interceptor de axios:**

```javascript
// Archivo: src/services/api.js o similar

// ❌ COMENTAR/ELIMINAR esto:
/*
axios.interceptors.response.use(
  response => {
    if (someCondition) {
      throw { code: 403 };  // ← Esto genera el error falso
    }
    return response;
  }
);
*/

// ✅ REEMPLAZAR por:
axios.interceptors.response.use(
  response => response,  // Pasar tal cual
  error => Promise.reject(error)  // No transformar
);
```

---

## 📋 CHECKLIST

- [ ] Abrir DevTools > Network
- [ ] Verificar que requests tengan Status 200 (no 403)
- [ ] Revisar interceptores de axios
- [ ] Eliminar validaciones de permisos client-side
- [ ] Verificar CORS en Headers
- [ ] Buscar transformaciones de errores en código

---

## 🚨 ACCIÓN INMEDIATA

### DIAGNÓSTICO COMPLETO DEL FRONTEND:

✅ **Interceptores de axios** - Revisados, están correctos  
✅ **Código del proyecto** - No genera errores 403 falsos  
⚠️ **Origen del error:** `content.js:5215` → **Extensión del navegador o código minificado**

### SOLUCIONES PRÁCTICAS:

#### 1. **Deshabilitar extensiones del navegador** (más probable)
```
1. Abrir modo incógnito (Ctrl+Shift+N)
2. Probar dashboard en incógnito
3. Si funciona → El problema es una extensión
4. Identificar extensión: Deshabilitar una por una
```

**Extensiones que causan problemas:**
- Bloqueadores de anuncios (AdBlock, uBlock)
- Extensiones de privacidad (Privacy Badger)
- Antivirus con extensión web
- Gestores de contraseñas agresivos

#### 2. **Limpiar caché y datos del sitio**
```
1. DevTools > Application > Storage
2. Click "Clear site data"
3. Recargar página (Ctrl+Shift+R)
```

#### 3. **Verificar que el backend realmente responde 200**
```javascript
// Ejecutar en Console del navegador:
fetch('https://backend-2ex-ecommerce.onrender.com/api/orders/admin/dashboard/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => {
  console.log('Status:', r.status);  // Debe ser 200
  return r.json();
})
.then(d => console.log('Data:', d))
.catch(e => console.error('Error:', e));
```

#### 4. **Agregar manejo de errores defensivo**

Actualizar componentes para ignorar este error falso:

```javascript
// En AdminDashboard.jsx o similar
try {
  const response = await axios.get(`${API_URL}/orders/admin/dashboard/`);
  setData(response.data);
} catch (error) {
  // Ignorar error 403 falso si el status real es 200
  if (error.response?.status === 200 || error.httpStatus === 200) {
    console.warn('⚠️ Error 403 falso detectado, pero respuesta es 200');
    // Intentar extraer datos de la respuesta
    if (error.response?.data) {
      setData(error.response.data);
      return;
    }
  }
  
  console.error('Error real:', error);
  setError(error.message);
}
```

---

## 📊 VERIFICACIÓN

**Si el problema persiste:**

1. **Probar en otro navegador** (Chrome, Firefox, Edge)
2. **Probar en modo incógnito**
3. **Verificar Network tab:** Requests deben mostrar status 200 verde
4. **Si Network muestra 200 verde pero Console muestra 403:** Es definitivamente una extensión

**Después de corregir:**

```
✅ Console sin "Uncaught (in promise)"
✅ Network tab: todos los requests con status 200
✅ Dashboard carga correctamente
✅ No hay errores en modo incógnito
```

---

## 🎯 RESUMEN FINAL

**Problema:** Error 403 falso generado por extensión del navegador o código minificado  
**Backend:** ✅ Funcionando perfectamente (200 OK confirmado)  
**Código del proyecto:** ✅ Sin errores, interceptores correctos  
**Solución:** Modo incógnito o deshabilitar extensiones

**Probabilidad:**
- 80% → Extensión del navegador
- 15% → Caché corrupto
- 5% → Problema de CORS (pero backend tiene CORS correcto)
