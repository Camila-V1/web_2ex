# 🔍 DEBUG: Admin No Redirige - Logs Agregados

## ✅ Logs de Debug Agregados

He agregado logs de debug detallados en el código para identificar exactamente dónde está el problema.

---

## 🧪 Pasos para Diagnosticar

### Paso 1: Limpiar localStorage

Abre la consola del navegador (F12) → Pestaña **Console** y ejecuta:

```javascript
localStorage.clear();
console.log('✅ localStorage limpiado');
```

### Paso 2: Recargar la página

Presiona `F5` para recargar.

### Paso 3: Abrir DevTools antes de hacer login

1. Presiona `F12` para abrir DevTools
2. Ve a la pestaña **Console**
3. Limpia la consola (botón 🚫 o `Ctrl+L`)

### Paso 4: Hacer login

1. Ingresa:
   - Username: `admin`
   - Password: `admin123`
2. Click en "Iniciar Sesión"

### Paso 5: Revisar los logs en la consola

Deberías ver algo como esto:

```
🔍 DEBUG - Datos del usuario recibidos: { id: 1, username: "admin", email: "admin@gmail.com", is_staff: true, is_superuser: true }
🔍 DEBUG - is_staff: true
🔍 DEBUG - is_superuser: true
🔍 DEBUG - Resultado del login: { success: true, user: { ... } }
🔍 DEBUG - result.success: true
🔍 DEBUG - result.user: { id: 1, username: "admin", ... }
🔍 DEBUG - result.user?.is_staff: true
✅ Usuario es ADMIN - Redirigiendo a /admin/dashboard
```

---

## 📊 Posibles Escenarios

### ✅ Escenario 1: `is_staff: true` pero no redirige

**Logs esperados:**
```
🔍 DEBUG - is_staff: true
🔍 DEBUG - result.user?.is_staff: true
✅ Usuario es ADMIN - Redirigiendo a /admin/dashboard
```

**Si ves esto pero AÚN redirige a /products:**
- Problema: Hay código adicional que está haciendo otra redirección
- Solución: Buscar en el código si hay un `useEffect` o similar que esté redirigiendo después del login

---

### ❌ Escenario 2: `is_staff` es `undefined` o `false`

**Logs esperados:**
```
🔍 DEBUG - Datos del usuario recibidos: { id: 1, username: "admin", email: "admin@gmail.com" }
🔍 DEBUG - is_staff: undefined  ← ❌ PROBLEMA AQUÍ
🔍 DEBUG - result.user?.is_staff: undefined
ℹ️ Usuario regular - Redirigiendo a /products
```

**Si ves esto:**
- Problema: El endpoint `/api/users/profile/` NO está devolviendo el campo `is_staff`
- Solución: Revisar el backend - el serializer de `/api/users/profile/` debe incluir `is_staff`

**Cómo verificar en el backend:**

```bash
# En otra terminal, mientras el backend está corriendo:
curl -H "Authorization: Bearer <tu_token>" http://localhost:8000/api/users/profile/
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@gmail.com",
  "is_staff": true,  ← ✅ DEBE ESTAR PRESENTE
  "is_superuser": true
}
```

**Si `is_staff` NO aparece en la respuesta:**
El backend tiene un problema en el serializer. Debe incluir el campo `is_staff`.

---

### ❌ Escenario 3: Error al llamar `/api/users/profile/`

**Logs esperados:**
```
❌ Error en login: AxiosError { ... }
```

**Si ves esto:**
- Problema: El endpoint `/api/users/profile/` está devolviendo un error
- Solución: Revisar los logs del backend para ver qué error está devolviendo

---

## 🔧 Verificación Manual del Endpoint

Ejecuta esto en la consola **DESPUÉS** de hacer login:

```javascript
async function verificarProfile() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('❌ No hay token');
    return;
  }
  
  console.log('🔑 Token:', token.substring(0, 30) + '...');
  
  try {
    const response = await fetch('http://localhost:8000/api/users/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      console.log('\n📊 Campos importantes:');
      console.log('  username:', data.username);
      console.log('  email:', data.email);
      console.log('  is_staff:', data.is_staff, '←', data.is_staff ? '✅ ES ADMIN' : '❌ NO ES ADMIN');
      console.log('  is_superuser:', data.is_superuser);
      
      if (!data.is_staff) {
        console.warn('\n⚠️ PROBLEMA: is_staff es false o undefined');
        console.warn('El backend debe devolver is_staff: true para usuarios admin');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

verificarProfile();
```

---

## 📋 Checklist de Diagnóstico

Después de hacer login, verifica:

### En la consola del navegador:
- [ ] Ves el log: `🔍 DEBUG - Datos del usuario recibidos:`
- [ ] Ves el log: `🔍 DEBUG - is_staff:` con un valor (true/false/undefined)
- [ ] Ves el log: `🔍 DEBUG - result.user?.is_staff:` con un valor
- [ ] Ves uno de estos logs:
  - [ ] `✅ Usuario es ADMIN - Redirigiendo a /admin/dashboard` ← Debería aparecer este
  - [ ] `ℹ️ Usuario regular - Redirigiendo a /products`

### En la pestaña Network de DevTools:
- [ ] Ves la petición: `POST /api/token/` con Status 200
- [ ] Ves la petición: `GET /api/users/profile/` con Status 200
- [ ] Click en `GET /api/users/profile/` → Preview/Response → Verificar que incluye `is_staff: true`

---

## 🎯 Posibles Problemas y Soluciones

### Problema 1: `is_staff` es `undefined` en la respuesta

**Causa:** El serializer del backend no incluye el campo `is_staff`.

**Solución Backend:**
```python
# En users/serializers.py o donde esté el serializer de profile
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_staff', 'is_superuser', 'is_active']  # ← Asegurar que is_staff está aquí
```

---

### Problema 2: El token no se está enviando correctamente

**Verificar en Network → Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...  ← Debe estar presente
```

**Si no está:**
Revisar `src/config/api.js` y asegurar que el interceptor está agregando el header.

---

### Problema 3: CORS está bloqueando la petición

**Síntomas en consola:**
```
Access to fetch at 'http://localhost:8000/api/users/profile/' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solución Backend:**
Verificar que CORS está configurado correctamente en `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

---

## 📞 Qué Reportar

Después de seguir estos pasos, copia y pega **todos los logs de la consola** que veas después de hacer login.

Específicamente necesito ver:
1. Los logs que empiezan con `🔍 DEBUG`
2. La respuesta completa de `GET /api/users/profile/` (de la pestaña Network)
3. Si hay algún error en rojo

Con esa información podré identificar exactamente dónde está el problema.

---

## 🚀 Resultado Esperado

Si todo funciona correctamente, deberías ver:

```
🔍 DEBUG - Datos del usuario recibidos: {
  id: 1,
  username: "admin",
  email: "admin@gmail.com",
  first_name: "",
  last_name: "",
  is_staff: true,
  is_superuser: true,
  is_active: true
}
🔍 DEBUG - is_staff: true
🔍 DEBUG - is_superuser: true
🔍 DEBUG - Resultado del login: { success: true, user: { ... } }
🔍 DEBUG - result.success: true
🔍 DEBUG - result.user: { id: 1, username: "admin", ... }
🔍 DEBUG - result.user?.is_staff: true
✅ Usuario es ADMIN - Redirigiendo a /admin/dashboard
```

Y la URL debe cambiar a: `http://localhost:5173/admin/dashboard`

---

**Ejecuta estos pasos y comparte los logs que veas en la consola.** 🔍
