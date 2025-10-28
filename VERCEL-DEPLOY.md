# 🚀 Deploy en Vercel - Guía Rápida

## 📋 Pre-requisitos

1. **Cuenta en Vercel**: [vercel.com](https://vercel.com)
2. **Vercel CLI instalado**:
   ```bash
   npm i -g vercel
   ```

## 🔧 Configuración

### 1. Variables de Entorno

En tu proyecto de Vercel, configura estas variables:

```bash
IOL_USER=tu_usuario_iol
IOL_PASS=tu_contraseña_iol
```

**💡 Cómo agregar variables de entorno en Vercel:**
- Ve a tu proyecto en vercel.com
- Click en "Settings" → "Environment Variables"
- Agrega cada variable con su valor

### 2. Build Settings

Vercel detectará automáticamente tu configuración, pero si necesitas cambiarla:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🚀 Deploy

### Opción 1: Desde CLI
```bash
# Login en Vercel (solo primera vez)
vercel login

# Deploy a producción
vercel --prod
```

### Opción 2: Desde GitHub
1. Conecta tu repositorio en vercel.com
2. Los deploys serán automáticos con cada push

## ✅ Verificación

Después del deploy:

1. **Health Check**:
   ```
   https://tu-proyecto.vercel.app/api/health
   ```

2. **Test IOL**:
   - Abre tu aplicación
   - Ve a configuración (⚙️)
   - Prueba las credenciales IOL

## 🐛 Troubleshooting

### Error: "Credenciales IOL no configuradas"
- ✅ Verifica que agregaste `IOL_USER` y `IOL_PASS` en Vercel
- ✅ Redeploy después de agregar variables

### Error: "Function timeout"
- ✅ IOL API puede ser lenta, es normal en la primera llamada

### Error: "SSL certificate"
- ✅ Ya está configurado para manejar este problema de IOL

## 📱 URLs de tu App

- **Producción**: `https://tu-proyecto.vercel.app`
- **API Health**: `https://tu-proyecto.vercel.app/api/health`
- **Cotizaciones**: `https://tu-proyecto.vercel.app/api/iol/quote/acciones/GGAL`

## 🔄 Updates

Para actualizar la aplicación:
```bash
# Cambios en código
git add .
git commit -m "fix: update feature"
git push

# O redeploy manual
vercel --prod
```

---

**🎉 ¡Tu aplicación está lista en Vercel!**

Las cotizaciones de IOL funcionarán automáticamente usando las credenciales configuradas en las variables de entorno.