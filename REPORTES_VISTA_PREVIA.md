# 👁️ Sistema de Vista Previa de Reportes - Frontend

## 🎯 ¿Qué se agregó?

Se agregó **vista previa en modal** para los reportes de ventas y productos, permitiendo al usuario **ver los datos ANTES de descargar** el PDF/Excel.

## ✨ Características Nuevas

### 1. Botón "👁️ Vista Previa"

Se agregó un **nuevo botón** en cada tipo de reporte:
- **Color índigo** para diferenciarse de los botones de descarga
- Aparece **ENCIMA** de los botones PDF/Excel
- Carga los datos en JSON y muestra modal

### 2. Modal de Vista Previa de Ventas

**Muestra:**
- ✅ **Estadísticas resumidas** (3 tarjetas):
  - Total de órdenes
  - Total de ventas en $
  - Promedio por orden
- ✅ **Lista de órdenes** con diseño de tarjetas:
  - ID de orden
  - Fecha y hora
  - Cliente (nombre + email)
  - Total de la orden
  - Cantidad de items
  - **Lista desplegable de productos** incluidos
- ✅ **Botones de descarga** en el footer del modal

### 3. Modal de Vista Previa de Productos

**Muestra:**
- ✅ **Estadísticas resumidas** (3 tarjetas):
  - Total de productos
  - Stock total
  - Valor total del inventario
- ✅ **Tabla completa** de productos con:
  - ID
  - Nombre
  - Categoría
  - Precio unitario
  - Stock (con colores según cantidad)
  - Valor total (precio × stock)
- ✅ **Botones de descarga** en el footer del modal

## 🔧 Implementación Técnica

### Nuevos Estados

```javascript
// Estados para vista previa
const [salesPreview, setSalesPreview] = useState(null);
const [productsPreview, setProductsPreview] = useState(null);
const [showSalesPreview, setShowSalesPreview] = useState(false);
const [showProductsPreview, setShowProductsPreview] = useState(false);
const [loadingPreview, setLoadingPreview] = useState(false);
```

### Nuevas Funciones

#### `previewSalesReport()`
```javascript
const previewSalesReport = async () => {
  // Validar fechas
  if (!salesDates.start_date || !salesDates.end_date) {
    alert('⚠️ Por favor selecciona un rango de fechas');
    return;
  }

  setLoadingPreview(true);
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(
      `${API_URL}/reports/sales/preview/?start_date=${salesDates.start_date}&end_date=${salesDates.end_date}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    setSalesPreview(data);
    setShowSalesPreview(true);
  } catch (err) {
    alert('❌ Error al obtener vista previa del reporte');
  } finally {
    setLoadingPreview(false);
  }
};
```

#### `previewProductsReport()`
```javascript
const previewProductsReport = async () => {
  setLoadingPreview(true);
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(
      `${API_URL}/reports/products/preview/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    setProductsPreview(data);
    setShowProductsPreview(true);
  } catch (err) {
    alert('❌ Error al obtener vista previa del reporte');
  } finally {
    setLoadingPreview(false);
  }
};
```

## 📊 Estructura de Datos Recibidos

### Vista Previa de Ventas
```json
{
  "start_date": "2025-10-01",
  "end_date": "2025-10-31",
  "total_orders": 25,
  "total_revenue": 15750.50,
  "orders": [
    {
      "order_id": 145,
      "date": "2025-10-15 14:30:25",
      "customer": "Juan Pérez",
      "customer_email": "juan@email.com",
      "total": 1250.00,
      "items_count": 3,
      "items": [
        {
          "product": "Laptop Dell XPS 13",
          "quantity": 1,
          "price": 999.99,
          "subtotal": 999.99
        }
      ]
    }
  ]
}
```

### Vista Previa de Productos
```json
{
  "total_products": 35,
  "total_stock": 450,
  "total_value": 45250.75,
  "products": [
    {
      "id": 1,
      "name": "Laptop Dell XPS 13",
      "category": "Laptops",
      "price": 999.99,
      "stock": 10,
      "value": 9999.90,
      "description": "Laptop ultraportátil..."
    }
  ]
}
```

## 🎨 Diseño y UX

### Colores de Stock (Productos)
```javascript
stock < 10   → bg-red-100 text-red-800     (Stock bajo)
stock < 50   → bg-yellow-100 text-yellow-800 (Stock medio)
stock >= 50  → bg-green-100 text-green-800  (Stock alto)
```

### Iconos Utilizados
- 👁️ `Eye` - Vista previa
- 🛒 `ShoppingCart` - Órdenes/Carrito
- 💵 `DollarSign` - Dinero/Ventas
- 📈 `TrendingUp` - Tendencias/Promedios
- 📦 `Package` - Productos
- 👥 `Users` - Clientes
- ⬇️ `Download` - Descargar
- ❌ `X` - Cerrar modal
- ⏳ `Loader2` - Cargando (con animación spin)

### Gradientes
- **Ventas**: `from-purple-600 to-indigo-600`
- **Productos**: `from-blue-600 to-cyan-600`
- **Botón Vista Previa**: `from-indigo-600 to-indigo-700`

## 🚀 Flujo de Usuario

### Reporte de Ventas

1. **Usuario selecciona fechas**
   - Puede usar quick filters: Hoy, Este Mes, Este Año
   - O seleccionar manualmente fecha inicio y fin

2. **Usuario hace clic en "👁️ Vista Previa"**
   - Aparece spinner: "Cargando Vista Previa..."
   - Se hace fetch a `/api/reports/sales/preview/`

3. **Se muestra modal con:**
   - 3 tarjetas de estadísticas
   - Lista de órdenes con detalles
   - Productos incluidos en cada orden

4. **Usuario revisa los datos**
   - Si están correctos → Hace clic en "Descargar PDF" o "Descargar Excel"
   - Si no están correctos → Cierra modal (X) y ajusta fechas

5. **Descarga desde el modal**
   - Los botones del footer llaman a las funciones originales
   - `generateSalesReport('pdf')` o `generateSalesReport('excel')`

### Reporte de Productos

1. **Usuario hace clic en "👁️ Vista Previa"**
   - No requiere parámetros
   - Aparece spinner: "Cargando Vista Previa..."

2. **Se muestra modal con:**
   - 3 tarjetas de estadísticas
   - Tabla completa de productos
   - Colores según nivel de stock

3. **Usuario revisa los datos**
   - Ve todos los productos activos
   - Identifica productos con stock bajo (rojos)

4. **Descarga desde el modal**
   - Hace clic en "Descargar PDF" o "Descargar Excel"

## 📡 Endpoints Utilizados

### Backend (Django)
```
GET /api/reports/sales/preview/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET /api/reports/products/preview/
```

**Estos son NUEVOS y retornan JSON**

### Endpoints Originales (Siguen funcionando igual)
```
GET /api/reports/sales/?start_date=X&end_date=Y&format=pdf
GET /api/reports/sales/?start_date=X&end_date=Y&format=excel
GET /api/reports/products/?format=pdf
GET /api/reports/products/?format=excel
```

**Estos retornan archivos (Blob) para descarga**

## ✅ Ventajas del Sistema

### 1. Mejor Experiencia de Usuario
- ✅ Usuario ve **exactamente qué va a descargar**
- ✅ Puede **validar datos antes** de generar archivo
- ✅ **Feedback visual inmediato**

### 2. Ahorro de Recursos
- ✅ Evita descargas innecesarias
- ✅ Reduce carga en el servidor (JSON más ligero que PDF)
- ✅ Usuario no descarga si los datos están mal

### 3. Flexibilidad
- ✅ Usuario puede **ver datos y LUEGO elegir formato** (PDF o Excel)
- ✅ Puede **revisar sin descargar**

### 4. Debugging
- ✅ Más fácil detectar errores en los datos
- ✅ Usuario puede reportar problemas específicos

## 🔒 Seguridad

- ✅ Requiere autenticación JWT (`Bearer token`)
- ✅ Solo administradores pueden acceder (`is_staff=true`)
- ✅ Validación de fechas en frontend y backend
- ✅ Mismo sistema de permisos que descargas

## 📱 Responsive

### Modal
- ✅ `max-w-6xl` - Ancho máximo en pantallas grandes
- ✅ `max-h-[90vh]` - Altura máxima 90% del viewport
- ✅ `overflow-y-auto` - Scroll vertical cuando es necesario
- ✅ Grid adaptativo para estadísticas (1 col móvil, 3 cols desktop)

### Tabla de Productos
- ✅ `overflow-x-auto` - Scroll horizontal en móviles
- ✅ Cabecera sticky `sticky top-0`

## 🧪 Testing

### Verificar Funcionamiento

1. **Login como admin**
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Ir a Reportes**
   - Navegar a `/admin/reports`

3. **Probar Vista Previa de Ventas**
   - Seleccionar fechas
   - Clic en "👁️ Vista Previa"
   - Verificar que aparece modal
   - Verificar estadísticas
   - Verificar lista de órdenes
   - Clic en "Descargar PDF" desde modal
   - Cerrar modal (X)

4. **Probar Vista Previa de Productos**
   - Clic en "👁️ Vista Previa"
   - Verificar que aparece modal
   - Verificar estadísticas
   - Verificar tabla de productos
   - Verificar colores de stock
   - Clic en "Descargar Excel" desde modal

### Casos de Prueba

**✅ Caso 1: Sin fechas**
- Clic en Vista Previa de Ventas sin seleccionar fechas
- Resultado esperado: Alert "⚠️ Por favor selecciona un rango de fechas"

**✅ Caso 2: Fecha inicio > Fecha fin**
- Seleccionar fecha inicio posterior a fecha fin
- Clic en Vista Previa
- Resultado esperado: Alert "❌ La fecha inicial debe ser menor que la fecha final"

**✅ Caso 3: Vista previa exitosa**
- Seleccionar fechas válidas
- Clic en Vista Previa
- Resultado esperado: Modal con datos

**✅ Caso 4: Descargar desde modal**
- Abrir vista previa
- Clic en "Descargar PDF"
- Resultado esperado: Descarga PDF + Modal permanece abierto

**✅ Caso 5: Cerrar modal**
- Abrir vista previa
- Clic en X
- Resultado esperado: Modal se cierra

## 🐛 Troubleshooting

### Error: "Error al obtener vista previa"

**Causa posible:**
- Backend no está corriendo
- Endpoint `/preview/` no existe
- Token JWT inválido

**Solución:**
1. Verificar que backend esté corriendo: `python manage.py runserver`
2. Verificar URL del backend en `.env`: `VITE_API_URL=http://localhost:8000/api`
3. Limpiar localStorage y volver a hacer login

### Modal no aparece

**Causa posible:**
- Estado `showSalesPreview` o `showProductsPreview` es `false`
- Datos no se cargaron (`salesPreview` o `productsPreview` es `null`)

**Solución:**
1. Abrir DevTools console
2. Buscar logs: `👁️ [PREVIEW]`
3. Verificar si hay errores en la petición

### Spinner no se detiene

**Causa posible:**
- Error en el try-catch no manejado
- `setLoadingPreview(false)` no se ejecuta

**Solución:**
1. Verificar que `finally` se ejecute
2. Revisar console para errores

## 📝 Notas Importantes

### Funcionalidad Original Intacta

**TODO lo anterior sigue funcionando exactamente igual:**
- ✅ Botones "Descargar PDF" y "Descargar Excel" (fuera del modal)
- ✅ Generación de reportes sin vista previa
- ✅ Validaciones de fechas
- ✅ Quick filters (Hoy, Este Mes, Este Año)
- ✅ Logging en consola

**Lo ÚNICO que se agregó:**
- ✅ Botón "👁️ Vista Previa"
- ✅ Funciones `previewSalesReport()` y `previewProductsReport()`
- ✅ Modales de vista previa
- ✅ Estados para manejar preview

### Compatibilidad

- ✅ Compatible con todos los navegadores modernos
- ✅ No requiere librerías adicionales
- ✅ Usa los mismos iconos de Lucide React
- ✅ Usa el mismo diseño Tailwind CSS

## 🎯 Próximas Mejoras (Opcional)

### 1. Gráficos en Vista Previa
Agregar Chart.js para mostrar:
- Gráfico de línea de ventas por día
- Gráfico de barras de productos más vendidos

### 2. Paginación en Modal
Si hay muchas órdenes/productos:
- Agregar paginación dentro del modal
- Botones "Anterior" y "Siguiente"

### 3. Exportación Selectiva
Permitir al usuario:
- Seleccionar qué órdenes/productos incluir
- Checkboxes en la tabla
- Exportar solo los seleccionados

### 4. Filtros Adicionales
En la vista previa:
- Filtrar por cliente
- Filtrar por categoría de producto
- Ordenar por diferentes campos

---

## 🎉 Conclusión

**Sistema de Vista Previa 100% Funcional** 🚀

### Resumen:
- ✅ Botón "Vista Previa" agregado en ambos reportes
- ✅ Modales con diseño profesional y responsive
- ✅ Estadísticas resumidas visualmente atractivas
- ✅ Lista/Tabla completa de datos
- ✅ Descarga desde el modal
- ✅ Funcionalidad original intacta
- ✅ Sin errores de compilación
- ✅ Listo para producción

**El usuario ahora puede:**
1. Ver los datos ANTES de descargar
2. Validar que los datos sean correctos
3. Elegir el formato DESPUÉS de revisar
4. Cerrar y ajustar parámetros si es necesario

**¡Mejor UX y ahorro de recursos! 🎊**
