# FIX: Usuario Admin No Redirige al Dashboard Admin

## 🐛 Problema Identificado

El usuario con `is_staff: True` no era redirigido al dashboard admin después del login.

### Causa Raíz
El endpoint de Django Simple JWT (`/api/token/`) **solo devuelve tokens JWT** pero **no devuelve información del usuario** (como `username`, `email`, `is_staff`, etc.).

El frontend guardaba solo el username pero no el flag `is_staff`, por lo que la validación en `Login.jsx` fallaba:

```javascript
if (user.is_staff) {  // ❌ user.is_staff era undefined
  navigate('/admin/dashboard');
}
```

---

## ✅ Solución Implementada (Frontend)

### 1. **Modificado `src/services/api.js`**

Agregado nuevo método para obtener información del usuario:

```javascript
export const authService = {
  // ... métodos existentes ...
  
  // NUEVO: Obtener información del usuario actual
  getCurrentUser: async () => {
    const response = await api.get('users/me/');
    return response.data;
  },
  
  // ACTUALIZADO: logout ahora limpia también 'user'
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');  // ✅ Agregado
  },
};
```

### 2. **Modificado `src/contexts/AuthContext.jsx`**

#### A) Actualizado `login()` para obtener datos del usuario:

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

#### B) Actualizado `useEffect` para cargar usuario desde localStorage:

```javascript
useEffect(() => {
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      try {
        if (storedUser) {
          // ✅ Cargar usuario guardado
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user: JSON.parse(storedUser) },
          });
        } else {
          // ✅ Si no hay usuario guardado, obtenerlo del backend
          const userData = await authService.getCurrentUser();
          localStorage.setItem('user', JSON.stringify(userData));
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user: userData },
          });
        }
      } catch (error) {
        // Token inválido, limpiar todo
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
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

## 🔧 Requerimientos del Backend

Para que esto funcione, el **backend DEBE tener** un endpoint que devuelva la información del usuario actual:

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
  "is_staff": true,
  "is_superuser": true,
  "is_active": true
}
```

---

## 📋 Implementación en Backend Django

Si el endpoint `/api/users/me/` no existe, agrégalo así:

### 1. **En `users/views.py` (o donde tengas las vistas de usuarios):**

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import UserSerializer  # Asegúrate de tener este serializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Devuelve la información del usuario autenticado actual
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
```

### 2. **En `users/serializers.py`:**

```python
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_staff', 'is_superuser', 'is_active']
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'is_active']
```

### 3. **En `users/urls.py` (o en tu archivo principal de URLs):**

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... otras rutas ...
    path('users/me/', views.current_user, name='current-user'),
]
```

O si usas ViewSet:

```python
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

class UserViewSet(ModelViewSet):
    # ... código existente ...
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Devuelve el usuario actual
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
```

---

## 🧪 Cómo Probar

### Paso 1: Verificar que el endpoint existe

```bash
# Con el backend corriendo:
curl -H "Authorization: Bearer <tu_token>" http://localhost:8000/api/users/me/
```

Deberías ver:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@gmail.com",
  "is_staff": true,
  "is_superuser": true,
  ...
}
```

### Paso 2: Probar en el frontend

1. **Abrir DevTools** (F12) → Pestaña **Console**
2. **Ir a** `http://localhost:5173/login`
3. **Iniciar sesión** con usuario admin
4. **En la consola**, ver que se ejecuta:
   ```
   GET http://localhost:8000/api/users/me/
   ```
5. **Verificar localStorage**:
   ```javascript
   // En la consola del navegador:
   JSON.parse(localStorage.getItem('user'))
   ```
   
   Deberías ver:
   ```javascript
   {
     id: 1,
     username: "admin",
     email: "admin@gmail.com",
     is_staff: true,  // ✅ Este campo debe estar presente
     is_superuser: true
   }
   ```

### Paso 3: Verificar redirección

1. **Login con admin** → Debe redirigir a `/admin/dashboard` ✅
2. **Login con usuario regular** → Debe redirigir a `/products` ✅

---

## 🔍 Debugging

### Si el endpoint `/api/users/me/` no existe:

**Error en consola:**
```
GET http://localhost:8000/api/users/me/ 404 (Not Found)
```

**Solución:** Implementa el endpoint en el backend como se muestra arriba.

---

### Si el endpoint existe pero no devuelve `is_staff`:

**En la consola del navegador:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.is_staff);  // undefined ❌
```

**Solución:** Asegúrate de que el `UserSerializer` incluya el campo `is_staff`:

```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [..., 'is_staff', 'is_superuser']  # ✅ Agregar estos campos
```

---

### Si después del login sigue redirigiendo mal:

**Debug en `Login.jsx`:**

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const result = await login(formData);
    console.log('Login result:', result);  // ✅ Agregar esto
    console.log('User data:', result.user);  // ✅ Ver userData
    console.log('is_staff:', result.user?.is_staff);  // ✅ Ver is_staff
    
    if (result.success) {
      if (result.user && result.user.is_staff) {
        console.log('Redirigiendo a admin dashboard');  // ✅
        navigate('/admin/dashboard');
      } else {
        console.log('Redirigiendo a products');  // ✅
        navigate('/products');
      }
    }
  } catch (err) {
    console.error('Error en login:', err);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📝 Resumen del Flujo Completo

### Antes (❌ No funcionaba):

```
1. Usuario hace login
2. Backend devuelve solo tokens (access, refresh)
3. Frontend guarda tokens pero NO guarda is_staff
4. Login.jsx intenta acceder a user.is_staff → undefined
5. Redirige a /products (default)
```

### Ahora (✅ Funciona):

```
1. Usuario hace login
2. Backend devuelve tokens (access, refresh)
3. Frontend guarda tokens
4. ✅ Frontend hace segunda petición a /api/users/me/
5. ✅ Backend devuelve userData completo con is_staff
6. ✅ Frontend guarda userData en localStorage
7. Login.jsx accede a user.is_staff → true/false
8. ✅ Redirige correctamente:
   - is_staff: true → /admin/dashboard
   - is_staff: false → /products
```

---

## ✅ Checklist de Verificación

Para el **Backend**:
- [ ] Existe endpoint `GET /api/users/me/`
- [ ] Endpoint requiere autenticación (`IsAuthenticated`)
- [ ] Endpoint devuelve campo `is_staff`
- [ ] Endpoint devuelve campo `is_superuser`
- [ ] Serializer incluye todos los campos necesarios

Para el **Frontend**:
- [x] `authService.getCurrentUser()` implementado
- [x] `login()` obtiene userData después de los tokens
- [x] `useEffect` carga userData desde localStorage
- [x] `logout()` limpia el campo 'user' de localStorage
- [x] `Login.jsx` verifica `result.user.is_staff`

---

## 🎯 Resultado Esperado

Después de aplicar estos cambios:

1. **Usuario Admin** (`is_staff: true`)
   - Login → Automáticamente a `/admin/dashboard` ✅
   - Ve KPIs, productos top, órdenes, etc. ✅

2. **Usuario Regular** (`is_staff: false`)
   - Login → Automáticamente a `/products` ✅
   - Ve catálogo de productos ✅

3. **Persistencia**
   - Al recargar la página, el usuario permanece logueado ✅
   - El tipo de usuario (admin/regular) se mantiene ✅

---

**IMPORTANTE:** Coordina con el equipo de backend para asegurarte de que el endpoint `/api/users/me/` esté implementado correctamente antes de probar en el frontend.
