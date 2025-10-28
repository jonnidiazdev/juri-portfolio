import axios from 'axios'
import https from 'https'

// Configuración HTTPS para IOL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// Cache simple de tokens (funciona mientras la función está caliente)
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

  const { tipo, simbolo } = req.query
  
  if (!simbolo) {
    return res.status(400).json({ error: 'Símbolo requerido' })
  }

  // Para Vercel, usaremos variables de entorno para credenciales
  const username = process.env.IOL_USER
  const password = process.env.IOL_PASS

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Credenciales IOL no configuradas en el servidor' 
    })
  }

  try {
    const token = await getIOLToken(username, password)
    const data = await fetchQuote(token, simbolo)
    
    res.status(200).json({ data, meta: { source: 'IOL API' } })
  } catch (error) {
    console.error('Error fetching quote:', error.message)
    
    const status = error.response?.status || 500
    res.status(status).json({ 
      error: error.message,
      details: error.response?.data || null 
    })
  }
}