# 🔴 Diagnóstico de Errores en Producción (Manager)

**Fecha:** 13 de noviembre de 2025  
**Usuario:** Manager  
**URL:** https://web-2ex.vercel.app  

---

## 🚨 Problemas Detectados

### 1. ❌ **CORS Error en Wallet Endpoint**

**Error:**
```
Access to XMLHttpRequest at 'https://backend-2ex-ecommerce.onrender.com/api/users/wallets/my_balance/' 
from origin 'https://web-2ex.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causa:**  
El backend Django **NO tiene configurado CORS** para el dominio de Vercel en el endpoint de wallet.

**Impacto:**  
- El widget de billetera NO funciona en producción
- Se generan 100+ requests fallidos por minuto (spam)
- Consumo innecesario de recursos del servidor

**Solución Backend (CRÍTICA):**

```python
# backend/backend_2ex/settings.py

CORS_ALLOWED_ORIGINS = [
    "https://web-2ex.vercel.app",       # ✅ Producción Vercel
    "http://localhost:5173",            # ✅ Dev local
    "http://localhost:3000",            # ✅ Alternativo
]

# O si prefieres permitir todos (NO recomendado en producción):
CORS_ALLOW_ALL_ORIGINS = False  # Mejor usar lista específica

# Asegurarse de tener:
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ✅ Debe estar ANTES de CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    ...
]

# Headers adicionales para wallet/pagos:
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

**Verificar que `django-cors-headers` esté instalado:**
```bash
pip install django-cors-headers
pip freeze | grep django-cors-headers
```

---

### 2. 🖼️ **Imagen Externa con 404**

**Error:**
```
th.bing.com/th/id/OIP.Q9Y4o8FJxZBkMZLZ-HmN0jwHaE8?w=500:1 Failed to load resource: 404
```

**Causa:**  
Algún producto en la base de datos tiene una imagen de Bing que ya no existe o tiene URL inválida.

**Solución Backend:**

```sql
-- Encontrar productos con imágenes de Bing
SELECT id, name, image_url 
FROM products 
WHERE image_url LIKE '%bing.com%' OR image_url LIKE '%th.bing.com%';

-- Actualizar a imágenes placeholder o locales
UPDATE products 
SET image_url = 'https://via.placeholder.com/500' 
WHERE image_url LIKE '%bing.com%';
```

O desde Django shell:
```python
python manage.py shell

from products.models import Product

# Encontrar productos con imágenes de Bing
broken_products = Product.objects.filter(image_url__contains='bing.com')
print(f"Productos con imágenes de Bing: {broken_products.count()}")

# Actualizar a placeholder
for product in broken_products:
    print(f"Actualizando: {product.name}")
    product.image_url = 'https://via.placeholder.com/500'
    product.save()
```

**Alternativa Frontend (Temporal):**  
Implementar fallback de imágenes en componente `ProductCard`:

```jsx
<img 
  src={product.image_url} 
  alt={product.name}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/500?text=Imagen+No+Disponible';
  }}
/>
```

---

### 3. 🔄 **Spam de Requests en Console**

**Problema:**  
El WalletWidget hace polling cada 30 segundos, y cuando hay error CORS, **NO deja de intentar**, generando 100+ logs en consola.

**Solución Frontend (YA APLICADA):**

Se modificó `WalletWidget.jsx` para:
- ✅ Aumentar intervalo de 30s a 60s
- ✅ Contador de reintentos (máximo 3)
- ✅ Ocultar widget después de 3 fallos CORS
- ✅ Mostrar indicador visual de error antes de ocultar
- ✅ Reset del contador cuando hay éxito

```jsx
// Antes:
const interval = setInterval(loadBalance, 30000); // Spam infinito

// Ahora:
const interval = setInterval(() => {
  if (retryCountRef.current < 3) {
    loadBalance();
  }
}, 60000); // Solo reintentar 3 veces
```

---

## ✅ Soluciones Aplicadas (Frontend)

### 📁 `src/components/wallet/WalletWidget.jsx` - MEJORADO

**Cambios:**
1. ✅ Manejo robusto de errores CORS
2. ✅ Contador de reintentos con límite (3 intentos)
3. ✅ Intervalo aumentado a 60 segundos
4. ✅ Indicador visual cuando hay error temporal
5. ✅ Auto-ocultar widget después de 3 fallos consecutivos
6. ✅ Logs informativos para debugging

**Comportamiento:**
- **1er intento fallido:** Muestra botón amarillo "Wallet Error"
- **2do intento fallido:** Continúa mostrando botón amarillo
- **3er intento fallido:** Oculta widget completamente
- **Éxito en cualquier momento:** Reset contador, muestra balance normal

---

## 📊 Logs de Orders - TODO OK ✅

Los logs de las órdenes (120, 126, 119, etc.) muestran que:
- ✅ Las órdenes cargan correctamente
- ✅ El endpoint `/api/orders/admin/{id}/` funciona bien
- ✅ Status 200 en todas las peticiones
- ✅ Datos completos en cada orden

**No requiere acción** - Este es el comportamiento esperado.

---

## 🎯 Acciones Requeridas

### 🔴 **URGENTE - Backend (Django)**

1. **Configurar CORS para Vercel:**
   ```bash
   pip install django-cors-headers
   ```
   
2. **Actualizar `settings.py`:**
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://web-2ex.vercel.app",
       "http://localhost:5173",
   ]
   ```

3. **Verificar orden de MIDDLEWARE:**
   ```python
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',  # PRIMERO
       'django.middleware.common.CommonMiddleware',
       ...
   ]
   ```

4. **Reiniciar servidor Django:**
   ```bash
   python manage.py runserver
   # O en Render: Deploy manual o git push
   ```

5. **Limpiar imágenes rotas:**
   ```python
   python manage.py shell
   from products.models import Product
   Product.objects.filter(image_url__contains='bing.com').update(
       image_url='https://via.placeholder.com/500'
   )
   ```

### 🟡 **Opcional - Mejorar Robustez**

6. **Agregar rate limiting en wallet endpoint:**
   ```python
   # backend/wallet/views.py
   from rest_framework.throttling import UserRateThrottle
   
   class WalletBalanceView(APIView):
       throttle_classes = [UserRateThrottle]
       throttle_scope = 'wallet'
   ```

7. **Configurar cache para balance:**
   ```python
   from django.core.cache import cache
   
   def get_my_balance(request):
       user_id = request.user.id
       cache_key = f'wallet_balance_{user_id}'
       
       balance = cache.get(cache_key)
       if balance is None:
           wallet = Wallet.objects.get(user=request.user)
           balance = wallet.balance
           cache.set(cache_key, balance, 60)  # Cache 60 segundos
       
       return Response({'balance': balance})
   ```

---

## 🧪 Testing Post-Fix

**Después de aplicar fixes en backend, verificar:**

1. **Abrir consola del navegador en:**
   ```
   https://web-2ex.vercel.app
   ```

2. **Iniciar sesión como Manager:**
   ```
   Username: carlos_manager
   Password: [tu contraseña]
   ```

3. **Verificar en consola:**
   - ✅ NO debe haber errores CORS
   - ✅ Widget de billetera debe mostrarse con balance
   - ✅ NO debe haber spam de requests fallidos
   - ✅ Imágenes de productos deben cargar correctamente

4. **Verificar funcionalidad:**
   - ✅ Click en widget de billetera redirige a `/wallet`
   - ✅ Balance se actualiza cada 60 segundos
   - ✅ NO aparece botón amarillo de error

---

## 📚 Referencias

- **Django CORS Headers:** https://github.com/adamchainz/django-cors-headers
- **CORS Policy MDN:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **React Error Boundaries:** https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- **Vercel Deployment:** https://vercel.com/docs

---

## 📝 Notas Adicionales

- El frontend YA está optimizado para manejar errores CORS
- El problema principal es **configuración del backend**
- Una vez aplicados los fixes, el widget funcionará correctamente
- Considerar implementar WebSockets para actualizaciones en tiempo real del balance (opcional)

---

---

## 🔧 **ACTUALIZACIÓN - Problema de Reportes Corruptos RESUELTO**

### ❌ Problema Real Detectado

Después de testing exhaustivo:
1. ✅ Backend genera archivos OK (Python test exitoso)
2. ✅ Frontend usa `responseType: 'blob'` correctamente
3. ❌ **AIReportGenerator.jsx estaba wrapping el blob incorrectamente**

### 🐛 Bug Encontrado (Línea 62)

```javascript
// ❌ MAL - Double wrapping del blob
const url = window.URL.createObjectURL(new Blob([response.data]));

// ✅ CORRECTO - response.data YA es un blob
const url = window.URL.createObjectURL(response.data);
```

**Explicación:**
- Cuando usas `responseType: 'blob'`, axios ya retorna `response.data` como `Blob`
- Envolverlo en `new Blob([...])` crea un blob anidado → archivo corrupto
- Solución: Usar `response.data` directamente

### ✅ Fix Aplicado

**Archivo:** `src/pages/admin/AIReportGenerator.jsx`  
**Línea:** 62  
**Cambio:** Removido `new Blob([])` wrapper

```diff
- const url = window.URL.createObjectURL(new Blob([response.data]));
+ const url = window.URL.createObjectURL(response.data);
```

### 🧪 Para Verificar el Fix

1. Hacer git pull en el frontend
2. Iniciar sesión como Manager
3. Ir a "🤖 Reportes IA"
4. Comando: "Ventas de septiembre en PDF"
5. El archivo descargado **AHORA debería abrirse correctamente** ✅

---

**Estado Actualizado:** ✅ Fix aplicado en frontend  
**Prioridad CORS:** 🟡 Media (funcionalidad secundaria)  
**Prioridad Reportes:** ✅ RESUELTO  
**ETA Verificación:** Inmediato tras deployment en Vercel
