# 🚀 Despliegue del Frontend en Vercel - README

## 📁 Archivos de Despliegue Disponibles

Este proyecto incluye documentación completa para desplegar el frontend en Vercel:

### 📚 Documentación:
1. **`GUIA_DESPLIEGUE_FRONTEND_VERCEL.md`** - Guía detallada paso a paso
2. **`CHECKLIST_DESPLIEGUE_FRONTEND.md`** - Lista de verificación completa
3. **`VARIABLES_ENTORNO_FRONTEND.env`** - Variables de entorno para todos los frameworks
4. **`README_DESPLIEGUE.md`** (este archivo) - Inicio rápido

### 🔧 Scripts:
- **`update_cors_for_vercel.ps1`** - Script PowerShell (Windows)
- **`update_cors_for_vercel.sh`** - Script Bash (Linux/Mac)

---

## ⚡ Inicio Rápido

### 1️⃣ **Configurar Variables de Entorno**

**Para React (Vite):**
```bash
# Crea un archivo .env.production
VITE_API_URL=http://98.92.49.243/api
```

**Para React (CRA):**
```bash
REACT_APP_API_URL=http://98.92.49.243/api
```

**Para Next.js:**
```bash
NEXT_PUBLIC_API_URL=http://98.92.49.243/api
```

### 2️⃣ **Probar Build Local**

```bash
npm install
npm run build
```

### 3️⃣ **Desplegar en Vercel**

**Opción A: Desde GitHub (Recomendado)**
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Click "New Project" → Importa tu repo
4. Agrega las variables de entorno en Settings

**Opción B: Con Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 4️⃣ **Actualizar CORS en el Backend**

**Windows (PowerShell):**
```powershell
.\update_cors_for_vercel.ps1 -VercelDomain "tu-app.vercel.app"
```

**Linux/Mac:**
```bash
chmod +x update_cors_for_vercel.sh
./update_cors_for_vercel.sh tu-app.vercel.app
```

---

## 📋 Checklist Rápido

- [ ] Variables de entorno configuradas
- [ ] Build local exitoso
- [ ] Código subido a GitHub (o deployado con CLI)
- [ ] Proyecto desplegado en Vercel
- [ ] Variables de entorno agregadas en Vercel
- [ ] Script de CORS ejecutado en el backend
- [ ] Prueba de login funcional
- [ ] Sin errores de CORS en consola

---

## 🎯 Configuración en Vercel Dashboard

1. **Ve a Settings → Environment Variables**
2. **Agrega según tu framework:**
   - **React (Vite):** `VITE_API_URL` = `http://98.92.49.243/api`
   - **React (CRA):** `REACT_APP_API_URL` = `http://98.92.49.243/api`
   - **Next.js:** `NEXT_PUBLIC_API_URL` = `http://98.92.49.243/api`
3. **Selecciona:** Production ✓, Preview ✓, Development ✓
4. **Redeploy** desde Deployments

---

## 🔐 Backend Desplegado

**URL Backend:** `http://98.92.49.243`
**Endpoints API:** `http://98.92.49.243/api/`
**Admin Panel:** `http://98.92.49.243/admin/`

### Credenciales de Prueba:
```
Cliente:  juan_cliente  / password123
Manager:  carlos_manager / manager123
Admin:    admin         / admin123
```

---

## 🆘 Solución de Problemas

### ❌ Error: "CORS policy: No 'Access-Control-Allow-Origin'"
**Solución:** Ejecuta el script `update_cors_for_vercel.ps1` o `.sh`

### ❌ Error: "Invalid HTTP_HOST header"
**Solución:** Verifica que tu dominio de Vercel esté en `ALLOWED_HOSTS`

### ❌ Error: "Mixed Content"
**Solución:** Agrega en `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

### ❌ Build falla en Vercel
**Solución:** 
1. Revisa logs en Vercel Dashboard
2. Prueba `npm run build` localmente
3. Verifica versión de Node.js

---

## 📚 Documentación Completa

Para instrucciones detalladas, consulta:

- **`frontend_docs/GUIA_DESPLIEGUE_FRONTEND_VERCEL.md`** - Guía paso a paso completa
- **`frontend_docs/CHECKLIST_DESPLIEGUE_FRONTEND.md`** - Lista exhaustiva
- **`frontend_docs/VARIABLES_ENTORNO_FRONTEND.env`** - Todas las variables

---

## 🔄 Actualizar CORS Manualmente

Si los scripts no funcionan, conecta por SSH:

```bash
# 1. Conectar
ssh -i django-backend-key.pem ubuntu@98.92.49.243

# 2. Editar .env
cd /var/www/django-backend
sudo nano .env

# 3. Actualizar estas líneas:
ALLOWED_HOSTS=98.92.49.243,localhost,127.0.0.1,tu-app.vercel.app
CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app,http://localhost:3000

# 4. Reiniciar servicios
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# 5. Verificar
sudo systemctl status gunicorn
sudo systemctl status nginx
```

---

## 🎉 URLs Finales

Una vez desplegado:

- **Frontend:** `https://tu-app.vercel.app`
- **Backend API:** `http://98.92.49.243/api`
- **Admin:** `http://98.92.49.243/admin`

---

## 📞 Soporte

**Documentación adicional en:**
- `frontend_docs/` - Carpeta con toda la documentación
- `IMPLEMENTACION_COMPLETA_DEVOLUCIONES_BILLETERA.md` - Funcionalidades implementadas

**Archivos clave:**
- `.env.production` - Variables de entorno (crear)
- `vite.config.js` / `package.json` - Configuración del proyecto
- `update_cors_for_vercel.ps1` - Script para Windows
- `update_cors_for_vercel.sh` - Script para Linux/Mac

---

**¡Listo para desplegar! 🚀**
