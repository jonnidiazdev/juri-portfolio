// Utilidad simple para JWT sin dependencias externas
// Solo para uso en Vercel serverless functions

import crypto from 'crypto'

const SECRET = process.env.JWT_SECRET || 'portfolio-secret-key-change-in-production'

function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64urlDecode(str) {
  str += new Array(5 - str.length % 4).join('=')
  return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64').toString()
}

function encrypt(text) {
  // Encriptación simple usando Buffer (sin crypto para simplicidad)
  return Buffer.from(text).toString('base64')
}

function decrypt(encrypted) {
  return Buffer.from(encrypted, 'base64').toString()
}

export function createJWT(payload, expiresIn = 3600) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  }
  
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(jwtPayload))
  
  const signature = base64urlEncode(
    crypto
      .createHmac('sha256', SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest()
  )
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifyJWT(token) {
  try {
    const [header, payload, signature] = token.split('.')
    
    if (!header || !payload || !signature) {
      throw new Error('Invalid token format')
    }
    
    // Verificar firma
    const expectedSignature = base64urlEncode(
      crypto
        .createHmac('sha256', SECRET)
        .update(`${header}.${payload}`)
        .digest()
    )
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature')
    }
    
    const decodedPayload = JSON.parse(base64urlDecode(payload))
    
    // Verificar expiración
    if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) {
      throw new Error('Token expired')
    }
    
    return decodedPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function createSessionToken(username, password) {
  // Encriptar credenciales para incluir en JWT
  const encryptedCredentials = encrypt(JSON.stringify({ username, password }))
  
  return createJWT({
    user: username,
    credentials: encryptedCredentials
  }, 24 * 3600) // 24 horas
}

export function extractCredentials(sessionToken) {
  const payload = verifyJWT(sessionToken)
  const credentials = JSON.parse(decrypt(payload.credentials))
  return credentials
}