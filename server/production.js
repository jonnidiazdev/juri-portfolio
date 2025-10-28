import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import dotenv from 'dotenv'
import cors from 'cors'
import https from 'https'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

// Configuración CORS para producción
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://tu-dominio.com']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
}

// Configuración HTTPS Agent basada en entorno
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production'
})

// --- Session management ---
const sessions = new Map()
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}

function cleanExpiredSessions() {
  const now = Date.now()
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TIMEOUT) {
      sessions.delete(token)
      if (process.env.DEBUG_IOL === 'true') {
        console.log('[SESSION] Expired session removed:', token.substring(0, 8) + '...')
      }
    }
  }
}

setInterval(cleanExpiredSessions, 60 * 60 * 1000)

// Token cache
let envTokenCache = {
  accessToken: null,
  obtainedAt: null,
  expiresIn: null,
}

async function fetchToken(username = null, password = null) {
  const IOL_USER = username || process.env.IOL_USER
  const IOL_PASS = password || process.env.IOL_PASS
  
  if (!IOL_USER || !IOL_PASS) {
    throw new Error('Credenciales IOL faltantes. Configúralas en la aplicación o en .env')
  }
  
  const url = 'https://api.invertironline.com/token'
  const form = new URLSearchParams()
  form.append('username', IOL_USER)
  form.append('password', IOL_PASS)
  form.append('grant_type', 'password')

  const resp = await axios.post(url, form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    httpsAgent,
    timeout: 10000 // 10 segundos timeout
  })
  const data = resp.data
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    obtainedAt: Date.now()
  }
}

function isIOLTokenValid(tokenData) {
  if (!tokenData || !tokenData.accessToken) return false
  const elapsed = (Date.now() - tokenData.obtainedAt) / 1000
  return elapsed < (tokenData.expiresIn - 30)
}

async function getIOLToken(session) {
  if (session) {
    if (isIOLTokenValid(session.iolToken)) {
      return session.iolToken.accessToken
    }
    const tokenData = await fetchToken(session.iolUser, session.iolPass)
    session.iolToken = tokenData
    return tokenData.accessToken
  }
  
  if (isIOLTokenValid(envTokenCache)) {
    return envTokenCache.accessToken
  }
  const tokenData = await fetchToken()
  envTokenCache = tokenData
  return tokenData.accessToken
}

// Health check mejorado
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  })
})

// Login endpoint
app.post('/api/iol/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' })
    }
    
    const tokenData = await fetchToken(username, password)
    const sessionToken = generateSessionToken()
    
    sessions.set(sessionToken, {
      iolUser: username,
      iolPass: password,
      iolToken: tokenData,
      createdAt: Date.now()
    })
    
    if (process.env.DEBUG_IOL === 'true') {
      console.log('[SESSION] Nueva sesión creada:', sessionToken.substring(0, 8) + '...', 'Total sesiones:', sessions.size)
    }
    
    res.json({ 
      success: true, 
      sessionToken,
      expiresIn: SESSION_TIMEOUT / 1000
    })
  } catch (e) {
    console.error('[IOL] Error en login:', e.message)
    res.status(401).json({ success: false, error: 'Credenciales inválidas o error de conexión' })
  }
})

// Logout endpoint
app.post('/api/iol/logout', (req, res) => {
  const sessionToken = req.headers['x-session-token']
  if (sessionToken && sessions.has(sessionToken)) {
    sessions.delete(sessionToken)
    if (process.env.DEBUG_IOL === 'true') {
      console.log('[SESSION] Sesión cerrada:', sessionToken.substring(0, 8) + '...')
    }
    res.json({ success: true })
  } else {
    res.status(404).json({ success: false, error: 'Sesión no encontrada' })
  }
})

// Verificar sesión
app.get('/api/iol/session', (req, res) => {
  const sessionToken = req.headers['x-session-token']
  if (sessionToken && sessions.has(sessionToken)) {
    const session = sessions.get(sessionToken)
    const age = Date.now() - session.createdAt
    const remaining = SESSION_TIMEOUT - age
    res.json({ 
      valid: true,
      expiresIn: Math.floor(remaining / 1000),
      hasIOLToken: !!session.iolToken
    })
  } else {
    res.json({ valid: false })
  }
})

// Test credentials endpoint
app.post('/api/iol/test-credentials', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' })
    }
    
    await fetchToken(username, password)
    res.json({ success: true, message: 'Credenciales válidas' })
  } catch (e) {
    console.error('[IOL] Error testing credentials:', e.message)
    res.status(401).json({ success: false, error: 'Credenciales inválidas o error de conexión' })
  }
})

// Manual token refresh
app.post('/api/iol/refresh-token', async (req, res) => {
  try {
    const { username, password } = req.body
    const tokenData = await fetchToken(username, password)
    envTokenCache = tokenData
    res.json({ ok: true })
  } catch (e) {
    console.error('[IOL] Error refreshing token:', e.message)
    res.status(500).json({ error: e.message })
  }
})

function buildCandidateUrls(simboloRaw) {
  const simbolo = simboloRaw.toUpperCase().trim()
  const urls = []
  urls.push(`https://api.invertironline.com//api/v2/BCBA/Titulos/${simbolo}/Cotizacion`)
  return urls
}

async function fetchFirstSuccessfulQuote(token, urls) {
  for (const url of urls) {
    try {
      const resp = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        httpsAgent,
        validateStatus: s => s < 500,
        timeout: 10000
      })
      const ctype = resp.headers['content-type'] || ''
      if (resp.status === 200 && ctype.includes('application/json')) {
        return { data: resp.data, usedUrl: url }
      }
      if (process.env.DEBUG_IOL === 'true') {
        console.warn('[IOL][FALLBACK] URL sin éxito', url, 'status:', resp.status, 'ctype:', ctype)
      }
    } catch (err) {
      if (process.env.DEBUG_IOL === 'true') {
        console.warn('[IOL][ERROR] Intento fallido', url, err.message)
      }
    }
  }
  throw new Error('No se pudo obtener la cotización con los patrones disponibles')
}

// Quote endpoint
app.get('/api/iol/quote/:tipo/:simbolo', async (req, res) => {
  const { tipo, simbolo } = req.params
  const sessionToken = req.headers['x-session-token']
  
  let session = null
  if (sessionToken && sessions.has(sessionToken)) {
    session = sessions.get(sessionToken)
    if (process.env.DEBUG_IOL === 'true') {
      console.log('[IOL] Request con sesión válida')
    }
  } else if (process.env.DEBUG_IOL === 'true') {
    console.log('[IOL] Request sin sesión, usando fallback .env')
  }
  
  try {
    const iolToken = await getIOLToken(session)
    const urls = buildCandidateUrls(simbolo)
    const result = await fetchFirstSuccessfulQuote(iolToken, urls)
    res.json({ data: result.data, meta: { url: result.usedUrl } })
  } catch (e) {
    const status = e.response?.status || 500
    console.error('[IOL] Error fetching quote:', e.message)
    res.status(status).json({ error: e.message, details: e.response?.data || null })
  }
})

// Manejo de SPA routing - DEBE IR AL FINAL
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // No servir archivos de API como SPA
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' })
    }
    
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { details: err.message })
  })
})

// Validar variables de entorno críticas
function validateEnvironment() {
  const required = []
  
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.IOL_USER && !process.env.IOL_PASS) {
      console.warn('⚠️  IOL credentials not set. Users will need to configure them via UI.')
    }
  }
  
  if (required.length > 0) {
    console.error('❌ Missing required environment variables:', required.join(', '))
    process.exit(1)
  }
}

// Start server
const PORT = process.env.PORT || 4000
validateEnvironment()

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 API available at: http://localhost:${PORT}/api/health`)
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Frontend served from: http://localhost:${PORT}`)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})