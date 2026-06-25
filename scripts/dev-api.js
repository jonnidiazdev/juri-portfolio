/**
 * Servidor local de desarrollo para las Vercel Functions en api/.
 * No requiere `vercel login` ni acceso a la red de Vercel.
 * Usa los mismos handlers que producción.
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import healthHandler from '../api/health.js'
import loginHandler from '../api/iol/login.js'
import testCredentialsHandler from '../api/iol/test-credentials.js'
import quoteHandler from '../api/iol/quote/[...params].js'

const PORT = process.env.API_PORT || 3000
const app = express()

app.use(cors())
app.use(express.json())

function runHandler(handler, req, res) {
  Promise.resolve(handler(req, res)).catch((error) => {
    console.error('[dev-api] Error no manejado:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Error interno del servidor' })
    }
  })
}

app.get('/api/health', (req, res) => runHandler(healthHandler, req, res))
app.post('/api/iol/login', (req, res) => runHandler(loginHandler, req, res))
app.post('/api/iol/test-credentials', (req, res) => runHandler(testCredentialsHandler, req, res))

app.get('/api/iol/quote/:tipo/:simbolo', (req, res) => {
  req.query = {
    ...req.query,
    params: [req.params.tipo, req.params.simbolo],
    tipo: req.params.tipo,
    simbolo: req.params.simbolo,
  }
  runHandler(quoteHandler, req, res)
})

app.listen(PORT, () => {
  console.log(`[dev-api] API local en http://localhost:${PORT}`)
  console.log('[dev-api] Health: http://localhost:' + PORT + '/api/health')
  if (!process.env.JWT_SECRET) {
    console.warn('[dev-api] JWT_SECRET no configurado — usando valor por defecto del handler')
  }
})
