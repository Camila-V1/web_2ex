# ✅ CORRECCIÓN - Endpoint Correcto para Obtener Usuario

## 🔧 Problema Resuelto

El frontend estaba intentando llamar a `/api/users/me/` que **NO existe** en el backend.

El backend **SÍ tiene** el endpoint correcto: `/api/users/profile/`

---

## ✅ Corrección Aplicada

### Archivo modificado: `src/services/api.js`

**Antes (❌ Incorrecto):**
```javascript
getCurrentUser: async () => {
  const response = await api.get('users/me/');  // ❌ No existe
  return response.data;
},
```

**Ahora (✅ Correcto):**
```javascript
getCurrentUser: async () => {
  const response = await api.get('users/profile/');  // ✅ Existe
  return response.data;
},
```

---

## 🧪 Cómo Probar

### Paso 1: Limpiar localStorage

Abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.clear();
console.log('✅ localStorage limpiado');
```

### Paso 2: Recargar la página

Presiona `F5` para recargar la página.

### Paso 3: Hacer login con usuario admin

1. Ve a `http://localhost:5173/login`
2. Ingresa:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click en "Iniciar Sesión"

### Paso 4: Verificar redirección

**Resultado esperado:**
- ✅ La URL debe cambiar a: `http://localhost:5173/admin/dashboard`
- ✅ Debes ver el dashboard con los 4 KPIs
- ✅ Top 10 productos más vendidos
- ✅ Órdenes por estado
- ✅ Órdenes recientes

---

## 🔍 Verificación en DevTools

### Opción A: Verificar en Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Haz login con admin
4. Deberías ver **2 peticiones**:
   - ✅ `POST /api/token/` → Status 200
   - ✅ `GET /api/users/profile/` → Status 200 (ya no `/api/users/me/`)

### Opción B: Verificar en Console

Después del login, ejecuta en la consola:

```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('👤 Usuario:', user);
console.log('📊 is_staff:', user.is_staff);
console.log('🔐 is_superuser:', user.is_superuser);

if (user.is_staff) {
  console.log('✅ Este usuario ES administrador - Debe estar en /admin/dashboard');
} else {
  console.log('⚠️ Este usuario NO es administrador - Debe estar en /products');
}
```

---

## 📊 Flujo Correcto Ahora

```
1. Usuario hace login con admin/admin123
2. Frontend hace POST /api/token/
3. Backend devuelve { access: "...", refresh: "..." }
4. Frontend guarda tokens
5. ✅ Frontend hace GET /api/users/profile/
6. ✅ Backend devuelve { id, username, email, is_staff: true, ... }
7. ✅ Frontend guarda userData en localStorage
8. ✅ Login.jsx detecta user.is_staff === true
9. ✅ Navega a /admin/dashboard
10. ✅ Dashboard se carga correctamente
```

---

## 🎯 Resultado Esperado

### Para Usuario Admin (`is_staff: true`):

**Al hacer login:**
- ✅ Redirige automáticamente a `/admin/dashboard`
- ✅ Ve el dashboard con:
  - 4 KPIs (Ventas, Órdenes, Usuarios, Productos)
  - Top 10 productos más vendidos
  - Gráfico de órdenes por estado
  - Alertas de stock bajo (si hay)
  - Tabla de órdenes recientes
  - 3 botones de acciones rápidas

**En el header:**
- ✅ Ve el enlace "Dashboard Admin" en el menú de usuario

### Para Usuario Regular (`is_staff: false`):

**Al hacer login:**
- ✅ Redirige a `/products`

**Si intenta acceder a `/admin/dashboard`:**
- ✅ Ve mensaje "Acceso Denegado"

---

## 🆘 Si Aún No Funciona

### Verificar que el endpoint `/api/users/profile/` responde correctamente:

```javascript
// Ejecutar en consola del navegador DESPUÉS de hacer login
async function testProfileEndpoint() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('❌ No hay token. Haz login primero.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/users/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint /api/users/profile/ funciona!');
      console.log('Datos recibidos:', data);
      console.log('\n📊 Campos importantes:');
      console.log('  username:', data.username);
      console.log('  email:', data.email);
      console.log('  is_staff:', data.is_staff);
      console.log('  is_superuser:', data.is_superuser);
      
      if (data.is_staff) {
        console.log('\n✅ Este usuario ES administrador');
        console.log('   Debería redirigir a /admin/dashboard');
      } else {
        console.log('\n⚠️ Este usuario NO es administrador');
        console.log('   Debería redirigir a /products');
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}:`, errorText);
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

testProfileEndpoint();
```

---

## 📝 Documentos Desactualizados

Los siguientes documentos mencionaban el endpoint incorrecto `/api/users/me/`:

- ❌ `BACKEND_USER_ENDPOINT.md` - Ya no es necesario, el backend ya tiene el endpoint correcto
- ❌ `FIX_ADMIN_REDIRECT.md` - Menciona `/api/users/me/` pero debe ser `/api/users/profile/`
- ❌ `SOLUCION_RAPIDA_ADMIN.md` - Menciona `/api/users/me/` pero debe ser `/api/users/profile/`

**Nota:** Estos documentos eran para implementar un endpoint nuevo, pero como el backend ya tiene `/api/users/profile/`, simplemente se corrigió el frontend para usar el endpoint correcto.

---

## ✅ Archivo Correcto Actualizado

**Único cambio necesario:**

### `src/services/api.js`
```javascript
export const authService = {
  login: async (credentials) => {
    const response = await api.post('token/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('users/', userData);
    return response.data;
  },

  // ✅ CORRECTO: Usa /api/users/profile/
  getCurrentUser: async () => {
    const response = await api.get('users/profile/');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
```

---

## 🎊 ¡Listo!

**La corrección está aplicada.** Ahora el frontend usa el endpoint correcto `/api/users/profile/` que ya existe en el backend.

**Pasos finales:**
1. `localStorage.clear()` en la consola
2. Recarga la página (F5)
3. Login con admin/admin123
4. ✅ Deberías ver el dashboard admin

---

**Si después de limpiar localStorage y hacer login aún no funciona, ejecuta el script de verificación de arriba para diagnosticar el problema.**
