# 🔄 CAMBIOS EN STRIPE - Resumen

**Fecha:** 19 de Octubre, 2025  
**Contexto:** Reorganización de URLs del backend

---

## 🎯 CAMBIO PRINCIPAL

### Webhook de Stripe

**❌ URL ANTERIOR:**
```
/api/stripe-webhook/
```

**✅ URL NUEVA:**
```
/api/orders/stripe-webhook/
```

**Razón del cambio:**  
El webhook de Stripe pertenece a la app `shop_orders`, por lo que se movió bajo el prefijo `/api/orders/` para mantener consistencia.

---

## 📊 COMPARACIÓN COMPLETA

| Endpoint | URL Anterior | URL Nueva | Frontend Afectado |
|----------|-------------|-----------|-------------------|
| **Crear checkout session** | `/api/orders/{id}/create-checkout-session/` | `/api/orders/{id}/create-checkout-session/` | ✅ Sin cambio |
| **Webhook de Stripe** | `/api/stripe-webhook/` | `/api/orders/stripe-webhook/` | ⚠️ **Cambió** |

---

## 💻 IMPACTO EN EL FRONTEND

### ✅ Checkout Session - SIN CAMBIOS

**Endpoint usado por el frontend:**
```javascript
POST /api/orders/{id}/create-checkout-session/
```

**Código en `src/services/api.js`:**
```javascript
const response = await api.post(
  `orders/${orderId}/create-checkout-session/`, 
  urls
);
```

**Estado:** ✅ **CORRECTO** - No necesita cambios

---

### ⚠️ Stripe Webhook - CAMBIÓ (pero no afecta frontend)

**Endpoint:**
```
POST /api/orders/stripe-webhook/
```

**Importante:** Este endpoint **NO es llamado desde el frontend**. Es llamado directamente por Stripe.

**Configuración necesaria:**

#### 1. Stripe CLI (Desarrollo):
```powershell
# Antes (INCORRECTO)
stripe listen --forward-to localhost:8000/api/stripe-webhook/

# Ahora (CORRECTO)
stripe listen --forward-to localhost:8000/api/orders/stripe-webhook/
```

#### 2. Stripe Dashboard (Producción):
```
Webhook endpoint URL:
https://tudominio.com/api/orders/stripe-webhook/
```

---

## 🔧 ACTUALIZACIÓN EN `api.js`

### Estado Actual:

```javascript
// src/constants/api.js
export const API_ENDPOINTS = {
  // ...
  
  // ===== ORDERS =====
  ORDERS: '/orders/',
  ORDER_DETAIL: (id) => `/orders/${id}/`,
  ORDER_CREATE: '/orders/create/',
  CHECKOUT_SESSION: (id) => `/orders/${id}/create-checkout-session/`,
  STRIPE_WEBHOOK: '/orders/stripe-webhook/', // ✅ YA ESTÁ CORRECTO
  
  // ...
};
```

**✅ El archivo `api.js` YA tiene la URL correcta**

---

## 🧪 FLUJO COMPLETO DE PAGO

```
┌────────────────────────────────────────────────────┐
│            FLUJO CON URLs ACTUALIZADAS             │
└────────────────────────────────────────────────────┘

1. 🛒 Usuario hace checkout en frontend
   └─> POST /api/orders/create/
   └─> Response: { id: 72, status: "PENDING" }

2. 💳 Frontend solicita sesión de Stripe
   └─> POST /api/orders/72/create-checkout-session/
   └─> Response: { checkout_url: "https://checkout.stripe.com/..." }
   └─> Frontend redirige al usuario a Stripe

3. 💰 Usuario paga en Stripe
   └─> Ingresa datos de tarjeta
   └─> Stripe procesa el pago

4. 📡 Stripe envía webhook (NUEVA URL)
   └─> POST /api/orders/stripe-webhook/  ← CAMBIÓ AQUÍ
   └─> Backend recibe y actualiza: PENDING → PAID

5. 🎉 Stripe redirige a success_url
   └─> Frontend muestra confirmación
```

---

## 📝 DOCUMENTACIÓN A ACTUALIZAR

### ✅ Ya Actualizado en el Frontend:
- `src/constants/api.js` - ✅ URL correcta
- `VERIFICACION_URLS_OFICIAL.md` - ✅ Verificado

### ⚠️ Necesita Actualización (si existe):
- Cualquier guía de configuración de Stripe
- Scripts de prueba
- Documentación de deployment

---

## 🔑 CONFIGURACIÓN DE STRIPE CLI

### Para Desarrollo Local:

```powershell
# 1. Autenticar con Stripe
stripe login

# 2. Iniciar Django server (Terminal 1)
python manage.py runserver

# 3. Iniciar webhook listener (Terminal 2) - NUEVA URL
stripe listen --forward-to localhost:8000/api/orders/stripe-webhook/
#                                                    ^^^^^^ AGREGADO

# Verás algo como:
# > Ready! Your webhook signing secret is whsec_1234567890abcdef...
# > 2025-10-19 10:00:00   --> checkout.session.completed [evt_1234]

# 4. Copiar el webhook secret y agregarlo a settings.py
STRIPE_WEBHOOK_SECRET = 'whsec_...'

# 5. Reiniciar Django server
```

---

## 🌐 CONFIGURACIÓN EN PRODUCCIÓN

### Stripe Dashboard:

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL (ACTUALIZADA):**
   ```
   https://tudominio.com/api/orders/stripe-webhook/
   ```
4. **Eventos a escuchar:**
   - `checkout.session.completed`
   - `payment_intent.succeeded` (opcional)
5. Copia el "Signing secret" generado
6. Agrégalo a tu archivo de configuración de producción

---

## 📋 CHECKLIST DE VERIFICACIÓN

```
FRONTEND:
✅ src/constants/api.js tiene STRIPE_WEBHOOK correcto
✅ Checkout session usa URL correcta
✅ No hay código que llame directamente al webhook

BACKEND:
✅ shop_orders/urls.py tiene la ruta del webhook
✅ StripeWebhookView está correctamente configurada
✅ STRIPE_WEBHOOK_SECRET en settings.py

STRIPE CLI (Desarrollo):
✅ Comando actualizado con nueva URL
✅ Webhook secret copiado a settings.py
✅ Django server reiniciado después de agregar secret

STRIPE DASHBOARD (Producción):
✅ Webhook endpoint apunta a /api/orders/stripe-webhook/
✅ Eventos configurados (checkout.session.completed)
✅ Signing secret copiado a producción
```

---

## 🧪 CÓMO PROBAR

### 1. Configurar Stripe CLI:
```powershell
stripe listen --forward-to localhost:8000/api/orders/stripe-webhook/
```

### 2. Crear orden desde frontend:
```javascript
// Frontend hace POST
const order = await axios.post('/api/orders/create/', {
  items: [{ product: 1, quantity: 2 }]
});
// Response: { id: 72, status: "PENDING" }
```

### 3. Obtener URL de Stripe:
```javascript
const checkout = await axios.post(
  `/api/orders/${order.id}/create-checkout-session/`
);
// Response: { checkout_url: "https://checkout.stripe.com/..." }
```

### 4. Pagar con tarjeta de prueba:
```
Tarjeta: 4242 4242 4242 4242
Fecha: 12/34
CVC: 123
```

### 5. Verificar webhook recibido:
```
En la terminal de Stripe CLI deberías ver:
✅ --> checkout.session.completed [evt_...]
```

### 6. Verificar orden actualizada:
```
GET /api/orders/72/
Response: { id: 72, status: "PAID" }  ← Cambió de PENDING
```

---

## ⚠️ ERRORES COMUNES

### Error: "No such webhook endpoint"
**Causa:** URL del webhook incorrecta  
**Solución:**
```powershell
# Asegúrate de usar la nueva URL
stripe listen --forward-to localhost:8000/api/orders/stripe-webhook/
```

### Error: "Webhook signature verification failed"
**Causa:** STRIPE_WEBHOOK_SECRET no configurado o incorrecto  
**Solución:**
1. Copia el secret de la terminal de Stripe CLI
2. Agrégalo a `settings.py`:
   ```python
   STRIPE_WEBHOOK_SECRET = 'whsec_...'
   ```
3. Reinicia el servidor Django

### Error: "Invalid payload"
**Causa:** Backend no puede procesar el evento  
**Solución:**
- Revisa logs del servidor Django
- Verifica que la orden exista
- Confirma que el evento sea `checkout.session.completed`

---

## 📊 ESTADOS DE ORDEN

| Estado | Cuándo | Acción de Stripe |
|--------|--------|------------------|
| **PENDING** | Al crear orden | Ninguna |
| **PAID** | Después del webhook | ✅ Webhook actualiza |
| **SHIPPED** | Admin marca enviado | Ninguna |
| **DELIVERED** | Cliente recibe | Ninguna |
| **CANCELLED** | Admin cancela | Ninguna |

**Solo las órdenes PAID cuentan en reportes y ventas.**

---

## 🎯 RESUMEN DE CAMBIOS

### Lo que cambió:
- ✅ URL del webhook: `/api/stripe-webhook/` → `/api/orders/stripe-webhook/`

### Lo que NO cambió:
- ✅ URL de checkout session: `/api/orders/{id}/create-checkout-session/`
- ✅ Flujo de pago sigue igual
- ✅ Estados de orden siguen igual
- ✅ Frontend no necesita cambios en el código

### Lo que necesitas actualizar:
- ⚠️ Comando de Stripe CLI
- ⚠️ Webhook en Stripe Dashboard (producción)
- ✅ `api.js` ya está correcto

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `VERIFICACION_URLS_OFICIAL.md` - Todas las URLs verificadas
- `GUIA_RAPIDA_API.md` - Referencia rápida de endpoints
- Tu archivo de Stripe que compartiste - Guía completa

---

**✅ CONCLUSIÓN:**

El cambio de URL del webhook es **solo en el backend**. El frontend **no necesita cambios** porque no llama directamente al webhook. Solo necesitas actualizar:

1. ✅ Comando de Stripe CLI (desarrollo)
2. ✅ Webhook URL en Stripe Dashboard (producción)

**El código del frontend ya está correcto.** ✅

---

**Última actualización:** 19/10/2025  
**Estado:** ✅ Documentado  
**Impacto frontend:** ⚠️ Mínimo (solo configuración externa)
