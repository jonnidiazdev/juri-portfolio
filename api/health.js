/*
 * Vercel Serverless Functions - SOLO PARA PRODUCCIÓN
 * 
 * Estas funciones se ejecutan automáticamente en Vercel.
 * Para desarrollo local, usar Express (server/index.js).
 * 
 * Ver ARCHITECTURE.md para más información.
 */

export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    service: 'vercel'
  })
}