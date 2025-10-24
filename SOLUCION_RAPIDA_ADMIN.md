# 🔧 SOLUCIÓN RÁPIDA: Admin No Redirige al Dashboard

## 📋 Diagnóstico

Tu usuario tiene `is_staff: True` en el backend, pero el frontend no lo detecta porque el endpoint de login **solo devuelve tokens JWT**, no devuelve la información del usuario.

## ✅ SOLUCIÓN (Paso a Paso)

### PASO 1: Probar si el endpoint existe

1. **Abre el navegador** en `http://localhost:5173`
2. **Abre DevTools** (F12) → Pestaña **Console**
3. **Haz login** con tu usuario admin
4. **Copia y pega** este código en la consola:

```javascript
async function testUserMeEndpoint() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('❌ No hay token. Haz login primero.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/users/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint existe! Datos:', data);
      console.log('is_staff:', data.is_staff);
    } else if (response.status === 404) {
      console.error('❌ Endpoint NO existe (404) - Necesitas implementarlo en el backend');
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}

testUserMeEndpoint();
```

**Resultado esperado:**
- ✅ Si ves `Status: 200` y `is_staff: true` → **Continúa al PASO 2**
- ❌ Si ves `Status: 404` → **Continúa al PASO 1B (Implementar endpoint)**

---

### PASO 1B: Implementar el endpoint en el backend (si no existe)

**Ve a tu backend Django y agrega esto:**

#### 1. En `users/views.py` (o donde tengas las vistas de usuarios):

```python
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
    """
    Devuelve la información del usuario autenticado actual
    """
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data)
```

#### 2. En tu archivo principal de URLs (probablemente `backend_2ex/urls.py`):

```python
from users.views import current_user  # Ajusta el import según tu estructura

urlpatterns = [
    # ... tus rutas existentes ...
    path('api/users/me/', current_user, name='current-user'),
]
```

#### 3. **Reinicia el servidor Django:**

```bash
python manage.py runserver
```

#### 4. **Prueba el endpoint** con curl o Postman:

```bash
curl -H "Authorization: Bearer <tu_token>" http://localhost:8000/api/users/me/
```

**Deberías ver:**
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

---

### PASO 2: Limpiar localStorage y probar

Una vez que el endpoint `/api/users/me/` esté funcionando:

1. **Abre DevTools** (F12) → Pestaña **Console**
2. **Ejecuta estos comandos** para limpiar el localStorage:

```javascript
localStorage.clear();
console.log('✅ localStorage limpiado');
```

3. **Recarga la página** (F5)
4. **Haz login nuevamente** con usuario admin:
   - Username: `admin`
   - Password: `admin123`

---

### PASO 3: Verificar que funciona

Después del login, **deberías ver**:

1. **En la URL**: `http://localhost:5173/admin/dashboard` ✅
2. **En pantalla**: El dashboard admin con KPIs y estadísticas ✅

**Para verificar en la consola:**

```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario:', user);
console.log('is_staff:', user.is_staff);  // Debe ser true
```

---

## 🔍 Verificación Completa

### Abrir la pestaña **Network** en DevTools:

Después del login deberías ver **2 peticiones**:

1. ✅ `POST /api/token/` → Devuelve `access` y `refresh` tokens
2. ✅ `GET /api/users/me/` → Devuelve datos del usuario con `is_staff: true`

---

## ❌ Troubleshooting

### Problema 1: "Status: 404" en `/api/users/me/`

**Causa:** El endpoint no existe en el backend.

**Solución:** Implementa el endpoint como se muestra en PASO 1B.

---

### Problema 2: "Status: 401" en `/api/users/me/`

**Causa:** Token inválido o expirado.

**Solución:** 
1. Limpia localStorage: `localStorage.clear()`
2. Recarga la página
3. Haz login nuevamente

---

### Problema 3: El endpoint devuelve datos pero NO incluye `is_staff`

**Verificar en la consola:**
```javascript
fetch('http://localhost:8000/api/users/me/', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
})
.then(r => r.json())
.then(d => console.log('Campos devueltos:', Object.keys(d)));
```

**Si `is_staff` NO aparece en la lista:**

El serializer en el backend no incluye ese campo. Agrégalo:

```python
class CurrentUserSerializer(serializers.Serializer):
    # ... otros campos ...
    is_staff = serializers.BooleanField()      # ✅ Asegúrate de tener esto
    is_superuser = serializers.BooleanField()  # ✅ Y esto también
```

---

### Problema 4: Aún redirige a `/products` en vez de `/admin/dashboard`

**Debug en la consola del navegador:**

```javascript
// Ver el resultado del login
const testLogin = async () => {
  const response = await fetch('http://localhost:8000/api/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const tokens = await response.json();
  
  const userResponse = await fetch('http://localhost:8000/api/users/me/', {
    headers: { 'Authorization': `Bearer ${tokens.access}` }
  });
  const userData = await userResponse.json();
  
  console.log('Datos del usuario:', userData);
  console.log('is_staff:', userData.is_staff);
  
  if (userData.is_staff) {
    console.log('✅ DEBERÍA redirigir a /admin/dashboard');
  } else {
    console.log('❌ Redirigirá a /products porque is_staff es false');
  }
};

testLogin();
```

---

## 📝 Resumen de Cambios Realizados en Frontend

Ya implementé los siguientes cambios en el frontend:

### ✅ Archivos Modificados:

1. **`src/services/api.js`**
   - Agregado: `getCurrentUser()` método
   - Actualizado: `logout()` limpia también 'user'

2. **`src/contexts/AuthContext.jsx`**
   - Actualizado: `login()` obtiene userData después de tokens
   - Actualizado: `useEffect` carga userData desde localStorage
   - Ahora el objeto `user` incluye: `username`, `email`, `is_staff`, `is_superuser`, etc.

3. **`src/pages/auth/Login.jsx`**
   - Ya implementado: Detecta `result.user.is_staff` y redirige apropiadamente

**El frontend está 100% listo.** Solo falta asegurarse de que el **backend tenga el endpoint** `/api/users/me/`.

---

## 🎯 Checklist Final

### Backend:
- [ ] Existe `GET /api/users/me/`
- [ ] Requiere autenticación (`IsAuthenticated`)
- [ ] Devuelve campo `is_staff`
- [ ] Devuelve campo `is_superuser`

### Frontend (ya listo ✅):
- [x] `authService.getCurrentUser()` implementado
- [x] Login obtiene userData con `is_staff`
- [x] localStorage guarda userData completo
- [x] Login.jsx redirige según `is_staff`

### Prueba Manual:
- [ ] Limpiado localStorage
- [ ] Login con admin
- [ ] Verificado que aparece `/admin/dashboard`
- [ ] Verificado que se ve el dashboard con KPIs

---

## 🚀 Una Vez que Funcione

Después de que el login redirija correctamente:

1. **Usuario Admin verá:**
   - Dashboard con 4 KPIs (Ventas, Órdenes, Usuarios, Productos)
   - Top 10 productos más vendidos
   - Órdenes por estado (gráfico de barras)
   - Alertas de stock bajo
   - Órdenes recientes
   - 3 botones de acciones rápidas

2. **En el header**, verás el enlace "Dashboard Admin" (solo visible para admins)

3. **Acceso protegido**: Si un usuario regular intenta acceder a `/admin/dashboard`, verá "Acceso Denegado"

---

**¿Necesitas ayuda implementando el endpoint en el backend?** Avísame y te doy el código completo para copiar y pegar.
