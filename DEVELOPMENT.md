# 💡 Development Tips

## Comandos Útiles Durante Desarrollo

### Reiniciar Solo Backend

```bash
# Si cambias código del backend, reinicia solo el server
npm run server
```

### Ver Logs del Backend en Tiempo Real

Los logs del backend (prefijo `[0]`) incluyen:
- Inicio del servidor
- Solicitudes de token
- Errores de autenticación
- Respuestas de IOL API

### Debuggear React Query

1. Abre la app: http://localhost:5173
2. Click en ícono React Query (esquina inferior izquierda)
3. Expande las queries para ver:
   - `cryptoPrices` - Estado de precios cripto
   - `dolarPrice` - Estado dólar blue/oficial
   - `argentineQuotes` - Estado cotizaciones IOL
4. Acciones útiles:
   - **Refetch**: Forzar actualización inmediata
   - **Invalidate**: Marcar como stale
   - **Reset**: Limpiar caché

### Hot Reload

- **Frontend**: Vite HMR automático al guardar archivos `.jsx`, `.css`
- **Backend**: Requiere reinicio manual (o usar nodemon)

### Agregar Nodemon (Opcional)

Para hot reload del backend:

```bash
npm install -D nodemon
```

Actualizar `package.json`:

```json
{
  "scripts": {
    "server": "nodemon server/index.js",
    "server:prod": "node server/index.js"
  }
}
```

## Testing de Endpoints

### Probar Health Check

```bash
curl http://localhost:4000/api/health
```

### Probar Cotización Específica

```bash
# Acción
curl http://localhost:4000/api/iol/quote/acciones/GGAL

# CEDEAR
curl http://localhost:4000/api/iol/quote/cedears/AAPL

# Bono
curl http://localhost:4000/api/iol/quote/bonos/AL30

# Letra
curl http://localhost:4000/api/iol/quote/letras/S31O4
```

### Ver Respuesta Formateada (con jq)

```bash
curl -s http://localhost:4000/api/iol/quote/acciones/GGAL | jq .
```

### Ver Headers de Respuesta

```bash
curl -i http://localhost:4000/api/iol/quote/acciones/GGAL
```

### Forzar Refresh de Token

```bash
curl -X POST http://localhost:4000/api/iol/refresh-token
```

## Debugging de Errores Comunes

### Error: "Failed to fetch"

**Causa**: Backend no está corriendo

**Solución**:
```bash
npm run dev:full
```

### Error: "Credenciales IOL faltantes"

**Causa**: Archivo `.env` no existe o está mal configurado

**Solución**:
```bash
# Crear .env desde ejemplo
cp .env.example .env

# Editar con tus credenciales
nano .env
```

### Error 401 de IOL

**Causa**: Credenciales inválidas o token expirado

**Solución**:
```bash
# Verificar credenciales en .env
cat .env

# Forzar refresh de token
curl -X POST http://localhost:4000/api/iol/refresh-token
```

### Error "unable to get local issuer certificate"

**Problema**: Error SSL al conectar con API de IOL
```
Error: unable to get local issuer certificate
```

**Causa**: Node.js no puede validar el certificado SSL de la API de IOL.

**Solución Implementada**: El servidor ya incluye configuración para manejar esto:

```javascript
// server/index.js
import https from 'https'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false  // Solo para desarrollo
})

// Usar en todas las peticiones axios
await axios.get(url, { httpsAgent })
await axios.post(url, data, { httpsAgent })
```

**Alternativas para Producción**:

1. **Usar certificados CA específicos**:
```javascript
const httpsAgent = new https.Agent({
  ca: fs.readFileSync('path/to/ca-certificate.pem')
})
```

2. **Variable de entorno** (no recomendado para producción):
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node server/index.js
```

3. **Actualizar certificados del sistema**:
```bash
# macOS
brew install ca-certificates

# Linux
sudo apt-get install ca-certificates
```

### Query Stuck en "Loading"

**Causa**: Backend no responde o endpoint incorrecto

**Debug**:
1. Abrir React Query DevTools
2. Ver estado de la query
3. Verificar `error` si existe
4. Check backend logs en terminal

### CORS Error

**Causa**: Backend no tiene CORS habilitado o no está corriendo

**Solución**:
- Backend ya tiene `cors()` habilitado
- Verifica que backend esté en puerto 4000
- Verifica que frontend apunte a http://localhost:4000

## Estructura de Datos IOL

### Respuesta Típica de Acción

```json
{
  "data": {
    "simbolo": "GGAL",
    "puntas": {
      "cantidadCompra": 100,
      "precioCompra": 1234.50,
      "precioVenta": 1235.00,
      "cantidadVenta": 200
    },
    "ultimoPrecio": 1234.75,
    "variacionPorcentual": 2.5,
    "apertura": 1200.00,
    "maximo": 1240.00,
    "minimo": 1195.00,
    "cierreAnterior": 1205.00
  }
}
```

### Mapeo de Campos en Frontend

En `useArgentineQuotes.js`:

```javascript
const precio = q.ultimoPrecio ?? q.precioAjuste ?? q.precioPromedio ?? 0
```

**Prioridad**:
1. `ultimoPrecio` - Precio de última negociación
2. `precioAjuste` - Precio ajustado (bonos)
3. `precioPromedio` - Precio promedio ponderado
4. `0` - Fallback si no hay datos

## localStorage Debugging

### Ver Activos Guardados

Abre DevTools → Application → Local Storage → http://localhost:5173

```javascript
// En consola del navegador
const assets = JSON.parse(localStorage.getItem('portfolio-assets'))
console.log(assets)
```

### Limpiar Portfolio

```javascript
localStorage.removeItem('portfolio-assets')
location.reload()
```

### Backup de Portfolio

```javascript
const backup = localStorage.getItem('portfolio-assets')
console.log(backup) // Copiar y guardar
```

### Restaurar Portfolio

```javascript
const backupData = '...' // Tu JSON guardado
localStorage.setItem('portfolio-assets', backupData)
location.reload()
```

## Performance Monitoring

### Medir Tiempo de Query

En React Query DevTools:
- `dataUpdatedAt` - Timestamp de última actualización
- `Time` - Duración de última petición

### Monitorear Cache Hit Rate

Las queries con `staleTime: 60000` deberían:
- Usar caché ~95% del tiempo
- Solo refetch cada 60s

### Backend Response Time

Esperado:
- Health check: < 50ms
- IOL quote (token cached): 100-300ms
- IOL quote (new token): 500-1000ms

## VS Code Tips

### Extensiones Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-node-debug2"
  ]
}
```

### Snippets Útiles

**Agregar nuevo tipo de activo:**
1. Actualizar `ASSET_TYPES` en `src/config/constants.js`
2. Actualizar `AddAssetModal.jsx` - opciones de select
3. Actualizar `AssetCard.jsx` - getAssetTypeLabel

**Agregar nueva query:**
1. Crear hook en `src/hooks/`
2. Usar `useQuery` con `queryKey` único
3. Configurar `staleTime` y `refetchInterval`
4. Consumir en `App.jsx`

## Git Workflow

### Antes de Commit

```bash
# Verificar que .env no esté staged
git status

# Si .env aparece, descartar
git restore --staged .env
```

### .gitignore Verificación

```bash
# Verificar que .env esté ignorado
git check-ignore .env
# Debe retornar: .env
```

### Commits Recomendados

```bash
git add .
git commit -m "feat: add IOL integration for Argentine assets"
git commit -m "fix: handle missing price in IOL response"
git commit -m "docs: update README with IOL setup"
```

## Próximas Mejoras (TODO)

### Backend
- [ ] Persistent token storage (Redis o SQLite)
- [ ] Rate limiting middleware
- [ ] Request retry logic
- [ ] Error classification (auth vs network vs data)
- [ ] Logging framework (Winston/Pino)

### Frontend
- [ ] Price source indicators (API/manual/error)
- [ ] Last update timestamps
- [ ] Manual refresh button per asset
- [ ] Invalidate queries after edit
- [ ] Offline mode support
- [ ] Export portfolio to CSV

### Testing
- [ ] Unit tests (Vitest)
- [ ] Integration tests (Playwright)
- [ ] E2E tests
- [ ] Performance benchmarks

## Recursos

- [React Query Docs](https://tanstack.com/query/latest)
- [IOL API Docs](https://api.invertironline.com/swagger)
- [Vite Docs](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
