import { EFECTIVO_CONFIG } from '../config/constants.js'

/**
 * Valida si un activo de efectivo tiene todos los campos requeridos
 * @param {Object} efectivoData - Datos del efectivo
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateEfectivo(efectivoData) {
  const errors = []
  
  if (!efectivoData.amount || efectivoData.amount <= 0) {
    errors.push('El monto debe ser mayor a 0')
  }
  
  if (!efectivoData.tipoEfectivo) {
    errors.push('Debe seleccionar un tipo de tenencia')
  } else if (!Object.keys(EFECTIVO_CONFIG.TIPOS).includes(efectivoData.tipoEfectivo.toUpperCase().replace('-', '_'))) {
    errors.push('Tipo de tenencia no válido')
  }
  
  if (!efectivoData.currency || !['ARS', 'USD'].includes(efectivoData.currency)) {
    errors.push('Debe especificar la moneda (ARS o USD)')
  }
  
  // Para cuentas bancarias, es recomendable especificar el banco
  if (efectivoData.tipoEfectivo !== 'efectivo' && !efectivoData.banco) {
    // Solo advertencia, no error
    errors.push('Se recomienda especificar el banco para cuentas bancarias')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calcula la información completa del efectivo
 * @param {number} amount - Monto disponible
 * @param {string} tipoEfectivo - Tipo de tenencia
 * @param {string} currency - Moneda (ARS/USD)
 * @param {string} banco - Entidad bancaria (opcional)
 * @param {string} descripcion - Descripción adicional (opcional)
 * @returns {Object} Información calculada del efectivo
 */
export function calculateEfectivo(amount, tipoEfectivo, currency, banco = null, descripcion = null) {
  const validation = validateEfectivo({ amount, tipoEfectivo, currency, banco })
  
  if (!validation.isValid) {
    throw new Error(`Datos de efectivo inválidos: ${validation.errors.join(', ')}`)
  }
  
  return {
    // Monto disponible (para efectivo, disponible = valor actual)
    availableAmount: amount,
    currentValue: amount,
    
    // Información del tipo
    tipoEfectivo,
    tipoDescripcion: EFECTIVO_CONFIG.TIPOS_DESCRIPCIONES[tipoEfectivo] || tipoEfectivo,
    
    // Información bancaria
    banco: banco || (tipoEfectivo === 'efectivo' ? 'Sin banco' : 'No especificado'),
    
    // Moneda
    currency,
    
    // Descripción
    descripcion: descripcion || `${EFECTIVO_CONFIG.TIPOS_DESCRIPCIONES[tipoEfectivo] || tipoEfectivo}${banco ? ` - ${banco}` : ''}`,
    
    // Metadatos
    isLiquid: true, // El efectivo es siempre líquido
    hasRisk: false, // El efectivo no tiene riesgo de mercado
    
    // Para compatibilidad con otros activos
    rentabilidad: 0, // El efectivo no genera rentabilidad por sí mismo
    yields: 0
  }
}

/**
 * Formatea la información del efectivo para mostrar
 * @param {Object} efectivoData - Datos calculados del efectivo
 * @returns {Object} Información formateada
 */
export function formatEfectivoInfo(efectivoData) {
  return {
    titulo: efectivoData.tipoDescripcion,
    subtitulo: efectivoData.banco,
    montoFormateado: new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: efectivoData.currency,
      minimumFractionDigits: 2
    }).format(efectivoData.currentValue),
    descripcion: efectivoData.descripcion,
    disponibilidad: 'Inmediata', // El efectivo está siempre disponible
    liquidez: 'Alta',
    riesgo: 'Nulo'
  }
}

/**
 * Obtiene el ícono apropiado para el tipo de efectivo
 * @param {string} tipoEfectivo - Tipo de tenencia
 * @returns {string} Clase de ícono
 */
export function getEfectivoIcon(tipoEfectivo) {
  const iconMap = {
    'efectivo': '💵',
    'cuenta-bancaria': '🏦',
    'cuenta-ahorro': '🏪',
    'cuenta-corriente': '🏛️',
    'cuenta-dolares': '💸',
    'plazo-fijo-tradicional': '📊'
  }
  
  return iconMap[tipoEfectivo] || '💰'
}

/**
 * Obtiene el color apropiado para el tipo de efectivo
 * @param {string} tipoEfectivo - Tipo de tenencia
 * @returns {string} Clase de color de Tailwind
 */
export function getEfectivoColor(tipoEfectivo) {
  const colorMap = {
    'efectivo': 'green',
    'cuenta-bancaria': 'blue',
    'cuenta-ahorro': 'indigo',
    'cuenta-corriente': 'purple',
    'cuenta-dolares': 'yellow',
    'plazo-fijo-tradicional': 'gray'
  }
  
  return colorMap[tipoEfectivo] || 'gray'
}

/**
 * Calcula estadísticas agregadas de efectivo
 * @param {Array} efectivoAssets - Array de activos de efectivo
 * @returns {Object} Estadísticas agregadas
 */
export function calculateEfectivoStats(efectivoAssets) {
  if (!efectivoAssets || efectivoAssets.length === 0) {
    return {
      totalARS: 0,
      totalUSD: 0,
      totalCuentas: 0,
      efectivoEnMano: 0,
      distribuccionPorTipo: {},
      distribucionPorBanco: {}
    }
  }
  
  const stats = {
    totalARS: 0,
    totalUSD: 0,
    totalCuentas: 0,
    efectivoEnMano: 0,
    distribuccionPorTipo: {},
    distribuccionPorBanco: {}
  }
  
  efectivoAssets.forEach(asset => {
    const efectivoData = calculateEfectivo(
      asset.amount,
      asset.tipoEfectivo,
      asset.currency,
      asset.banco,
      asset.descripcion
    )
    
    // Sumar por moneda
    if (asset.currency === 'ARS') {
      stats.totalARS += efectivoData.currentValue
    } else if (asset.currency === 'USD') {
      stats.totalUSD += efectivoData.currentValue
    }
    
    // Contar cuentas vs efectivo
    if (asset.tipoEfectivo === 'efectivo') {
      stats.efectivoEnMano += efectivoData.currentValue
    } else {
      stats.totalCuentas += 1
    }
    
    // Distribución por tipo
    const tipo = asset.tipoEfectivo
    stats.distribuccionPorTipo[tipo] = (stats.distribuccionPorTipo[tipo] || 0) + efectivoData.currentValue
    
    // Distribución por banco
    const banco = asset.banco || 'Sin especificar'
    stats.distribuccionPorBanco[banco] = (stats.distribuccionPorBanco[banco] || 0) + efectivoData.currentValue
  })
  
  return stats
}