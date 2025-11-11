# 🔍 TEST DE LOGIN CON LOGGING EXTENSIVO

## ✅ Cambios Aplicados

Se han agregado **logs detallados** en todo el flujo de autenticación para diagnosticar el error 401:

### Archivos Modificados:
1. ✅ `src/services/api.js` - authService.login con limpieza de espacios
2. ✅ `src/contexts/AuthContext.jsx` - Login context con 12 pasos logueados
3. ✅ `src/pages/auth/Login.jsx` - Formulario con 12 pasos logueados
4. ✅ `src/config/api.js` - Interceptores axios con request/response logging

### Información que se Loguea:
- ✅ Credenciales recibidas (username visible, password oculto)
- ✅ Longitud de strings (username y password)
- ✅ Detección de espacios en blanco
- ✅ Credenciales después de `.trim()`
- ✅ URL completa de la petición
- ✅ Headers enviados
- ✅ Status code de respuesta
- ✅ Tokens recibidos (si success)
- ✅ Errores detallados (si falla)
- ✅ Datos del usuario obtenidos (`is_staff`, `role`)

---

## 🧪 Instrucciones de Testing

### Paso 1: Abrir la Consola del Navegador
1. Abre tu navegador (Chrome/Edge/Firefox)
2. Ve a tu aplicación Vercel: `https://web-2ex-qo3ksddz3-vazquescamila121-7209s-projects.vercel.app`
3. Presiona **F12** para abrir DevTools
4. Ve a la pestaña **Console** (Consola)

### Paso 2: Limpiar la Consola
- Click derecho en la consola → "Clear console" (Limpiar consola)
- O presiona **Ctrl + L**

### Paso 3: Intentar Login
Prueba con estas credenciales:

#### Opción A: Admin
```
Username: admin
Password: admin123
```

#### Opción B: Cliente
```
Username: juan_cliente
Password: juan123
```

### Paso 4: Ver los Logs en la Consola

Deberías ver una secuencia de logs como esta:

```
🔷 [LOGIN 1] Formulario enviado
🔷 [LOGIN 2] Datos del formulario: {username: "admin", hasPassword: true, ...}
🔷 [LOGIN 3] Llamando a login() del AuthContext...

🔷 [AUTHCONTEXT 1] Iniciando login...
🔷 [AUTHCONTEXT 2] Credenciales: {username: "admin", hasPassword: true}
🔷 [AUTHCONTEXT 3] Llamando a authService.login...

🔷 [1] LOGIN REQUEST - Credenciales recibidas: {username: "admin", ...}
🔷 [2] LOGIN REQUEST - Credenciales limpias: {username: "admin", ...}

🔷 [AXIOS REQUEST] {method: "POST", url: "token/", fullURL: "http://98.92.49.243/api/token/", ...}
```

#### Si el Login es Exitoso (200 OK):
```
✅ [AXIOS RESPONSE] {status: 200, statusText: "OK", ...}
✅ [3] LOGIN SUCCESS - Respuesta recibida: {hasAccess: true, hasRefresh: true}

🔷 [AUTHCONTEXT 4] Tokens recibidos: {hasAccess: true, hasRefresh: true}
🔷 [AUTHCONTEXT 5] Tokens guardados en localStorage
🔷 [AUTHCONTEXT 6] Obteniendo información del usuario...

✅ [AXIOS RESPONSE] {status: 200, statusText: "OK", ...}
🔍 [AUTHCONTEXT 7] DEBUG - Datos del usuario recibidos: {id: 1, username: "admin", ...}
🔍 [AUTHCONTEXT 8] DEBUG - is_staff: true
✅ [AUTHCONTEXT 12] Login completado exitosamente

✅ [LOGIN 9] Usuario es ADMIN - Redirigiendo a /admin/dashboard
```

#### Si el Login Falla (401 Unauthorized):
```
❌ [AXIOS RESPONSE ERROR] {
  status: 401,
  statusText: "Unauthorized",
  url: "token/",
  method: "POST",
  data: {detail: "No active account found with the given credentials"}
}

❌ [4] LOGIN ERROR: {
  status: 401,
  detail: "No active account found with the given credentials"
}

❌ [AUTHCONTEXT ERROR] Error en login: {
  message: "Request failed with status code 401",
  status: 401,
  detail: "No active account found with the given credentials"
}

⚠️ [LOGIN 11] Login falló: Error en el inicio de sesión
```

---

## 🔍 Diagnóstico de Problemas

### Problema 1: Error 401 - "No active account found"
**Causa posible:**
- Username o password incorrectos
- Espacios en blanco adicionales (el código ahora los limpia con `.trim()`)
- Usuario desactivado en el backend

**Verificar en logs:**
```javascript
🔷 [1] LOGIN REQUEST - Credenciales recibidas: {
  username: "admin",
  usernameLength: 5,       // ← Debe ser 5 para "admin"
  passwordLength: 8,       // ← Debe ser 8 para "admin123"
  usernameHasSpaces: false, // ← Debe ser false
  passwordHasSpaces: false  // ← Debe ser false
}
```

**Solución:**
- Verificar que `usernameLength` y `passwordLength` sean correctos
- Si hay espacios, el código los limpiará automáticamente
- Si sigue fallando, el problema está en el backend (usuario inactivo o password incorrecto)

---

### Problema 2: Error de CORS
**Síntomas en logs:**
```
❌ [AXIOS RESPONSE ERROR] {
  message: "Network Error"
}
```

**Solución:**
Ver la guía anterior sobre CORS - el backend debe incluir tu dominio de Vercel en `CORS_ALLOWED_ORIGINS`

---

### Problema 3: Error de Red (ERR_CONNECTION_REFUSED)
**Síntomas en logs:**
```
❌ [AXIOS REQUEST ERROR] Error: Network Error
```

**Solución:**
- Verificar que la URL sea correcta: `http://98.92.49.243/api`
- Verificar que el backend esté funcionando
- Verificar que no haya problemas de red/firewall

---

### Problema 4: Error 403 - Forbidden
**Causa:** CSRF o problema de permisos

**Solución:**
- JWT no requiere CSRF token
- Verificar que CORS esté configurado correctamente

---

## 📸 Captura de Logs

Si necesitas ayuda, copia **TODOS** los logs de la consola:

1. Click derecho en la consola
2. "Save as..." o selecciona todo y copia
3. Pega en un archivo de texto
4. Busca especialmente los logs con ❌ (errores)

---

## 🎯 Información Clave a Buscar

### En caso de error 401, verifica:

1. **¿Qué username se está enviando?**
   ```
   🔷 [2] LOGIN REQUEST - Credenciales limpias: {
     username: "???"  ← ¿Es exactamente "admin" o "juan_cliente"?
   }
   ```

2. **¿Cuál es la URL del backend?**
   ```
   🔷 [AXIOS REQUEST] {
     fullURL: "???"  ← ¿Es "http://98.92.49.243/api/token/"?
   }
   ```

3. **¿Qué responde el backend?**
   ```
   ❌ [AXIOS RESPONSE ERROR] {
     data: {detail: "???"}  ← Mensaje exacto del backend
   }
   ```

4. **¿Hay espacios en las credenciales?**
   ```
   🔷 [1] LOGIN REQUEST - Credenciales recibidas: {
     usernameHasSpaces: ???,  ← Debe ser false
     passwordHasSpaces: ???   ← Debe ser false
   }
   ```

---

## ✅ Próximos Pasos Después del Testing

1. **Si Login Funciona:** 
   - ✅ Puedes remover los logs o dejarlos para debugging futuro
   - ✅ Continuar con las demás funcionalidades

2. **Si Login Falla con 401:**
   - ❌ Verificar backend con: `cd backend_2ex && python test_login.py`
   - ❌ Verificar credenciales en `CREDENCIALES_ACCESO.txt`
   - ❌ Copiar logs completos para análisis

3. **Si hay Error de CORS:**
   - ❌ Necesitas actualizar CORS en el backend
   - ❌ Ver `README_DESPLIEGUE.md` sección CORS

4. **Si hay Error de Red:**
   - ❌ Verificar que el backend esté corriendo
   - ❌ Verificar la URL en `.env.production`

---

## 🚀 Testing Rápido

Para testing rápido, usa los **botones de autocompletar** en el formulario de login (solo visibles en desarrollo):

- 👑 **Admin** - Llena con `admin` / `admin123`
- 👤 **Juan (Cliente)** - Llena con `juan_cliente` / `juan123`
- 👤 **Laura (Cliente)** - Llena con `laura_cliente` / `laura123`
- 👔 **Carlos (Manager)** - Llena con `carlos_manager` / `carlos123`

---

## 📞 Soporte

Si después de revisar los logs el problema persiste, comparte:

1. Screenshot de la consola con todos los logs
2. La URL que estás usando
3. Las credenciales que estás probando
4. Si el backend está en AWS o localhost

**Los logs ahora muestran EXACTAMENTE qué se está enviando al backend, así que podemos identificar el problema con precisión.**
