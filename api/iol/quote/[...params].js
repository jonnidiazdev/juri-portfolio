import axios from 'axios'
import https from 'https'
import { extractCredentials } from '../../_utils/jwt.js'

// Configuración HTTPS para IOL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// Cache simple de tokens IOL (funciona mientras la función está caliente)
const tokenCache = new Map()

async function getIOLToken(username, password) {
  const cacheKey = `${username}:${password}`
  const cached = tokenCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < (cached.expiresIn - 30) * 1000) {
    return cached.token
  }
  
  const url = 'https://api.invertironline.com/token'
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  form.append('grant_type', 'password')

  const response = await axios.post(url, form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    httpsAgent,
    timeout: 10000
  })
  
  const { access_token, expires_in } = response.data
  
  tokenCache.set(cacheKey, {
    token: access_token,
    expiresIn: expires_in,
    timestamp: Date.now()
  })
  
  return access_token
}

async function fetchQuote(token, simbolo) {
  const url = `https://api.invertironline.com/api/v2/BCBA/Titulos/${simbolo.toUpperCase()}/Cotizacion`
  
  const response = await axios.get(url, {
    headers: { 
      Authorization: `Bearer ${token}`, 
      Accept: 'application/json' 
    },
    httpsAgent,
    timeout: 10000
  })
  
  return response.data
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { params } = req.query
  const sessionToken = req.headers['x-session-token']
  
  if (!params || params.length < 2) {
    return res.status(400).json({ error: 'Parámetros tipo y símbolo requeridos' })
  }
  
  const [tipo, simbolo] = params
  
  if (!simbolo) {
    return res.status(400).json({ error: 'Símbolo requerido' })
  }

  if (!sessionToken) {
    return res.status(401).json({ 
      error: 'Session token requerido. Por favor inicia sesión.' 
    })
  }

  try {
    // Extraer credenciales del JWT
    const { username, password } = extractCredentials(sessionToken)
    
    // Obtener token IOL
    const token = await getIOLToken(username, password)
    
    // Obtener cotización
    const data = await fetchQuote(token, simbolo)
    
    res.status(200).json({ data, meta: { source: 'IOL API' } })
  } catch (error) {
    console.error('Error fetching quote:', error.message)
    
    if (error.message.includes('token') || error.message.includes('Token')) {
      return res.status(401).json({ 
        error: 'Sesión inválida o expirada. Por favor inicia sesión nuevamente.' 
      })
    }
    
    const status = error.response?.status || 500
    res.status(status).json({ 
      error: error.message,
      details: error.response?.data || null 
    })
  }
}