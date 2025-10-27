# 🔒 Seguridad y Privacidad

## Sistema de Autenticación Seguro con Sesiones

### Almacenamiento Seguro

Las credenciales de InvertirOnline **NO se guardan en el navegador**. En su lugar, usamos un sistema de sesiones:

✅ **Cómo funciona**:
1. Usuario ingresa credenciales **una sola vez** en el modal de configuración
2. Frontend envía credenciales al backend vía POST `/api/iol/login`
3. Backend valida credenciales con IOL y genera un **token de sesión único**
4. Frontend guarda **solo el token de sesión** en localStorage (no las credenciales)
5. En cada request, frontend envía el token de sesión (no las credenciales)
6. Backend usa las credenciales almacenadas en memoria para la sesión activa

✅ **Ventajas**:
- **Credenciales nunca en el navegador**: Solo se envían una vez durante el login
- **Token de sesión único**: 64 caracteres hexadecimales generados aleatoriamente
- **No hay credenciales en texto plano**: localStorage solo tiene el token de sesión
- **Sesiones con timeout**: Expiran automáticamente después de 24 horas
- **Revocación**: Puedes cerrar sesión y el token se invalida inmediatamente

⚠️ **Consideraciones**:
- Las credenciales están en **memoria del servidor** (no persisten en disco)
- El token de sesión da acceso completo mientras esté válido
- Si alguien roba el token, puede usarlo hasta que expire o cierres sesión

### Flujo de Seguridad

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ 1. Ingresa user/pass en UI
       ▼
┌─────────────────┐
│    Frontend     │
│  (localStorage) │
└──────┬──────────┘
       │ 2. POST /api/iol/login { username, password }
       │    (Solo en login, 1 vez)
       ▼
┌──────────────────┐
│     Backend      │
│  (Memoria RAM)   │
└──────┬───────────┘
       │ 3. Valida con IOL API
       │ 4. Genera sessionToken aleatorio
       │ 5. Guarda { user, pass, iolToken } en Map
       ▼
┌─────────────────┐
│    Frontend     │
│  localStorage:  │
│  sessionToken   │
└──────┬──────────┘
       │ 6. En cada request de cotización
       │    Header: x-session-token
       ▼
┌──────────────────┐
│     Backend      │
│ Busca sesión por │
│     token        │
│ Usa credenciales │
│   en memoria     │
└──────────────────┘
```

### Configurar Credenciales

1. Click en el **ícono de configuración** ⚙️ (botón amarillo si no hay sesión activa)
2. Ingresar usuario y contraseña de IOL
3. **(Opcional)** Click en "Probar Conexión" para verificar
4. Click en "Guardar" → Crea sesión en el backend
5. El token de sesión se guarda automáticamente en localStorage

**¿Qué se guarda?**
- ❌ NO se guarda: Usuario y contraseña
- ✅ SÍ se guarda: Token de sesión (string aleatorio de 64 caracteres)

### Probar Conexión

El botón "Probar Conexión" realiza una autenticación temporal con IOL (no crea sesión).

### Cerrar Sesión

Para cerrar sesión y revocar el token:
1. Abrir modal de Configuración
2. Click en "Eliminar"
3. Confirmar acción

Esto:
- Envía request al backend para eliminar la sesión
- Borra el token de sesión de localStorage
- Invalida el token inmediatamente (no se puede usar más)

## Seguridad del Backend

### Gestión de Sesiones

El backend mantiene sesiones activas en un `Map` en memoria:

```javascript
sessions = Map<sessionToken, {
  iolUser: string,
  iolPass: string,
  iolToken: { accessToken, expiresIn, obtainedAt },
  createdAt: number
}>
```

**Características**:
- Almacenamiento en **memoria RAM** (no persiste en disco)
- Sesiones expiran después de **24 horas**
- Limpieza automática de sesiones expiradas cada hora
- Token de sesión generado con `crypto.randomBytes(32)` (64 hex chars)

### Endpoints de Sesión

#### `POST /api/iol/login`
Crea una nueva sesión:
- Input: `{ username, password }`
- Output: `{ success: true, sessionToken, expiresIn }`
- Valida credenciales con IOL antes de crear sesión

#### `POST /api/iol/logout`
Cierra sesión:
- Header: `x-session-token`
- Elimina sesión del Map
- Token queda invalidado inmediatamente

#### `GET /api/iol/session`
Verifica si una sesión está activa:
- Header: `x-session-token`
- Output: `{ valid: boolean, expiresIn: number }`

#### `GET /api/iol/quote/:tipo/:simbolo`
Obtiene cotización usando sesión:
- Header: `x-session-token`
- Busca sesión por token
- Usa credenciales de la sesión para autenticar con IOL

### SSL Certificate Handling

En desarrollo, el backend usa `rejectUnauthorized: false`:

```javascript
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})
```

⚠️ **Solo para desarrollo**: En producción, usa certificados SSL válidos.

## Mejores Prácticas

### Para Usuarios

1. **Cierra sesión** al terminar de usar la app en navegadores compartidos
2. **No compartas tu token de sesión** (está en localStorage como `iol-session-token`)
3. **Usa HTTPS** siempre que sea posible para encriptar tráfico
4. **Limpia datos del navegador** si usas una computadora compartida

### Para Desarrolladores

1. **Nunca commitees** credenciales en `.env` al repositorio
2. **Usa HTTPS** en producción para encriptar tráfico
3. **Rotación de tokens**: Considera implementar refresh de sesión antes de expirar
4. **Rate limiting**: Limita intentos de login fallidos
5. **Logging seguro**: Nunca loguees credenciales o tokens completos

## Alternativas Más Seguras (Futuras)

### 1. Encriptación en Frontend

```javascript
// Guardar encriptado
const encrypted = CryptoJS.AES.encrypt(password, secretKey)
localStorage.setItem('iol-pass', encrypted.toString())

// Leer desencriptado
const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey)
const password = decrypted.toString(CryptoJS.enc.Utf8)
```

**Problema**: El `secretKey` también estaría en el frontend.

### 2. Backend con Base de Datos

- Usuario crea cuenta en la app
- Credenciales IOL guardadas encriptadas en DB del backend
- Usuario se autentica con la app (no con IOL directamente)

**Ventajas**:
- Credenciales encriptadas server-side
- Control de acceso por usuario

**Desventajas**:
- Requiere infraestructura adicional
- Mayor complejidad

### 3. OAuth2 Delegado

- IOL proporciona OAuth2 delegation
- Usuario autoriza app sin compartir contraseña
- App recibe token temporal

**Estado**: IOL API pública no soporta esto actualmente.

## Preguntas Frecuentes

### ¿Es seguro guardar el token de sesión en localStorage?

**Más seguro que guardar credenciales**. El token de sesión:
- Es un string aleatorio sin información sensible
- Se puede revocar en cualquier momento
- Expira automáticamente después de 24 horas
- No revela tu usuario o contraseña

### ¿Qué pasa si alguien roba mi token de sesión?

Podría acceder a tu cuenta IOL hasta que:
- Expires el token (24 horas)
- Cierres sesión manualmente
- Reinicies el servidor backend

**Mitigación**:
1. Cierra sesión cuando termines
2. El servidor limpia sesiones expiradas automáticamente
3. En producción, usa HTTPS para evitar intercepción

### ¿Qué pasa si reinicio el servidor?

Todas las sesiones se pierden (están en memoria). Necesitarás hacer login nuevamente.

### ¿Dónde están mis credenciales realmente?

1. **Nunca en localStorage** (solo el token de sesión)
2. **En memoria del servidor** mientras la sesión esté activa
3. **Se eliminan** cuando cierras sesión o expira (24h)
4. **Se pierden** si reinicias el servidor

### ¿Puedo usar la app sin configurar IOL?

**Sí**, pero solo para criptomonedas. Las cotizaciones argentinas requieren sesión activa.

### ¿El backend guarda mis credenciales en disco?

**NO**. Todo está en memoria RAM. Al reiniciar el servidor, todas las sesiones y credenciales se pierden.

## Responsabilidad

Esta aplicación es un **proyecto de código abierto** para uso personal. Los desarrolladores **no se responsabilizan** por:
- Pérdida o robo de credenciales
- Accesos no autorizados a tu cuenta IOL
- Transacciones realizadas sin tu consentimiento

**Usa bajo tu propio riesgo** y toma las precauciones de seguridad adecuadas.

## Reportar Problemas de Seguridad

Si encuentras una vulnerabilidad de seguridad, por favor:
1. **No** la publiques en issues públicos
2. Contacta al mantenedor directamente
3. Proporciona detalles para reproducir el problema

---

**Última actualización**: Octubre 2025
