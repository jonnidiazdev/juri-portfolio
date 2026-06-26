# 🚀 Quick Start - El Juri-Portfolio

## Inicio Inmediato

```bash
# 1. Instalar dependencias (solo primera vez)
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con JWT_SECRET y credenciales opcionales

# 3. Iniciar aplicación completa
npm run dev:full
```

## Acceso Rápido

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API (local)**: http://localhost:3000
- 📊 **React Query DevTools**: Click en ícono inferior izquierdo

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:full` | ✅ Inicia API local + frontend (RECOMENDADO) |
| `npm run dev` | Solo frontend (sin cotizaciones IOL) |
| `npm run dev:api` | Solo API local (`scripts/dev-api.js`) |
| `npm run dev:api:vercel` | API con Vercel CLI (requiere `vercel login`) |
| `npm run build` | Build producción |
| `npm run test:run` | Ejecutar tests |

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
| `.env` | ⚠️ JWT_SECRET y credenciales (NO subir a Git) |
| `api/` | Backend serverless IOL (dev + prod) |
| `src/App.tsx` | Lógica principal frontend |
| `README.md` | Documentación completa |

## Variables de Entorno

Crear `.env` en la raíz:

```bash
JWT_SECRET="tu-secreto-seguro"
IOL_USER=""
IOL_PASS=""
```

## Red corporativa / certificados SSL

`npm run dev:full` **no requiere `vercel login`**. El servidor local (`scripts/dev-api.js`) ejecuta los mismos handlers de `api/` sin conectarse a Vercel.

Si necesitás usar `vercel login` o `npm run dev:api:vercel` en una máquina empresarial y ves `unable to get local issuer certificate`, es porque Node no confía en el certificado raíz de tu empresa (proxy SSL).

**Opciones:**

1. **Usar el servidor local (recomendado):** `npm run dev:full` — no hace falta Vercel CLI.
2. **Agregar el CA corporativo a Node:**
   ```bash
   # Exportar el certificado raíz desde Acceso a Llaveros (macOS) como .pem
   export NODE_EXTRA_CA_CERTS=/ruta/al/certificado-empresa.pem
   vercel login
   ```
3. **Token manual** (desde otra red o el navegador en vercel.com/account/tokens):
   ```bash
   export NODE_EXTRA_CA_CERTS=/ruta/al/certificado-empresa.pem  # si aplica
   vercel login --token TU_TOKEN
   ```

Consultá a IT el archivo `.pem` del certificado raíz si no lo tenés.

## Solución Rápida de Problemas

**API no levanta:**
```bash
# Verificar puerto ocupado
lsof -i :3000

# Reiniciar
npm run dev:full
```

**Cotizaciones no actualizan:**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3000/api/health

# Si no responde, reiniciar
npm run dev:full
```

**Error de credenciales IOL:**
```bash
# Configurar credenciales desde la UI (Configuración)
# o verificar .env y reiniciar
npm run dev:full
```

## Estructura Rápida

```
juri-portfolio/
├── api/                    # Backend Vercel Functions (IOL proxy)
├── src/
│   ├── App.tsx             # UI principal
│   ├── hooks/              # React Query hooks
│   ├── components/         # Componentes UI
│   └── services/           # API clients
├── .env                    # ⚠️ Variables locales
├── .env.example           # Plantilla
└── package.json
```

## Próximos Pasos

1. ✅ Lee `README.md` para documentación completa
2. ✅ Abre React Query DevTools para debugging
3. ✅ Experimenta agregando diferentes activos

---

**¿Problemas?** Revisa la sección de troubleshooting en `README.md`
