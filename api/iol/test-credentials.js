import axios from 'axios'
import https from 'https'

// Configuración HTTPS para IOL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // IOL puede tener problemas de certificado
})

// Cache de tokens en memoria (funciona en Vercel mientras la función esté caliente)
const tokenCache = new Map()

async function getIOLToken(username, password) {
  const cacheKey = `${username}:${password}`
  const cached = tokenCache.get(cacheKey)
  
  // Verificar si el token en cache es válido
  if (cached && (Date.now() - cached.timestamp) < (cached.expiresIn - 30) * 1000) {
    return cached.token
  }
  
  // Obtener nuevo token
  const url = 'https://api.invertironline.com/token'
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  form.append('grant_type', 'password')

  try {
    const response = await axios.post(url, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent,
      timeout: 10000
    })
    
    const { access_token, expires_in } = response.data
    
    // Guardar en cache
    tokenCache.set(cacheKey, {
      token: access_token,
      expiresIn: expires_in,
      timestamp: Date.now()
    })
    
    return access_token
  } catch (error) {
    throw new Error('Credenciales inválidas o error de conexión con IOL')
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Usuario y contraseña son requeridos' 
    })
  }

  try {
    const token = await getIOLToken(username, password)
    
    res.status(200).json({ 
      success: true, 
      message: 'Credenciales válidas',
      hasToken: !!token
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: error.message 
    })
  }
}