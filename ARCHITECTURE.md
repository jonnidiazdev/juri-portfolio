# 🏗️ Arquitectura Backend - El Juri-Portfolio

## 📋 **Resumen**

El proyecto usa **Vercel Serverless Functions** tanto en desarrollo como en producción:

### 🔧 **Desarrollo Local**
- **Handlers**: `api/` (mismos que producción)
- **Runner**: `scripts/dev-api.js` (Express liviano, sin Vercel CLI)
- **Comando**: `npm run dev:full`
- **Puerto API**: 3000 (proxy Vite en `/api`)
- **Alternativa**: `npm run dev:api:vercel` si tenés `vercel login` (red sin proxy SSL)

### 🌐 **Producción (Vercel)**
- **Ubicación**: `api/`
- **Tecnología**: Vercel Serverless Functions
- **Deploy**: Automático via GitHub

---

## 🚀 **Comandos de Desarrollo**

```bash
# Desarrollo completo (API local + React) — no requiere vercel login
npm run dev:full

# Solo frontend (sin cotizaciones IOL)
npm run dev

# Solo API local
npm run dev:api

# API con Vercel CLI (opcional, requiere vercel login)
npm run dev:api:vercel
```

---

## 📡 **APIs Disponibles**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/iol/login` | POST | Crear sesión JWT |
| `/api/iol/test-credentials` | POST | Validar credenciales |
| `/api/iol/quote/:tipo/:simbolo` | GET | Obtener cotización |

---

## 🔄 **Sesiones IOL**

- **Modelo**: JWT firmado con `JWT_SECRET`
- **Token**: JWT con credenciales codificadas en base64
- **Estado**: Stateless (sin memoria compartida)
- **Frontend**: guarda `iol-session-token` en localStorage

---

## 🔗 **Flujo de Desarrollo**

```
Vite (:5173)  →  proxy /api  →  scripts/dev-api.js (:3000)  →  api/*.js  →  IOL API
```

El frontend siempre usa URLs relativas (`/api/...`). En desarrollo, Vite redirige al servidor de Vercel.

---

## 📝 **Notas Importantes**

1. **Mismo backend en dev y prod**: evita divergencias de comportamiento
2. **JWT_SECRET requerido**: configurar en `.env` para desarrollo local
3. **Deploy**: push a GitHub, Vercel despliega automáticamente

---

*Última actualización: junio 2026*
