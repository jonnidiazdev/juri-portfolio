# 🚀 Quick Start - El Juri-Portfolio

## Inicio Inmediato

```bash
# 1. Instalar dependencias (solo primera vez)
npm install

# 2. Configurar credenciales IOL en .env
cp .env.example .env
# Editar .env con tus credenciales reales

# 3. Iniciar aplicación completa
npm run dev:full
```

## Acceso Rápido

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:4000
- 📊 **React Query DevTools**: Click en ícono inferior izquierdo

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:full` | ✅ Inicia backend + frontend (RECOMENDADO) |
| `npm run dev` | Solo frontend (sin cotizaciones IOL) |
| `npm run server` | Solo backend proxy IOL |
| `npm run build` | Build producción |
| `./test-iol.sh` | Ejecutar tests de integración IOL |

## ⚠️ Importante

**SIEMPRE** usa `npm run dev:full` para tener:
- ✅ Cotizaciones cripto (CoinGecko)
- ✅ Cotización dólar blue/oficial (DolarAPI)
- ✅ Cotizaciones activos argentinos (IOL)

Si usas solo `npm run dev`:
- ❌ Las cotizaciones argentinas NO funcionarán
- ⚠️ Solo verás precios de compra para activos argentinos

## Primer Uso

1. **Agregar Bitcoin**
   - Tipo: Criptomoneda
   - ID: `bitcoin`
   - Cantidad: `0.01`
   - Precio Compra: `50000`

2. **Agregar GGAL**
   - Tipo: Acción Argentina
   - Ticker: `ggal`
   - Cantidad: `10`
   - Precio Compra: `1000`

3. **Agregar Plazo Fijo**
   - Tipo: Plazo Fijo
   - Banco: `Banco Nación`
   - Capital: `100000`
   - TNA: `85.5`
   - Fechas: inicio y vencimiento

4. **Ver Actualización Automática**
   - Espera 60 segundos
   - Los precios se actualizan solos
   - Los plazos fijos muestran progreso diario

## Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `.env` | ⚠️ Credenciales IOL (NO subir a Git) |
| `server/index.js` | Backend proxy seguro |
| `src/App.jsx` | Lógica principal frontend |
| `README.md` | Documentación completa |
| `TESTING.md` | Guía de pruebas detallada |

## Credenciales IOL

Crear `.env` en la raíz:

```bash
IOL_USER="tu_usuario_iol"
IOL_PASS="tu_contraseña_iol"
PORT=4000
```

## Solución Rápida de Problemas

**Servidor no levanta:**
```bash
# Verificar puerto ocupado
lsof -i :4000

# Reiniciar
npm run dev:full
```

**Cotizaciones no actualizan:**
```bash
# Verificar que backend esté corriendo
curl http://localhost:4000/api/health

# Si no responde, reiniciar
npm run dev:full
```

**Error de credenciales IOL:**
```bash
# Verificar .env
cat .env

# Actualizar credenciales y reiniciar
npm run dev:full
```

## Estructura Rápida

```
mi-portfolio/
├── server/index.js          # Backend proxy IOL
├── src/
│   ├── App.jsx             # UI principal
│   ├── hooks/              # React Query hooks
│   ├── components/         # Componentes UI
│   └── services/           # API clients
├── .env                    # ⚠️ Credenciales (local)
├── .env.example           # Plantilla
└── package.json
```

## Próximos Pasos

1. ✅ Lee `README.md` para documentación completa
2. ✅ Lee `TESTING.md` para casos de prueba
3. ✅ Abre React Query DevTools para debugging
4. ✅ Experimenta agregando diferentes activos

---

**¿Problemas?** Revisa `TESTING.md` sección Troubleshooting
