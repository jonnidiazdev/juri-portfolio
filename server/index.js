/*
 * Express Server - SOLO PARA DESARROLLO LOCAL
 * 
 * Este servidor se usa únicamente durante el desarrollo local.
 * En producción, se utilizan las Vercel Serverless Functions (carpeta /api).
 * 
 * Comandos:
 * - npm run dev:full  (recomendado para desarrollo)
 * - npm run server    (solo backend)
 * 
 * Ver ARCHITECTURE.md para más información.
 */

import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import cors from 'cors'
import https from 'https'
import crypto from 'crypto'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Configurar axios para ignorar certificados SSL autofirmados (solo desarrollo)
// En producción, considera usar certificados válidos
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// --- Session management ---
const sessions = new Map() // sessionToken -> { iolUser, iolPass, iolToken, iolTokenExpiry, createdAt }
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 horas

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

// Limpiar sesiones expiradas cada hora
setInterval(cleanExpiredSessions, 60 * 60 * 1000)

// --- Simple in-memory token cache para .env fallback ---
let envTokenCache = {
  accessToken: null,
  obtainedAt: null,
  expiresIn: null,
}

async function fetchToken(username = null, password = null) {
  // Intentar obtener credenciales desde parámetros, luego desde .env como fallback
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
  // Si hay sesión, usar credenciales de la sesión
  if (session) {
    if (isIOLTokenValid(session.iolToken)) {
      return session.iolToken.accessToken
    }
    // Refresh token de sesión
    const tokenData = await fetchToken(session.iolUser, session.iolPass)
    session.iolToken = tokenData
    return tokenData.accessToken
  }
  
  // Fallback a .env
  if (isIOLTokenValid(envTokenCache)) {
    return envTokenCache.accessToken
  }
  const tokenData = await fetchToken()
  envTokenCache = tokenData
  return tokenData.accessToken
}

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Login endpoint - crea sesión segura
app.post('/api/iol/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' })
    }
    
    // Validar credenciales obteniendo token de IOL
    const tokenData = await fetchToken(username, password)
    
    // Generar session token
    const sessionToken = generateSessionToken()
    
    // Guardar sesión
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
      expiresIn: SESSION_TIMEOUT / 1000 // en segundos
    })
  } catch (e) {
    res.status(401).json({ success: false, error: 'Credenciales inválidas o error de conexión' })
  }
})

// Logout endpoint - revoca sesión
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

// Test credentials endpoint (deprecated - usar /login)
app.post('/api/iol/test-credentials', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña son requeridos' })
    }
    
    await fetchToken(username, password)
    res.json({ success: true, message: 'Credenciales válidas' })
  } catch (e) {
    res.status(401).json({ success: false, error: 'Credenciales inválidas o error de conexión' })
  }
})

// Manual token refresh (deprecated)
app.post('/api/iol/refresh-token', async (req, res) => {
  try {
    const { username, password } = req.body
    const tokenData = await fetchToken(username, password)
    envTokenCache = tokenData
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Helper: construir lista de URLs candidatas porque la documentación pública de IOL
// difiere según instrumento y a veces devuelve 500 si el path no coincide.
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
        validateStatus: s => s < 500 // evitar lanzar en 4xx para decidir fallback
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
      // seguir con el siguiente
    }
  }
  throw new Error('No se pudo obtener la cotización con los patrones disponibles')
}

// Quote endpoint: usa session token en lugar de credenciales
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
    res.status(status).json({ error: e.message, details: e.response?.data || null })
  }
})

// Start server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`IOL proxy server running on port ${PORT}`)
})
