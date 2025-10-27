# 🎯 Guía Rápida: Configuración de Credenciales

## ¿Por qué necesito configurar credenciales?

Para obtener **cotizaciones en tiempo real** de activos argentinos (acciones, CEDEARs, bonos, letras) desde InvertirOnline, necesitas autenticarte con su API usando tus credenciales.

## 📱 Configuración Desde la Interfaz (Recomendado)

### Paso 1: Abrir Configuración

1. Inicia la aplicación (`npm run dev:full`)
2. Busca el **ícono de engranaje ⚙️** en la esquina superior derecha
3. Si no has configurado credenciales, el botón estará **resaltado en amarillo** con un punto pulsante

### Paso 2: Ingresar Credenciales

1. Click en el ícono de configuración
2. En el modal que aparece, ingresa:
   - **Usuario IOL**: Tu nombre de usuario de InvertirOnline
   - **Contraseña IOL**: Tu contraseña de InvertirOnline
3. Opcional: Click en el ícono de ojo 👁️ para ver la contraseña mientras la escribes

### Paso 3: Probar Conexión (Opcional pero Recomendado)

1. Click en el botón **"Probar Conexión"**
2. Espera unos segundos
3. Verás un mensaje:
   - ✅ "Conexión exitosa con IOL" → Tus credenciales son correctas
   - ❌ "Credenciales inválidas" → Revisa usuario/contraseña

### Paso 4: Guardar

1. Click en **"Guardar"**
2. Verás un mensaje de confirmación verde
3. El modal se cerrará automáticamente

¡Listo! Tus credenciales están configuradas. 🎉

## 🔄 Cómo Funciona

### Al Agregar un Activo Argentino

1. Agregas una acción (ej: GGAL), CEDEAR (ej: AAPL), bono (ej: AL30), etc.
2. La app automáticamente:
   - Lee tus credenciales desde localStorage
   - Las envía al backend en headers seguros
   - Backend autentica con IOL
   - Obtiene la cotización actual
   - Muestra el precio en tu tarjeta de activo

### Actualización Automática

- Las cotizaciones se actualizan **cada 60 segundos** automáticamente
- No necesitas refrescar la página manualmente
- React Query maneja el caché inteligentemente

## 🔒 Seguridad

### ¿Dónde se guardan mis credenciales?

- **localStorage de tu navegador** (en tu computadora)
- **NO** en ningún servidor externo
- **NO** en archivos del proyecto

### ¿Son seguras?

✅ **Ventajas**:
- Solo tú tienes acceso
- No se comparten con terceros
- El backend solo las usa para autenticar con IOL

⚠️ **Consideraciones**:
- Están en texto plano en localStorage
- Si alguien tiene acceso a tu navegador, podría verlas
- Se pierden si limpias los datos del navegador

👉 **Lee** [SECURITY.md](./SECURITY.md) para más detalles.

## ❌ Eliminar Credenciales

Si quieres borrar tus credenciales:

1. Abre el modal de Configuración
2. Click en el botón rojo **"Eliminar"**
3. Confirma la acción

Esto borrará las credenciales de tu navegador. Ya no podrás obtener cotizaciones argentinas hasta que las configures nuevamente.

## 🐛 Solución de Problemas

### "Credenciales inválidas" al probar conexión

**Posibles causas**:
- Usuario o contraseña incorrectos
- Cuenta IOL bloqueada o suspendida
- Problemas de conexión con IOL

**Soluciones**:
1. Verifica que tu usuario y contraseña sean correctos
2. Intenta iniciar sesión en [invertironline.com](https://www.invertironline.com) para confirmar
3. Verifica tu conexión a internet

### No se obtienen cotizaciones de activos argentinos

**Verifica**:
1. ¿Configuraste las credenciales? (botón de configuración amarillo = falta configurar)
2. ¿Probaste la conexión con éxito?
3. ¿El backend está corriendo? (debe estar en `http://localhost:4000`)

**Prueba manual**:
```bash
# En otra terminal
curl -s http://localhost:4000/api/health
```

Debería retornar: `{"status":"ok","timestamp":"..."}`

### Las credenciales se pierden al cerrar el navegador

Esto **no debería pasar** porque están en localStorage (persiste).

**Si te pasa**:
- Verifica que no estés en modo **incógnito/privado**
- Revisa que no tengas configurado el navegador para limpiar datos al cerrar
- Prueba con otro navegador

### Quiero usar variables de entorno como antes

Puedes seguir usando `.env`:

1. Crea archivo `.env` en la raíz del proyecto (usa `.env.example` como base)
2. Agrega:
   ```
   IOL_USER="tu_usuario"
   IOL_PASS="tu_contraseña"
   ```
3. El backend usa `.env` como **fallback** si no encuentra credenciales en los headers

**Nota**: Las credenciales del navegador tienen **prioridad** sobre `.env`.

## 💡 Tips

### Para Múltiples Usuarios

Si varias personas usan la app en diferentes navegadores:
- Cada uno configura sus propias credenciales
- No necesitan compartir un archivo `.env`
- Más seguro y flexible

### Para Desarrollo

Si eres el único desarrollador:
- Puedes usar `.env` para no tener que configurar en cada navegador
- O configurar una vez en tu navegador principal

### Backup de Credenciales

Tus credenciales están en localStorage bajo las keys:
- `iol-user`
- `iol-pass`

Puedes verlas en DevTools del navegador:
1. F12 → Application → Local Storage → http://localhost:5173
2. Busca `iol-user` y `iol-pass`

## 📚 Más Información

- **Seguridad completa**: [SECURITY.md](./SECURITY.md)
- **Documentación IOL**: [README.md](./README.md)
- **Guía multi-moneda**: [MULTI-CURRENCY.md](./MULTI-CURRENCY.md)
- **Tipos de dólar**: [DOLAR-TYPES.md](./DOLAR-TYPES.md)

---

**¿Dudas?** Revisa los documentos arriba o abre un issue en GitHub.
