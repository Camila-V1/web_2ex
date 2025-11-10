# 🔍 DEBUG: Sistema de Auditoría Frontend

## ❌ Problema Detectado

Basándome en tus logs del backend:

```
INFO 2025-10-26 13:59:15,357 basehttp "GET /api/audit/?page=1 HTTP/1.1" 200 1289
```

El backend **SÍ está retornando datos** (1289 bytes con status 200), pero el frontend **no los muestra**.

---

## 🔧 Debugging Agregado

He agregado **logs extensivos** en el código para detectar el problema:

### 1. En `fetchLogs()`:
```javascript
console.log('🔷 [AUDIT] Response completa:', data);
console.log('🔷 [AUDIT] data.results:', data.results);
console.log('🔷 [AUDIT] data.count:', data.count);
console.log('🔷 [AUDIT] Cantidad de logs:', data.results?.length);
```

### 2. En `fetchStats()`:
```javascript
console.log('📊 [STATS] Estadísticas recibidas:', data);
```

### 3. Botón de Debug:
Un botón "🔍 Ver Estado en Consola" que muestra todo el estado actual.

---

## 🚀 Pasos para Debugging

### Paso 1: Recargar la Página

```bash
# En tu navegador
1. Abre http://localhost:5173/admin/audit
2. Abre DevTools (F12)
3. Ve a la pestaña "Console"
4. Recarga la página (Ctrl+R o F5)
```

### Paso 2: Buscar Logs en Consola

Busca estos logs:

```javascript
🔷 [AUDIT] Response completa: {...}
🔷 [AUDIT] data.results: [...]
🔷 [AUDIT] data.count: 2
📊 [STATS] Estadísticas recibidas: {...}
```

### Paso 3: Verificar Estructura

**Si ves los logs**, el problema está en cómo se renderizan.

**Si NO ves los logs**, hay un problema en la petición.

---

## 🎯 Escenarios Posibles

### Escenario A: Logs aparecen en consola pero no en UI

**Síntomas:**
```javascript
🔷 [AUDIT] data.results: [{...}, {...}]  // ✅ Hay datos
```

Pero la página muestra "No se encontraron registros"

**Causa:** Problema de renderizado o estado

**Solución:** Haz clic en el botón "🔍 Ver Estado en Consola" y envíame la salida

---

### Escenario B: Error en la petición

**Síntomas:**
```javascript
❌ Error fetching logs: ...
```

**Posibles causas:**
1. Token JWT inválido
2. URL incorrecta
3. CORS

**Solución:**
```javascript
// Ejecutar en consola del navegador
const token = localStorage.getItem('access_token');
console.log('Token:', token);

fetch('http://localhost:8000/api/audit/?page=1', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

---

### Escenario C: Response está vacía

**Síntomas:**
```javascript
🔷 [AUDIT] data.results: []  // Array vacío
🔷 [AUDIT] data.count: 0
```

**Causa:** El backend no tiene logs registrados o el filtro está activo

**Solución:**
1. Verifica que haya actividad en el backend
2. Verifica que no haya filtros activos
3. Genera actividad haciendo login/logout

---

## 🧪 Script de Prueba Manual

Copia y pega esto en la consola del navegador:

```javascript
// Test completo del sistema de auditoría
async function testAudit() {
  console.log('=== 🔍 TEST AUDITORÍA ===');
  
  // 1. Verificar token
  const token = localStorage.getItem('access_token');
  console.log('1. Token:', token ? '✅ Presente' : '❌ Falta');
  
  // 2. Verificar API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  console.log('2. API URL:', API_URL);
  
  // 3. Test endpoint de estadísticas
  try {
    console.log('3. Probando /audit/stats/...');
    const statsResponse = await fetch(`${API_URL}/audit/stats/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Status:', statsResponse.status);
    const statsData = await statsResponse.json();
    console.log('   Stats:', statsData);
    console.log('   Total logs:', statsData.total_logs);
  } catch (err) {
    console.error('   ❌ Error stats:', err);
  }
  
  // 4. Test endpoint de logs
  try {
    console.log('4. Probando /audit/?page=1...');
    const logsResponse = await fetch(`${API_URL}/audit/?page=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Status:', logsResponse.status);
    const logsData = await logsResponse.json();
    console.log('   Logs data:', logsData);
    console.log('   Count:', logsData.count);
    console.log('   Results:', logsData.results);
    console.log('   Cantidad:', logsData.results?.length);
    
    if (logsData.results && logsData.results.length > 0) {
      console.log('   ✅ Primer log:', logsData.results[0]);
    } else {
      console.log('   ⚠️ No hay logs en results');
    }
  } catch (err) {
    console.error('   ❌ Error logs:', err);
  }
  
  console.log('=== FIN TEST ===');
}

// Ejecutar test
testAudit();
```

---

## 📊 Verificar Formato de Response

El backend debería retornar esto:

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "action": "LOGIN",
      "severity": "INFO",
      "user": 1,
      "username": "admin",
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0...",
      "method": "POST",
      "path": "/api/token/",
      "description": "Usuario admin inició sesión",
      "timestamp": "2025-10-26T13:58:42.123456Z",
      "success": true,
      "error_message": null,
      "object_type": null,
      "object_id": null,
      "object_repr": null,
      "extra_data": {}
    },
    {
      "id": 2,
      "action": "REPORT_GENERATE",
      ...
    }
  ]
}
```

**Campos requeridos:**
- ✅ `count` (número total)
- ✅ `results` (array de logs)
- ✅ Cada log debe tener: `id`, `action`, `severity`, `username`, `ip_address`, `timestamp`, `success`

---

## 🔧 Soluciones Rápidas

### Solución 1: Limpiar Filtros

Si hay filtros activos que están bloqueando los resultados:

```javascript
// En consola del navegador
// (dentro del componente AdminAudit)
// Busca el componente en React DevTools y modifica el estado
```

### Solución 2: Regenerar Token

Si el token está expirado:

```javascript
// 1. Limpiar localStorage
localStorage.clear();

// 2. Recargar página
window.location.reload();

// 3. Hacer login nuevamente
```

### Solución 3: Verificar URL del Backend

```javascript
// En consola del navegador
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('API URL:', API_URL);

// Si es incorrecta, verificar archivo .env
```

---

## 📝 Información Necesaria

Para ayudarte mejor, necesito que me envíes:

### 1. Output del Test Script
Ejecuta el script `testAudit()` y envíame la salida completa

### 2. Logs de la Consola
Después de recargar `/admin/audit`, envíame todos los logs que empiecen con:
- `🔷 [AUDIT]`
- `📊 [STATS]`

### 3. Botón de Debug
Haz clic en "🔍 Ver Estado en Consola" y envíame el output

### 4. Network Tab
En DevTools:
1. Ve a la pestaña "Network"
2. Recarga la página
3. Busca la petición a `/audit/?page=1`
4. Haz clic en ella
5. Ve a "Response"
6. Envíame el contenido

---

## ✅ Checklist de Verificación

Antes de continuar, verifica:

- [ ] Backend corriendo en `http://localhost:8000`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Login exitoso como admin
- [ ] Token presente en localStorage
- [ ] DevTools Console abierta
- [ ] Página `/admin/audit` cargada

---

## 🎯 Siguiente Paso

**Ejecuta el script de prueba** y envíame la salida completa. Con eso podré identificar exactamente dónde está el problema:

1. **Si la petición falla** → Problema de autenticación o CORS
2. **Si retorna datos vacíos** → Problema de filtros o base de datos
3. **Si retorna datos pero no se muestran** → Problema de renderizado en React

---

**Última actualización:** 26 de Enero, 2025  
**Archivo modificado:** `src/pages/admin/AdminAudit.jsx`  
**Logs agregados:** ✅ fetchLogs, fetchStats, botón de debug
