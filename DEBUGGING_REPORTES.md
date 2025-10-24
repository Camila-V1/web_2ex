# 🔍 Guía de Debugging - Logs de Reportes

## 📊 Logs Agregados

He agregado **logs detallados paso a paso** en `AdminReports.jsx` para rastrear exactamente dónde ocurre el error 404.

---

## 🎯 Cómo Usar los Logs

### **1. Abre la Consola del Navegador**

- Presiona `F12` o `Ctrl + Shift + I`
- Ve a la pestaña **"Console"**
- Limpia la consola (icono 🚫 o `Ctrl + L`)

---

### **2. Intenta Generar un Reporte**

**Reporte de Ventas:**
1. Selecciona "Hoy" (o cualquier fecha)
2. Click en "PDF"

**Reporte de Productos:**
1. Click en "PDF"

---

## 📋 Logs que Verás

### **Logs Iniciales (Al Cargar la Página):**

```
📌 [INIT] AdminReports cargado
📌 [INIT] API_URL configurada: http://localhost:8000/api
📌 [INIT] VITE_API_URL env: undefined (o la URL configurada)
```

**✅ Verifica:**
- ¿La API_URL es correcta? (`http://localhost:8000/api`)
- ¿VITE_API_URL está definida en `.env`?

---

### **Logs de Reporte de Ventas (🔷 Azul):**

Cuando clickeas "PDF" en ventas, verás:

```
🔷 [1] Iniciando generación de reporte de ventas
🔷 [2] Formato solicitado: pdf
🔷 [3] Fechas seleccionadas: {start_date: "2025-10-18", end_date: "2025-10-18"}
✅ [6] Validaciones pasadas
🔑 [AUTH] Obteniendo headers de autenticación
🔑 [AUTH] Token presente: true
🔑 [AUTH] Token preview: eyJhbGciOiJIUzI1NiIsInR5cCI6...
🔷 [7] Token obtenido: eyJhbGciOiJIUzI1NiIsInR5...
🔷 [8] URL completa: http://localhost:8000/api/reports/sales/
🔷 [9] Parámetros: {format: "pdf", start_date: "2025-10-18", end_date: "2025-10-18"}
🔷 [10] Headers: {Authorization: "Bearer eyJ..."}
🔷 [11] responseType: blob
🔷 [12] Enviando petición GET...
```

**Aquí es donde ocurre el ERROR 404:**

```
❌ [ERROR] Error en reporte de ventas: AxiosError {...}
❌ [ERROR] Mensaje: Request failed with status code 404
❌ [ERROR] Response: {status: 404, data: {...}, headers: {...}}
❌ [ERROR] Status: 404
```

---

### **Logs de Reporte de Productos (🟢 Verde):**

```
🟢 [1] Iniciando generación de reporte de productos
🟢 [2] Formato solicitado: pdf
🟢 [3] Token obtenido: eyJhbGciOiJIUzI1NiIsInR5...
🟢 [4] URL completa: http://localhost:8000/api/reports/products/
🟢 [5] Parámetros: {format: "pdf"}
🟢 [6] Headers: {Authorization: "Bearer eyJ..."}
🟢 [7] responseType: blob
🟢 [8] Enviando petición GET...
```

**ERROR 404:**

```
❌ [ERROR PRODUCTOS] Error en reporte de productos: AxiosError {...}
❌ [ERROR PRODUCTOS] Mensaje: Request failed with status code 404
❌ [ERROR PRODUCTOS] Response: {status: 404, data: {...}}
❌ [ERROR PRODUCTOS] Status: 404
```

---

## 🔎 Qué Información Necesito

### **Copia y pega estos logs de la consola:**

#### **1. Logs Iniciales:**
```
📌 [INIT] API_URL configurada: ???
📌 [INIT] VITE_API_URL env: ???
```

#### **2. Logs de Token:**
```
🔑 [AUTH] Token presente: ???
🔑 [AUTH] Token preview: ???
```

#### **3. URL Completa Generada:**
```
🔷 [8] URL completa: ???
🔷 [9] Parámetros: ???
```

#### **4. Detalles del Error:**
```
❌ [ERROR] Status: ???
❌ [ERROR] Data: ???
```

---

## 🎯 Posibles Causas del Error 404

### **Causa 1: Endpoint no existe en el backend**

**Verificación:**
```bash
# En la terminal del backend, verifica las rutas disponibles:
python manage.py show_urls | grep reports
```

**Deberías ver:**
```
/api/reports/sales/ [name='sales-report']
/api/reports/products/ [name='products-report']
```

---

### **Causa 2: App de reportes no está registrada**

**Verificar en `settings.py`:**
```python
INSTALLED_APPS = [
    # ...
    'reports',  # ← Debe estar aquí
]
```

---

### **Causa 3: URLs de reportes no incluidas**

**Verificar en `ecommerce_api/urls.py`:**
```python
urlpatterns = [
    # ...
    path('api/reports/', include('reports.urls')),  # ← Debe estar aquí
]
```

---

### **Causa 4: Error en reports/urls.py**

**Debe contener:**
```python
from django.urls import path
from .views import SalesReportView, ProductsReportView

urlpatterns = [
    path('sales/', SalesReportView.as_view(), name='sales-report'),
    path('products/', ProductsReportView.as_view(), name='products-report'),
]
```

---

### **Causa 5: Vistas no existen**

**Verificar que existan en `reports/views.py`:**
```python
class SalesReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    # ...

class ProductsReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    # ...
```

---

## 🛠️ Pasos de Diagnóstico

### **Paso 1: Verifica el Backend**

En la terminal del backend, verifica que no haya errores:

```bash
python manage.py runserver
```

**Busca mensajes como:**
```
System check identified no issues (0 silenced).
October 18, 2025 - 10:00:00
Django version 4.x.x, using settings 'ecommerce_api.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

### **Paso 2: Prueba Directo en el Navegador**

**Intenta acceder directamente:**

1. Ve a Django Admin: `http://localhost:8000/admin/`
2. Login con tu usuario admin
3. Abre una nueva pestaña y prueba:
   ```
   http://localhost:8000/api/reports/sales/?format=pdf&start_date=2024-01-01&end_date=2024-12-31
   ```

**¿Qué pasa?**
- ✅ Se descarga un PDF → Backend funciona, problema en frontend
- ❌ Error 404 → Backend no tiene la ruta configurada
- ❌ Error 403 → Permisos de admin
- ❌ Error 500 → Error en el código del backend

---

### **Paso 3: Verifica con curl**

```bash
# Primero obtén el token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Usa el token (reemplaza YOUR_TOKEN)
curl -X GET "http://localhost:8000/api/reports/sales/?format=pdf&start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test_report.pdf
```

---

## 📊 Interpretación de Logs

### **Si ves esto en la consola:**

```
🔷 [8] URL completa: http://localhost:8000/api/reports/sales/
❌ [ERROR] Status: 404
```

**Significa:** El frontend está enviando la petición correctamente, pero el backend no tiene ese endpoint.

---

### **Si ves esto:**

```
🔷 [8] URL completa: http://localhost:8001/api/reports/sales/
                                    ^^^^
```

**Problema:** El puerto es incorrecto. El backend debe estar en 8000.

---

### **Si ves esto:**

```
🔑 [AUTH] Token presente: false
```

**Problema:** No hay token. El usuario no está logueado o el token expiró.

**Solución:**
1. Logout
2. Login nuevamente
3. Intenta de nuevo

---

## 🎯 Checklist de Verificación

```
□ Servidor Django corriendo en puerto 8000
□ App 'reports' en INSTALLED_APPS
□ path('api/reports/', include('reports.urls')) en urls principales
□ SalesReportView y ProductsReportView existen en views.py
□ reports/urls.py tiene ambas rutas configuradas
□ Usuario tiene is_staff = True
□ Token JWT válido en localStorage
□ Frontend usando URL correcta (http://localhost:8000/api)
```

---

## 🚀 Próxima Acción

**Copia todos los logs de la consola y pégalos aquí** para que pueda ver exactamente:

1. ¿Cuál es la URL completa que se está generando?
2. ¿El token está presente?
3. ¿Qué dice el error completo?

**También comparte:**
- ¿El servidor Django está corriendo sin errores?
- ¿Qué aparece cuando pruebas directamente en el navegador `http://localhost:8000/api/reports/sales/?format=pdf&start_date=2024-01-01&end_date=2024-12-31`?

---

**Con esta información detallada podré identificar exactamente dónde está el problema.** 🔍
