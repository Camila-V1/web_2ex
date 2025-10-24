# 🎯 RESUMEN: Fix Admin No Redirige al Dashboard

## 🐛 Problema Reportado

Usuario con credenciales:
- **Username:** `admin`
- **Password:** `admin123`
- **is_staff:** `True` (verificado en backend)
- **is_superuser:** `True`

❌ **Resultado:** Después del login, fue redirigido a `/products` en lugar de `/admin/dashboard`

---

## 🔍 Causa Raíz Identificada

El endpoint de Django Simple JWT (`POST /api/token/`) **solo devuelve tokens JWT**:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLC...",
  "refresh": "eyJ0eXAiOiJKV1QiLC..."
}
```

**NO devuelve información del usuario** como `username`, `email`, `is_staff`, etc.

El frontend guardaba solo el username pero **no el flag `is_staff`**, por lo que la validación en `Login.jsx` siempre fallaba:

```javascript
if (result.user && result.user.is_staff) {  // ❌ user.is_staff era undefined
  navigate('/admin/dashboard');
} else {
  navigate('/products');  // ❌ Siempre ejecutaba este path
}
```

---

## ✅ Solución Implementada (Frontend)

### 1. **Modificado `src/services/api.js`**

```javascript
export const authService = {
  // ... métodos existentes ...
  
  // ✅ NUEVO: Obtener información del usuario actual
  getCurrentUser: async () => {
    const response = await api.get('users/me/');
    return response.data;
  },
  
  // ✅ ACTUALIZADO: logout ahora limpia también 'user'
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');  // ← Nuevo
  },
};
```

### 2. **Modificado `src/contexts/AuthContext.jsx`**

#### A) Función `login()` actualizada:

```javascript
const login = async (credentials) => {
  try {
    // 1. Obtener tokens
    const response = await authService.login(credentials);
    const { access, refresh } = response;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // 2. ✅ NUEVO: Obtener información del usuario (incluyendo is_staff)
    const userData = await authService.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(userData));

    dispatch({
      type: authActions.LOGIN_SUCCESS,
      payload: { user: userData },  // ✅ Ahora incluye is_staff
    });

    return { success: true, user: userData };  // ✅ Devuelve userData completo
  } catch (error) {
    // ... manejo de errores
  }
};
```

#### B) `useEffect` actualizado para persistencia:

```javascript
useEffect(() => {
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      try {
        if (storedUser) {
          // ✅ Cargar usuario guardado con is_staff
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user: JSON.parse(storedUser) },
          });
        } else {
          // ✅ Si no hay usuario, obtenerlo del backend
          const userData = await authService.getCurrentUser();
          localStorage.setItem('user', JSON.stringify(userData));
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user: userData },
          });
        }
      } catch (error) {
        // Token inválido, limpiar todo
        localStorage.clear();
        dispatch({ type: authActions.SET_LOADING, payload: false });
      }
    } else {
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  };

  checkAuthStatus();
}, []);
```

---

## 🔧 Requerimiento del Backend

Para que la solución funcione, el **backend DEBE implementar** el siguiente endpoint:

### Endpoint Requerido:

```
GET /api/users/me/
Authorization: Bearer <access_token>
```

### Respuesta Esperada:

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@gmail.com",
  "first_name": "Admin",
  "last_name": "User",
  "is_staff": true,      ← ✅ CRÍTICO
  "is_superuser": true,  ← ✅ CRÍTICO
  "is_active": true
}
```

---

## 📋 Implementación Rápida en Backend Django

### Opción A: Con función `api_view`

```python
# En users/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers

class CurrentUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    is_staff = serializers.BooleanField()
    is_superuser = serializers.BooleanField()
    is_active = serializers.BooleanField()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data)
```

```python
# En urls.py
from users.views import current_user

urlpatterns = [
    # ... rutas existentes ...
    path('api/users/me/', current_user, name='current-user'),
]
```

### Opción B: Con ViewSet (si ya usas ViewSet para usuarios)

```python
from rest_framework.decorators import action

class UserViewSet(ModelViewSet):
    # ... código existente ...
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
```

---

## 🧪 Pasos para Probar

### Paso 1: Verificar que el endpoint existe

En la terminal del backend:

```bash
python manage.py runserver
```

En otra terminal o con Postman:

```bash
# Primero obtén un token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Copia el token "access" y úsalo aquí:
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <tu_token_aqui>"
```

**Resultado esperado:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@gmail.com",
  "is_staff": true,
  "is_superuser": true
}
```

### Paso 2: Probar en el frontend

1. **Limpia el localStorage:**
   - Abre DevTools (F12) → Console
   - Ejecuta: `localStorage.clear()`
   - Recarga la página (F5)

2. **Haz login:**
   - Username: `admin`
   - Password: `admin123`

3. **Verifica la redirección:**
   - ✅ Debe redirigir a: `http://localhost:5173/admin/dashboard`
   - ✅ Debe mostrar el dashboard con KPIs

### Paso 3: Verificar en DevTools

Abre **Network** en DevTools y verifica que después del login aparezcan **2 peticiones**:

1. ✅ `POST /api/token/` → Status 200 → Devuelve tokens
2. ✅ `GET /api/users/me/` → Status 200 → Devuelve userData con `is_staff: true`

En la **Console**, verifica el localStorage:

```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario:', user);
console.log('is_staff:', user.is_staff);  // Debe ser true
```

---

## 📊 Flujo Completo (Antes vs Ahora)

### ❌ Antes (No funcionaba):

```
1. Usuario hace login
2. Backend devuelve solo tokens (access, refresh)
3. Frontend guarda tokens
4. Frontend crea objeto user con solo { username: 'admin' }
5. user.is_staff → undefined
6. Login.jsx redirige a /products (default)
```

### ✅ Ahora (Funciona):

```
1. Usuario hace login
2. Backend devuelve tokens (access, refresh)
3. Frontend guarda tokens
4. Frontend hace GET /api/users/me/
5. Backend devuelve { id, username, email, is_staff: true, ... }
6. Frontend guarda userData completo en localStorage
7. Login.jsx accede a user.is_staff → true
8. Redirige a /admin/dashboard ✅
```

---

## 📁 Archivos Creados/Modificados

### Frontend (✅ Completados):

1. **`src/services/api.js`**
   - Agregado: `getCurrentUser()`
   - Actualizado: `logout()`

2. **`src/contexts/AuthContext.jsx`**
   - Actualizado: `login()` obtiene userData después de tokens
   - Actualizado: `useEffect` carga userData con persistencia

3. **`src/pages/auth/Login.jsx`**
   - Ya tenía la lógica de redirección condicional

### Documentación:

1. **`FIX_ADMIN_REDIRECT.md`** - Explicación técnica completa
2. **`SOLUCION_RAPIDA_ADMIN.md`** - Guía paso a paso para probar
3. **`test_user_endpoint.js`** - Script de prueba para consola
4. **`RESUMEN_FIX_ADMIN.md`** - Este archivo (resumen ejecutivo)

---

## ✅ Checklist de Verificación

### Backend:
- [ ] Implementado `GET /api/users/me/`
- [ ] Endpoint requiere autenticación (`IsAuthenticated`)
- [ ] Endpoint devuelve campo `is_staff`
- [ ] Endpoint devuelve campo `is_superuser`
- [ ] Probado con curl/Postman (Status 200)

### Frontend (ya listo ✅):
- [x] `authService.getCurrentUser()` implementado
- [x] `login()` obtiene userData con `is_staff`
- [x] `useEffect` carga userData desde localStorage
- [x] `logout()` limpia 'user' de localStorage
- [x] `Login.jsx` verifica `result.user.is_staff`

### Prueba Manual:
- [ ] `localStorage.clear()` ejecutado
- [ ] Login con admin realizado
- [ ] URL muestra `/admin/dashboard`
- [ ] Dashboard visible con 4 KPIs
- [ ] DevTools muestra `GET /api/users/me/` con Status 200
- [ ] localStorage contiene `user` con `is_staff: true`

---

## 🎯 Resultado Esperado Final

### Usuario Admin (`is_staff: true`):
1. **Login** → Redirige automáticamente a `/admin/dashboard` ✅
2. **Ve Dashboard Admin** con:
   - 4 KPIs (Ventas, Órdenes, Usuarios, Productos)
   - Top 10 productos más vendidos
   - Órdenes por estado (gráfico)
   - Alertas de stock bajo
   - Órdenes recientes
   - 3 botones de acciones rápidas

3. **En el Header** → Ve enlace "Dashboard Admin" ✅

### Usuario Regular (`is_staff: false`):
1. **Login** → Redirige a `/products` ✅
2. **No ve** enlace "Dashboard Admin" en el header ✅
3. **Si intenta acceder** a `/admin/dashboard` → Ve "Acceso Denegado" ✅

---

## 🆘 Si Algo Falla

### Error: "Status 404" en `/api/users/me/`

**Causa:** El endpoint no existe.

**Solución:** Implementa el endpoint en el backend (ver sección arriba).

### Error: "Status 401" en `/api/users/me/`

**Causa:** Token inválido o expirado.

**Solución:**
```javascript
localStorage.clear();
// Recarga la página y haz login nuevamente
```

### Error: Endpoint existe pero no devuelve `is_staff`

**Verificar en consola:**
```javascript
fetch('http://localhost:8000/api/users/me/', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
})
.then(r => r.json())
.then(d => console.log('Campos:', Object.keys(d)));
```

Si `is_staff` no aparece, el serializer en el backend está incompleto.

### Aún redirige a `/products` después de implementar todo

**Debug detallado:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('📊 Debug completo:');
console.log('user existe:', !!user);
console.log('user.is_staff:', user?.is_staff);
console.log('typeof is_staff:', typeof user?.is_staff);

if (user?.is_staff === true) {
  console.log('✅ DEBERÍA ir a /admin/dashboard');
} else {
  console.log('❌ Irá a /products porque is_staff no es true');
  console.log('Valor actual:', user?.is_staff);
}
```

---

## 📞 Contacto con Backend

**El frontend está 100% listo.** Solo necesitas que el equipo de backend implemente el endpoint `/api/users/me/`.

Puedes enviarles este mensaje:

> Hola, necesito que implementen este endpoint para que el sistema de administración funcione:
> 
> **Endpoint:** `GET /api/users/me/`  
> **Auth:** Bearer token (JWT)  
> **Response:**
> ```json
> {
>   "id": 1,
>   "username": "admin",
>   "email": "admin@gmail.com",
>   "is_staff": true,
>   "is_superuser": true
> }
> ```
> 
> Código para implementar está en: `FIX_ADMIN_REDIRECT.md`

---

**¡Una vez que el backend implemente el endpoint, el sistema funcionará perfectamente!** 🚀
