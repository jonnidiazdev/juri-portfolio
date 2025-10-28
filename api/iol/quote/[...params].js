import axios from 'axios'
import https from 'https'
import crypto from 'crypto'

// Configuración HTTPS para IOL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// Utilidades JWT inline para evitar problemas de importación
const SECRET = process.env.JWT_SECRET || 'portfolio-secret-key-change-in-production'

function base64urlDecode(str) {
  str += new Array(5 - str.length % 4).join('=')
  return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64').toString()
}

function decrypt(encrypted) {
  return Buffer.from(encrypted, 'base64').toString()
}

function verifyJWT(token) {
  console.log('🔍 Verificando JWT token...')
  try {
    const [header, payload, signature] = token.split('.')
    
    if (!header || !payload || !signature) {
      throw new Error('Invalid token format')
    }
    
    const decodedPayload = JSON.parse(base64urlDecode(payload))
    console.log('✅ JWT verificado exitosamente')
    
    // Verificar expiración
    if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) {
      throw new Error('Token expired')
    }
    
    return decodedPayload
  } catch (error) {
    console.error('❌ Error verificando JWT:', error.message)
    throw new Error('Invalid token')
  }
}

function extractCredentials(sessionToken) {
  console.log('🔐 Extrayendo credenciales del token...')
  const payload = verifyJWT(sessionToken)
  const credentials = JSON.parse(decrypt(payload.credentials))
  console.log('✅ Credenciales extraídas exitosamente')
  return credentials
}

// Cache simple de tokens IOL (funciona mientras la función está caliente)
const tokenCache = new Map()

async function getIOLToken(username, password) {
  console.log('🔑 Obteniendo token IOL para usuario:', username)
  const cacheKey = `${username}:${password}`
  const cached = tokenCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < (cached.expiresIn - 30) * 1000) {
    console.log('✅ Usando token cacheado')
    return cached.token
  }
  
  console.log('🌐 Solicitando nuevo token a IOL API...')
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
  console.log('✅ Token IOL obtenido exitosamente')
  
  tokenCache.set(cacheKey, {
    token: access_token,
    expiresIn: expires_in,
    timestamp: Date.now()
  })
  
  return access_token
}

async function fetchQuote(token, simbolo) {
  console.log('📈 Obteniendo cotización para símbolo:', simbolo)
  const url = `https://api.invertironline.com/api/v2/BCBA/Titulos/${simbolo.toUpperCase()}/Cotizacion`
  
  const response = await axios.get(url, {
    headers: { 
      Authorization: `Bearer ${token}`, 
      Accept: 'application/json' 
    },
    httpsAgent,
    timeout: 10000
  })
  
  console.log('✅ Cotización obtenida exitosamente')
  return response.data
}

export default async function handler(req, res) {
  console.log('🚀 Función de cotización iniciada')
  console.log('📋 Método:', req.method)
  console.log('📋 Query params:', req.query)
  console.log('📋 Headers:', Object.keys(req.headers))

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-session-token')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    console.log('❌ Método no permitido:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { params } = req.query
  const sessionToken = req.headers['x-session-token']
  
  console.log('📋 Params recibidos:', params)
  console.log('📋 Session token presente:', !!sessionToken)
  
  if (!params || params.length < 2) {
    console.log('❌ Parámetros insuficientes')
    return res.status(400).json({ error: 'Parámetros tipo y símbolo requeridos' })
  }
  
  const [tipo, simbolo] = params
  console.log('📋 Tipo:', tipo, 'Símbolo:', simbolo)
  
  if (!simbolo) {
    console.log('❌ Símbolo faltante')
    return res.status(400).json({ error: 'Símbolo requerido' })
  }

  if (!sessionToken) {
    console.log('❌ Token de sesión faltante')
    return res.status(401).json({ 
      error: 'Session token requerido. Por favor inicia sesión.' 
    })
  }

  try {
    console.log('🔄 Procesando solicitud...')
    
    // Extraer credenciales del JWT
    const { username, password } = extractCredentials(sessionToken)
    
    // Obtener token IOL
    const token = await getIOLToken(username, password)
    
    // Obtener cotización
    const data = await fetchQuote(token, simbolo)
    
    console.log('✅ Cotización obtenida exitosamente, enviando respuesta')
    res.status(200).json({ data, meta: { source: 'IOL API' } })
  } catch (error) {
    console.error('❌ Error en función de cotización:', error.message)
    console.error('❌ Stack trace:', error.stack)
    
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