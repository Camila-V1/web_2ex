# 🔧 CÓDIGO PARA EL BACKEND - Endpoint /api/users/me/

## 📋 Instrucciones para el Equipo de Backend

El frontend necesita este endpoint para obtener la información del usuario después del login, incluyendo el campo `is_staff` que determina si el usuario debe ver el dashboard admin o no.

---

## ✅ Código Completo para Copiar y Pegar

### Opción 1: Implementación Simple con `@api_view`

#### Paso 1: Crear/Editar `users/views.py`

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers, status

# Serializer para el usuario actual
class CurrentUserSerializer(serializers.Serializer):
    """
    Serializer para devolver información del usuario autenticado
    """
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    GET /api/users/me/
    
    Devuelve la información del usuario autenticado actual.
    Requiere autenticación JWT.
    
    Returns:
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
    """
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
```

#### Paso 2: Agregar la ruta en tus URLs

**Si tienes un archivo `users/urls.py`:**

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... tus rutas existentes ...
    path('me/', views.current_user, name='current-user'),
]
```

**Y en tu archivo principal de URLs (probablemente `backend_2ex/urls.py`):**

```python
from django.urls import path, include

urlpatterns = [
    # ... tus rutas existentes ...
    path('api/users/', include('users.urls')),
]
```

**O si prefieres agregarlo directamente en el archivo principal:**

```python
from users.views import current_user

urlpatterns = [
    # ... tus rutas existentes ...
    path('api/users/me/', current_user, name='current-user'),
]
```

---

### Opción 2: Si Ya Usas ViewSet para Usuarios

Si ya tienes un `UserViewSet`, agrega este método:

```python
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer  # Asume que tienes este serializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # ... tu configuración existente ...
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        GET /api/users/me/
        
        Devuelve el usuario actual autenticado.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
```

**Asegúrate de que tu `UserSerializer` incluya los campos necesarios:**

```python
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'is_staff',      # ✅ IMPORTANTE
            'is_superuser',  # ✅ IMPORTANTE
            'is_active'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'is_active']
```

---

## 🧪 Probar el Endpoint

### Opción A: Con curl

```bash
# 1. Obtener token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Respuesta:
# {
#   "access": "eyJ0eXAiOiJKV1QiLC...",
#   "refresh": "eyJ0eXAiOiJKV1QiLC..."
# }

# 2. Copiar el token "access" y usarlo aquí:
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLC..."

# Respuesta esperada:
# {
#   "id": 1,
#   "username": "admin",
#   "email": "admin@gmail.com",
#   "first_name": "",
#   "last_name": "",
#   "is_staff": true,
#   "is_superuser": true,
#   "is_active": true
# }
```

### Opción B: Con Python (manage.py shell)

```python
python manage.py shell
```

```python
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

# Obtener usuario admin
user = User.objects.get(username='admin')

# Generar token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print("Token de acceso:")
print(access_token)

# Ahora usa este token en curl o Postman
```

### Opción C: Con Postman

1. **Crear nueva request**
2. **Method:** GET
3. **URL:** `http://localhost:8000/api/users/me/`
4. **Headers:**
   - Key: `Authorization`
   - Value: `Bearer <tu_token_aqui>`
5. **Send**

**Respuesta esperada (Status 200):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@gmail.com",
  "first_name": "",
  "last_name": "",
  "is_staff": true,
  "is_superuser": true,
  "is_active": true
}
```

---

## 🔒 Seguridad

### ✅ El endpoint ES seguro porque:

1. **Requiere autenticación:** `@permission_classes([IsAuthenticated])`
2. **Solo devuelve info del usuario autenticado:** Usa `request.user`
3. **No permite modificación:** Solo método GET
4. **Campos de solo lectura:** `read_only=True` en todos los campos

### ❌ NO expone información sensible:

- **NO devuelve:** contraseñas (hasheadas)
- **NO devuelve:** tokens de sesión
- **NO permite:** acceso a datos de otros usuarios

---

## 🐛 Troubleshooting

### Error: "name 'serializers' is not defined"

**Causa:** Falta import.

**Solución:** Agrega al inicio del archivo:
```python
from rest_framework import serializers
```

### Error: "module 'rest_framework.permissions' has no attribute 'IsAuthenticated'"

**Causa:** Import incorrecto.

**Solución:** Verifica el import:
```python
from rest_framework.permissions import IsAuthenticated
```

### Error: "Given token not valid for any token type"

**Causa:** Token inválido o expirado.

**Solución:** Genera un nuevo token haciendo login nuevamente:
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Error: "Authentication credentials were not provided"

**Causa:** Falta el header de Authorization.

**Solución:** Asegúrate de incluir:
```
Authorization: Bearer <tu_token>
```

### El endpoint funciona pero no devuelve `is_staff`

**Verificar que el serializer incluya el campo:**

```python
# En CurrentUserSerializer o UserSerializer
class CurrentUserSerializer(serializers.Serializer):
    # ... otros campos ...
    is_staff = serializers.BooleanField(read_only=True)      # ✅ Debe estar
    is_superuser = serializers.BooleanField(read_only=True)  # ✅ Debe estar
```

---

## 📊 Estructura Completa de Archivos

```
backend_2ex/
├── users/
│   ├── __init__.py
│   ├── views.py          ← Agregar current_user() aquí
│   ├── serializers.py    ← Agregar CurrentUserSerializer aquí (opcional)
│   └── urls.py           ← Agregar ruta 'me/' aquí (opcional)
│
└── backend_2ex/
    └── urls.py           ← O agregar ruta directamente aquí
```

---

## ✅ Verificación Final

Después de implementar, verifica:

1. **Backend corriendo:** `python manage.py runserver`
2. **Endpoint responde:**
   ```bash
   curl http://localhost:8000/api/users/me/ \
     -H "Authorization: Bearer <token>"
   ```
3. **Status 200:** ✅
4. **Respuesta incluye `is_staff`:** ✅
5. **Valor de `is_staff` es `true` para admin:** ✅

---

## 🚀 Siguiente Paso (Frontend)

Una vez que este endpoint esté funcionando, el frontend automáticamente:

1. ✅ Hará login (`POST /api/token/`)
2. ✅ Obtendrá tokens
3. ✅ Llamará a `GET /api/users/me/`
4. ✅ Guardará `is_staff` en localStorage
5. ✅ Redirigirá al admin a `/admin/dashboard`
6. ✅ Redirigirá a usuarios regulares a `/products`

**No se necesitan cambios adicionales en el frontend. Ya está todo listo.**

---

## 📞 ¿Preguntas?

Si tienes algún error o duda con la implementación:

1. Revisa los mensajes de error en la consola de Django
2. Verifica que `rest_framework` esté instalado:
   ```bash
   pip install djangorestframework
   ```
3. Verifica que `rest_framework_simplejwt` esté instalado:
   ```bash
   pip install djangorestframework-simplejwt
   ```
4. Asegúrate de que `REST_FRAMEWORK` esté configurado en `settings.py`:
   ```python
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': (
           'rest_framework_simplejwt.authentication.JWTAuthentication',
       ),
   }
   ```

---

**¡Implementa este código y el sistema completo de administración funcionará!** 🎉
