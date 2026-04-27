# 📊 El Juri-Portfolio

Aplicación web moderna para gestionar y monitorear tu portfolio de inversiones: criptomonedas y activos argentinos (acciones, CEDEARs, bonos, letras) en tiempo real.

## ✨ Características

- 📈 **Monitoreo en Tiempo Real** - Cotizaciones actualizadas cada minuto usando React Query
- 🇦🇷 **Mercado Argentino** - Integración con InvertirOnline (IOL) para precios reales
- 💱 **Multi-Moneda** - Soporte para activos en ARS y USD con conversión automática
- 💵 **7 Cotizaciones del Dólar** - Blue, Oficial, MEP, CCL, Mayorista, Cripto y Tarjeta
-  **Conversión Automática** - Cotización del dólar blue y MEP para conversión ARS/USD
- 💼 **Gestión Completa** - Agrega, edita y elimina activos de tu portfolio
- ⚙️ **Configuración Segura** - Credenciales IOL guardadas localmente en tu navegador
- 🔄 **Caché Inteligente** - React Query optimiza las peticiones y reduce llamadas a APIs
- 📱 **Responsive** - Diseño adaptable a todos los dispositivos
- ☁️ **Persistencia en la Nube (opcional)** - Tus holdings se sincronizan con Firebase Firestore (fallback local si no está configurado)
- 🔐 **Acceso con Google** - El ingreso a la app se realiza con Firebase Authentication (Google)
- 🔒 **Seguridad** - Credenciales manejadas de forma segura, nunca enviadas a terceros

## 🚀 Tecnologías

### Frontend
- **React 19** - Biblioteca UI moderna
- **Vite 7** - Build tool ultra rápido con HMR
- **TanStack Query (React Query v5)** - Gestión de estado del servidor y caché
- **Tailwind CSS v4** - Sistema de estilos utility-first

### Backend
- **Express** - Servidor proxy para IOL API
- **Axios** - Cliente HTTP para peticiones
- **Node.js** - Runtime para backend

### APIs Externas
- **CoinGecko API** - Cotizaciones de criptomonedas
- **DolarAPI** - Cotización del dólar blue y oficial
- **InvertirOnline API** - Cotizaciones del mercado argentino

## 📦 Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Credenciales IOL

#### Opción A: Desde la Interfaz (Recomendado) 🌟

1. Abre la aplicación en tu navegador
2. Click en el **ícono de configuración** ⚙️ (esquina superior derecha)
3. Ingresa tu usuario y contraseña de InvertirOnline
4. Click en "Probar Conexión" para verificar (opcional)
5. Click en "Guardar"

**Ventajas**:
- No necesitas editar archivos
- Credenciales guardadas localmente en tu navegador
- Cada usuario puede tener sus propias credenciales
- Más seguro que archivo `.env` compartido

**Nota**: Ver [SECURITY.md](./SECURITY.md) para entender cómo se manejan las credenciales.

📖 **Guía detallada**: [CREDENTIALS-GUIDE.md](./CREDENTIALS-GUIDE.md)

#### Opción B: Variables de Entorno (Fallback)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Credenciales InvertirOnline (fallback si no hay en localStorage)
IOL_USER="tu_usuario_iol"
IOL_PASS="tu_contraseña_iol"

# Puerto servidor backend (opcional, por defecto 4000)
PORT=4000
```

**⚠️ IMPORTANTE:**
- El archivo `.env` está en `.gitignore` para proteger tus credenciales
- Usa `.env.example` como referencia
- NUNCA subas tus credenciales reales a Git

### 2.5 Configurar Firebase (Opcional)

Si querés que el portfolio deje de depender solo del navegador y quede persistido en la nube, completá estas variables en tu `.env`:

```bash
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_FIREBASE_MEASUREMENT_ID=""
```

Si no están configuradas, la app usa persistencia local automáticamente.

### 2.6 Configurar Seguridad de Firestore (Recomendado)

La app sincroniza el portfolio en documentos con formato `portfolios/{uid}` y requiere inicio de sesión con Google para identificar al usuario.

1. En Firebase Console, habilitá **Authentication > Sign-in method > Google**.
2. En Firestore Database, usá reglas seguras por usuario autenticado.
3. Desde el proyecto, desplegá reglas:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

El repo ya incluye `firestore.rules` y `firebase.json` para este despliegue.

### 2.7 Política de credenciales IOL

- El login de la app (portfolio) es exclusivamente con Google.
- La autenticación de IOL se mantiene **local** en el navegador mediante `iol-session-token`.
- No se guardan credenciales de IOL en Firebase.

### 3. Iniciar la Aplicación

#### Desarrollo Completo (Backend + Frontend)

```bash
npm run dev:full
```

Esto iniciará:
- Backend proxy IOL en `http://localhost:4000`
- Frontend Vite en `http://localhost:5173`

#### Solo Frontend (sin cotizaciones IOL)

```bash
npm run dev
```

#### Solo Backend

```bash
npm run server
```

### 4. Build para Producción

```bash
npm run build
npm run preview
```

## 🎯 Uso

### Agregar una Inversión

1. Click en el botón **"Agregar Activo"**
2. Selecciona el **tipo de activo**:
   - **Criptomoneda** - Bitcoin, Ethereum, etc. (siempre USD)
   - **Acción Argentina** - GGAL, YPF, etc.
   - **CEDEAR** - AAPL, TSLA, etc.
   - **Bono** - AL30 (USD), GD30 (USD), TX28 (ARS), etc.
   - **Letra** - S31O4, etc.
3. **Selecciona la moneda** (solo para activos argentinos):
   - **ARS** - Pesos argentinos
   - **USD** - Dólares
4. Ingresa el **símbolo/ticker** del activo
5. Especifica el **nombre** del activo
6. Indica la **cantidad** que posees
7. Indica el **precio de compra** en la moneda seleccionada
8. ¡Listo! El sistema calculará automáticamente el valor actual y la ganancia/pérdida

**💡 Tip**: Los bonos pueden estar en USD (GD30, AL30) o ARS (TX28, TC24). Selecciona la moneda correcta.

### Soporte Multi-Moneda

La aplicación soporta activos tanto en **ARS** como en **USD**:

- **Badge de moneda**: Cada activo muestra un badge con su moneda (USD verde, ARS amarillo)
- **Conversión automática**: Los activos en USD muestran su equivalente en ARS
- **Total unificado**: El resumen convierte todo a ARS usando dólar blue

📚 **Ver guía completa**: [MULTI-CURRENCY.md](./MULTI-CURRENCY.md)

### Editar o Eliminar Activos

- **Editar**: Hover sobre una tarjeta de activo y click en el ícono de edición
- **Eliminar**: Hover sobre una tarjeta de activo y click en el ícono de eliminar (confirmación requerida)

### Ver Cotizaciones en Tiempo Real

- **Criptomonedas**: Se actualizan desde CoinGecko cada 60 segundos
- **Activos Argentinos**: Se obtienen desde IOL API cada 60 segundos
- **Dólar**: 7 tipos de cotizaciones (Blue, Oficial, MEP, CCL, Mayorista, Cripto, Tarjeta)
  - 📚 **Ver guía completa**: [DOLAR-TYPES.md](./DOLAR-TYPES.md)

### Conversión Automática Multi-Moneda

- **Activos en USD** (criptos, bonos USD): Se convierten a ARS usando el **dólar blue**
- **Activos en ARS**: Se muestran directamente en pesos
- El **resumen total** unifica todo en ARS para una vista consolidada
- Cada activo muestra badge de moneda y equivalente en ARS (si aplica)

## 📂 Estructura del Proyecto

```
mi-portfolio/
├── server/
│   └── index.js              # Backend Express - SOLO DESARROLLO LOCAL
├── api/                      # 🆕 Vercel Serverless Functions - SOLO PRODUCCIÓN
│   ├── health.js
│   ├── _utils/jwt.js
│   └── iol/
├── src/
│   ├── components/           # Componentes React reutilizables
│   │   ├── AssetCard.jsx
│   │   ├── AddAssetModal.jsx
│   │   ├── EditAssetModal.jsx
│   │   ├── IOLSessionStatus.jsx  # 🆕 Indicador de sesión IOL
│   │   ├── PortfolioSummary.jsx
│   │   ├── PortfolioStats.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorMessage.jsx
│   ├── config/
│   │   └── constants.js      # Configuración y constantes
│   ├── hooks/                # Custom hooks de React Query
│   │   ├── useInvestments.js # Hooks cripto y dólar
│   │   └── useArgentineQuotes.js # Hook cotizaciones IOL
│   ├── services/
│   │   └── iol.js            # Cliente API IOL (frontend)
│   ├── utils/
│   │   └── formatters.js     # Utilidades de formato
│   ├── App.jsx               # Componente principal
│   ├── main.jsx              # Punto de entrada
│   └── index.css             # Estilos globales
├── .env                      # Credenciales (NO subir a Git)
├── .env.example              # Plantilla de credenciales
├── package.json
├── vercel.json               # 🆕 Configuración de Vercel
├── ARCHITECTURE.md           # 🆕 Documentación de arquitectura
└── vite.config.js
```

📖 **Ver [ARCHITECTURE.md](./ARCHITECTURE.md)** para entender la diferencia entre desarrollo y producción.
│   │   └── iol.js            # Cliente API IOL (frontend)
│   ├── utils/
│   │   └── formatters.js     # Utilidades de formato
│   ├── App.jsx               # Componente principal
│   ├── main.jsx              # Punto de entrada
│   └── index.css             # Estilos globales
├── .env                      # Credenciales (NO subir a Git)
├── .env.example              # Plantilla de credenciales
├── package.json
└── vite.config.js
```

## 🔄 React Query - Características

- **Caché Automático** - Los datos se cachean por 1 minuto (staleTime: 60s)
- **Revalidación Automática** - Actualización en background cada minuto (refetchInterval: 60s)
- **DevTools** - Incluidas en desarrollo para debugging de queries
- **Optimistic Updates** - Actualizaciones instantáneas en la UI
- **Error Handling** - Reintentos automáticos y manejo de errores

## 🔒 Seguridad - Backend Proxy IOL

### ¿Por qué un Backend Proxy?

La aplicación usa un servidor Express como proxy para comunicarse con la API de InvertirOnline por motivos de seguridad:

1. **Protección de Credenciales**: Las credenciales IOL nunca se exponen en el frontend
2. **Token Caching**: El token OAuth2 se almacena en memoria del servidor y se renueva automáticamente
3. **CORS Management**: El backend maneja CORS de forma segura
4. **Rate Limiting**: Control centralizado de peticiones a IOL

### Flujo de Autenticación

```
1. Backend obtiene token OAuth2 de IOL usando credenciales .env
2. Token se almacena en cache in-memory con timestamp
3. Frontend solicita cotizaciones a backend (no directamente a IOL)
4. Backend verifica validez del token (refresh automático si expiró)
5. Backend hace petición a IOL con token válido
6. Backend devuelve datos al frontend
```

### Endpoints del Backend

- `GET /api/health` - Health check del servidor
- `POST /api/iol/refresh-token` - Forzar refresh manual del token
- `GET /api/iol/quote/:tipo/:simbolo` - Obtener cotización de un activo

**Tipos válidos**: `acciones`, `cedears`, `bonos`, `letras`

**Ejemplo**: `GET /api/iol/quote/acciones/GGAL`

## 🌐 APIs Utilizadas

### CoinGecko API
- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Rate Limit**: 50 llamadas/minuto (plan gratuito)
- **Datos**: Precios de criptomonedas en USD y otras monedas

### DolarAPI
- **Endpoint**: `https://dolarapi.com/v1/dolares/blue` y `/oficial`
- **Rate Limit**: Sin límite conocido
- **Datos**: Cotización del dólar blue y oficial en Argentina

### InvertirOnline (IOL) API
- **Auth**: OAuth2 (username/password)
- **Endpoint Base**: `https://api.invertironline.com`
- **Token Expiry**: ~24 horas (renovación automática)
- **Datos**: Cotizaciones en tiempo real de acciones, CEDEARs, bonos y letras del mercado argentino

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Credenciales InvertirOnline
IOL_USER="tu_usuario_iol"
IOL_PASS="tu_contraseña_iol"

# Puerto del servidor backend (opcional)
PORT=4000
```

Para configurar la URL del proxy en el frontend (opcional):

```bash
# En .env o .env.local
VITE_IOL_PROXY_URL=http://localhost:4000
```

## 🧪 Testing Manual

### Verificar Backend

```bash
# Health check
curl http://localhost:4000/api/health

# Obtener cotización de GGAL
curl http://localhost:4000/api/iol/quote/acciones/GGAL

# Obtener cotización de AL30
curl http://localhost:4000/api/iol/quote/bonos/AL30
```

### Verificar Frontend

1. Abre `http://localhost:5173`
2. Agrega un activo argentino (ej: GGAL)
3. Verifica que el precio se actualice automáticamente
4. Abre React Query DevTools (ícono inferior izquierdo)
5. Observa las queries `argentineQuotes` y su estado

## 🚧 Mejoras Futuras

- [ ] Indicadores de fuente de precio (API vs manual) con timestamp
- [ ] Invalidación automática de queries tras edición de activos
- [ ] Gráficos históricos de evolución del portfolio
- [ ] Exportación de datos a CSV/Excel
- [ ] Alertas de precio configurables
- [ ] Soporte para múltiples portfolios
- [ ] Dark/Light theme toggle
- [ ] Autenticación de usuarios
- [ ] Persistencia en base de datos

## 📝 Notas Importantes

### Limitaciones API

- **CoinGecko**: 50 llamadas/minuto (plan gratuito)
- **IOL**: Consultar documentación oficial para límites
- El caching de React Query ayuda a reducir llamadas innecesarias

### Cotizaciones IOL

- Los tipos de activo deben coincidir con la nomenclatura de IOL:
  - `acciones` (no `accion`)
  - `cedears` (no `cedear`)
  - `bonos` (no `bono`)
  - `letras` (no `letra`)
- Algunos activos pueden no tener precio si el mercado está cerrado
- El mapeo de campos puede variar: `ultimoPrecio`, `precioAjuste`, `precioPromedio`

### Persistencia

- Los activos se guardan en `localStorage` del navegador
- No hay sincronización entre dispositivos
- Limpieza del navegador eliminará los datos

---

**Desarrollado con** ❤️ usando React 19 + Vite + React Query + Tailwind CSS + Express

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request
