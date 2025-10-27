# 📝 Changelog

## [Unreleased]

### Added
- **Sistema de Sesiones Seguras**: Reemplazo de credenciales en headers por tokens de sesión
  - Login único que genera token de sesión aleatorio (64 chars hex)
  - Credenciales almacenadas solo en memoria del backend (no localStorage)
  - Tokens de sesión con expiración automática (24 horas)
  - Endpoint de logout para revocar sesiones
  - Endpoint de verificación de sesión activa
  - Limpieza automática de sesiones expiradas
  - Mucho más seguro que enviar credenciales en cada request
- **Sistema de Configuración de Credenciales**: Modal para configurar usuario/contraseña de IOL desde la interfaz
  - Credenciales guardadas en localStorage del navegador
  - Botón de configuración con indicador visual cuando faltan credenciales
  - Función "Probar Conexión" para validar credenciales
  - Eliminación segura de credenciales guardadas
  - Backend actualizado para aceptar credenciales vía headers
  - Fallback a variables de entorno `.env` si no hay credenciales en localStorage
  - Documentación completa de seguridad en `SECURITY.md`
- **7 Cotizaciones del Dólar**: Visualización completa de todos los tipos de dólar en Argentina
  - Blue (informal)
  - Oficial (Banco Nación)
  - MEP (Bolsa)
  - CCL (Contado con Liquidación)
  - Mayorista (Interbancario)
  - Cripto (Exchanges)
  - Tarjeta (Turista + impuestos)
- **Componente DolarQuotes**: UI expandible con todas las cotizaciones
  - Cards con colores distintivos por tipo
  - Compra/Venta/Spread para cada tipo
  - Timestamps de última actualización
  - Leyenda explicativa
- **Hook useDolarByType**: Permite obtener cotización específica de un tipo de dólar
- **Documentación DOLAR-TYPES.md**: Guía completa de cada tipo de dólar
- **Equivalentes en USD MEP**: Los activos argentinos (ARS) ahora muestran su valor equivalente en dólares MEP
  - Visualización debajo del valor total en pesos
  - Usa cotización MEP (Bolsa) para la conversión
  - Etiqueta "MEP" para distinguir del dólar blue
  - Formato: `≈ $X,XXX.XX USD MEP`

### Fixed
- **SSL Certificate Error**: Agregado soporte para certificados SSL autofirmados en desarrollo
  - Error: "unable to get local issuer certificate" al conectar con IOL API
  - Solución: Configurado `https.Agent` con `rejectUnauthorized: false`
  - Ubicación: `server/index.js`
  - Impacto: Permite conexión exitosa con IOL API en entornos de desarrollo

### Added
- Documentación completa de integración IOL
  - README.md con setup detallado
  - TESTING.md con casos de prueba
  - DEVELOPMENT.md con tips de desarrollo
  - QUICKSTART.md para inicio rápido

### Security
- Credenciales IOL manejadas de forma segura mediante backend proxy
- Token OAuth2 cacheado en memoria del servidor
- Archivo `.env` protegido en `.gitignore`

## [1.0.0] - 2025-10-24

### Added
- Integración con InvertirOnline (IOL) API
  - Backend Express como proxy seguro
  - Autenticación OAuth2 con caching de token
  - Endpoints para cotizaciones de acciones, CEDEARs, bonos y letras
  
- Gestión de portfolio de inversiones
  - Soporte para criptomonedas (CoinGecko API)
  - Soporte para activos argentinos (IOL API)
  - Conversión automática cripto a ARS usando dólar blue
  - Cálculo de ganancia/pérdida
  
- UI moderna con React 19
  - Componentes para visualización de activos
  - Modales para agregar/editar activos
  - Actualización automática cada 60 segundos
  - React Query para caching y estado del servidor
  
- Persistencia local
  - Portfolio guardado en localStorage
  - Recuperación automática al recargar

### Technical
- React 19 con Vite 7
- TanStack React Query v5
- Tailwind CSS v4
- Express backend
- Axios para HTTP requests
- Concurrently para ejecutar backend + frontend

---

## Tipos de Cambios

- **Added**: Nueva funcionalidad
- **Changed**: Cambios en funcionalidad existente
- **Deprecated**: Funcionalidad que será removida
- **Removed**: Funcionalidad removida
- **Fixed**: Corrección de bugs
- **Security**: Mejoras de seguridad
