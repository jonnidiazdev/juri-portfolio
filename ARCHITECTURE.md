# 🏗️ Arquitectura Backend - El Juri-Portfolio

## 📋 **Resumen**

Este proyecto mantiene **dos sistemas backend** para diferentes entornos:

### 🔧 **Desarrollo Local**
- **Ubicación**: `server/index.js`
- **Tecnología**: Express.js
- **Comando**: `npm run dev:full`
- **Puerto**: `4000`

### 🌐 **Producción (Vercel)**
- **Ubicación**: `api/`
- **Tecnología**: Vercel Serverless Functions
- **Deploy**: Automático via GitHub

---

## 🎯 **¿Cuándo usar cada uno?**

### 🔧 **Express (Desarrollo)**
```bash
# Para desarrollo local
npm run dev:full
```

**Características:**
- ✅ Sesiones en memoria (Map)
- ✅ Hot reload
- ✅ Fácil debugging
- ✅ No requiere Vercel CLI

### 🌐 **Vercel Functions (Producción)**
```bash
# Solo en producción automática
git push origin main
```

**Características:**
- ✅ JWT tokens (sin estado)
- ✅ Escalable
- ✅ Deploy automático
- ✅ Sin configuración de servidor

---

## 📡 **APIs Disponibles**

### Ambos sistemas exponen las mismas rutas:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/iol/login` | POST | Crear sesión/JWT |
| `/api/iol/test-credentials` | POST | Validar credenciales |
| `/api/iol/quote/:tipo/:simbolo` | GET | Obtener cotización |

---

## 🔄 **Diferencias Internas**

### Express (Desarrollo)
- **Sesiones**: Map en memoria
- **Token**: Random hex (32 bytes)
- **Estado**: Persistente durante ejecución

### Vercel (Producción)  
- **Sesiones**: JWT firmado
- **Token**: JWT con credenciales encriptadas
- **Estado**: Stateless (sin memoria compartida)

---

## 🚀 **Comandos de Desarrollo**

```bash
# Desarrollo completo (Express + React)
npm run dev:full

# Solo frontend (sin cotizaciones IOL)
npm run dev

# Solo servidor Express
npm run server
```

---

## 📝 **Notas Importantes**

1. **No mezclar sistemas**: En desarrollo usa Express, en producción usa Vercel
2. **Misma API**: Ambos sistemas exponen interfaces idénticas
3. **Deploy**: Solo pushear a GitHub, Vercel se encarga automáticamente
4. **Testing**: Usar Express local para pruebas rápidas

---

*Última actualización: 28 de octubre de 2025*