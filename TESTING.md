# 🧪 Guía de Pruebas - IOL Integration

## Inicio Rápido

### 1. Iniciar la Aplicación

```bash
npm run dev:full
```

Esto iniciará:
- ✅ Backend IOL proxy en http://localhost:4000
- ✅ Frontend React en http://localhost:5173

## Verificar Backend

### Health Check

```bash
curl http://localhost:4000/api/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T..."
}
```

### Probar Cotización de Acción (GGAL)

```bash
curl http://localhost:4000/api/iol/quote/acciones/GGAL
```

**Respuesta esperada:**
```json
{
  "data": {
    "simbolo": "GGAL",
    "ultimoPrecio": 1234.56,
    "puntas": { ... },
    ...
  }
}
```

### Probar Cotización de Bono (AL30)

```bash
curl http://localhost:4000/api/iol/quote/bonos/AL30
```

### Script de Prueba Automatizado

```bash
./test-iol.sh
```

Este script ejecuta:
1. Health check
2. Cotización de GGAL (acción)
3. Cotización de AL30 (bono)

## Probar Frontend

### 1. Abrir la Aplicación

Navega a: http://localhost:5173

### 2. Agregar Activo Cripto

1. Click en "Agregar Activo"
2. Tipo: **Criptomoneda**
3. ID: `bitcoin`
4. Nombre: `Bitcoin`
5. Cantidad: `0.01`
6. Precio de Compra: `50000`
7. Click "Agregar"

**Resultado esperado:**
- Se agrega Bitcoin al portfolio
- Se muestra el precio actual desde CoinGecko
- Se calcula ganancia/pérdida en USD
- Se convierte a ARS usando dólar blue

### 3. Agregar Activo Argentino

1. Click en "Agregar Activo"
2. Tipo: **Acción Argentina**
3. Ticker: `ggal`
4. Nombre: `Grupo Financiero Galicia`
5. Cantidad: `10`
6. Precio de Compra: `1000`
7. Click "Agregar"

**Resultado esperado:**
- Se agrega GGAL al portfolio
- Se obtiene precio actual desde IOL API
- Se calcula ganancia/pérdida en ARS
- Aparece en la sección "Mercado Argentino"

### 4. Verificar Actualización Automática

- Espera 60 segundos
- Observa el mensaje "Actualizando cotizaciones..." en la esquina inferior derecha
- Los precios se actualizan automáticamente

### 5. Verificar React Query DevTools

1. Busca el ícono de React Query en la esquina inferior izquierda
2. Click para abrir DevTools
3. Verifica las queries:
   - `cryptoPrices` - Precios de cripto
   - `dolarPrice` - Cotización dólar
   - `argentineQuotes` - Cotizaciones IOL
4. Observa el estado: `fresh`, `fetching`, `stale`
5. Verifica los `dataUpdatedAt` timestamps

## Casos de Prueba

### ✅ Caso 1: Portfolio Mixto

**Setup:**
- 2 criptomonedas (bitcoin, ethereum)
- 2 acciones argentinas (GGAL, YPF)
- 1 bono (AL30)

**Verificar:**
- Resumen total en ARS es correcto
- Conversión cripto a ARS usa dólar blue
- Activos argentinos se muestran en ARS
- Ganancia/pérdida se calcula correctamente

### ✅ Caso 2: Editar Activo

**Pasos:**
1. Hover sobre un activo
2. Click en ícono de edición
3. Cambiar cantidad o precio de compra
4. Guardar

**Verificar:**
- Los cálculos se actualizan instantáneamente
- El resumen total se recalcula
- La query NO se invalida (pending feature)

### ✅ Caso 3: Eliminar Activo

**Pasos:**
1. Hover sobre un activo
2. Click en ícono de eliminar
3. Confirmar

**Verificar:**
- El activo se elimina del portfolio
- El resumen total se actualiza
- La query se limpia si no quedan activos de ese tipo

### ⚠️ Caso 4: Error de Autenticación IOL

**Simular:**
- Detener el backend o usar credenciales inválidas en `.env`

**Verificar:**
- El frontend muestra mensaje de error (pending mejor handling)
- El precio fallback es el precio de compra
- La aplicación no crashea

### ⚠️ Caso 5: Activo Inexistente

**Pasos:**
1. Agregar activo con ticker inválido: `NOEXISTE`

**Verificar:**
- El backend retorna error 404 o similar
- El frontend usa precio de compra como fallback
- Se muestra indicador de error (pending feature)

## Troubleshooting

### Backend No Responde

```bash
# Verificar que el puerto 4000 esté libre
lsof -i :4000

# Reiniciar backend solo
npm run server
```

### Error "unable to get local issuer certificate"

**Causa**: Node.js no puede validar el certificado SSL de IOL

**Solución**: Ya está implementado en el servidor. El código usa `rejectUnauthorized: false` para desarrollo.

```javascript
// En server/index.js
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})
```

**Nota**: En producción, considera usar certificados válidos o configurar un certificado CA específico.

### Frontend No Conecta al Backend

1. Verificar que `.env` tenga las credenciales correctas
2. Verificar que el backend esté corriendo en puerto 4000
3. Revisar console del navegador para errores CORS o de red

### Token IOL Expirado

```bash
# Forzar refresh del token
curl -X POST http://localhost:4000/api/iol/refresh-token
```

### Query No Actualiza

1. Abrir React Query DevTools
2. Buscar la query problemática
3. Click en "Refetch" manual
4. Verificar `dataUpdatedAt` y `staleTime`

## Logs y Monitoreo

### Backend Logs

Los logs del backend aparecen en la terminal con prefijo `[0]`:

```
[0] IOL proxy server running on port 4000
```

### Frontend Logs

Los logs de Vite aparecen con prefijo `[1]`:

```
[1] VITE v7.1.12 ready in 126 ms
[1] ➜ Local: http://localhost:5173/
```

### React Query DevTools

- Estado de queries en tiempo real
- Timestamps de última actualización
- Errores y reintentos
- Cache entries

## Métricas de Performance

### Tiempos Esperados

- Health check: < 50ms
- Cotización IOL: 200-500ms (primera vez)
- Cotización IOL (cached token): 100-300ms
- Precio cripto: 200-400ms
- Precio dólar: 100-200ms

### Cache Hit Ratio

- Token IOL: ~99% (expira cada 24h)
- Queries React Query: ~95% (staleTime 60s)

## Troubleshooting

| Problema | Causa Probable | Solución |
|----------|---------------|----------|
| Backend no inicia | Puerto 4000 ocupado | Cambiar PORT en .env |
| Error 401 IOL | Credenciales inválidas | Verificar IOL_USER/IOL_PASS |
| Precios no actualizan | Backend no corre | `npm run dev:full` |
| CORS error | Backend no corre | Verificar que backend esté en :4000 |
| Query stale | Cache issue | Invalidar manualmente en DevTools |

## Next Steps

Una vez que todo funcione:

1. ✅ Agregar indicadores de fuente de precio (API vs manual)
2. ✅ Mejorar error handling con badges visuales
3. ✅ Invalidar queries tras edición de activos
4. ✅ Agregar timestamps de última actualización
5. ✅ Rate limiting y retry logic
