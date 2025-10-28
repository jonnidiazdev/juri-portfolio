import axios from 'axios'
import https from 'https'
import { createSessionToken } from '../_utils/jwt.js'

// Configuración HTTPS para IOL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

async function validateIOLCredentials(username, password) {
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
    
    return {
      success: true,
      expiresIn: response.data.expires_in
    }
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
    // Validar credenciales con IOL
    await validateIOLCredentials(username, password)
    
    // Crear session token JWT
    const sessionToken = createSessionToken(username, password)
    
    res.status(200).json({ 
      success: true, 
      sessionToken,
      expiresIn: 24 * 3600, // 24 horas
      message: 'Sesión creada exitosamente'
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: error.message 
    })
  }
}