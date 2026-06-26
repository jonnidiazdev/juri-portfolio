import { EFECTIVO_CONFIG } from '../config/constants'
import type { ValidationResult, EfectivoInfo } from '../types'

const TIPOS_DESCRIPCIONES = EFECTIVO_CONFIG.TIPOS_DESCRIPCIONES as Record<string, string>
const TIPOS_KEYS = Object.keys(EFECTIVO_CONFIG.TIPOS)

export function validateEfectivo(efectivoData: { amount?: number; tipoEfectivo?: string; currency?: string; banco?: string | null }): ValidationResult {
  const errors: string[] = []
  
  if (!efectivoData.amount || efectivoData.amount <= 0) {
    errors.push('El monto debe ser mayor a 0')
  }
  
  if (!efectivoData.tipoEfectivo) {
    errors.push('Debe seleccionar un tipo de tenencia')
  } else if (!TIPOS_KEYS.includes(efectivoData.tipoEfectivo.toUpperCase().replace('-', '_'))) {
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

export function calculateEfectivo(
  amount: number,
  tipoEfectivo: string,
  currency: string,
  banco: string | null = null,
  descripcion: string | null = null
): EfectivoInfo {
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
    tipoDescripcion: TIPOS_DESCRIPCIONES[tipoEfectivo] || tipoEfectivo,
    
    // Información bancaria
    banco: banco || (tipoEfectivo === 'efectivo' ? 'Sin banco' : 'No especificado'),
    
    // Moneda
    currency,
    
    // Descripción
    descripcion: descripcion || `${TIPOS_DESCRIPCIONES[tipoEfectivo] || tipoEfectivo}${banco ? ` - ${banco}` : ''}`,
    
    // Metadatos
    isLiquid: true, // El efectivo es siempre líquido
    hasRisk: false, // El efectivo no tiene riesgo de mercado
    
    // Para compatibilidad con otros activos
    rentabilidad: 0, // El efectivo no genera rentabilidad por sí mismo
    yields: 0
  }
}

interface EfectivoFormatted {
  titulo: string
  subtitulo: string
  montoFormateado: string
  descripcion: string
  disponibilidad: string
  liquidez: string
  riesgo: string
}

export function formatEfectivoInfo(efectivoData: EfectivoInfo): EfectivoFormatted {
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

export function getEfectivoIcon(tipoEfectivo: string): string {
  const iconMap: Record<string, string> = {
    'efectivo': '💵',
    'cuenta-bancaria': '🏦',
    'cuenta-ahorro': '🏪',
    'cuenta-corriente': '🏛️',
    'cuenta-dolares': '💸',
    'plazo-fijo-tradicional': '📊'
  }
  
  return iconMap[tipoEfectivo] || '💰'
}

export function getEfectivoColor(tipoEfectivo: string): string {
  const colorMap: Record<string, string> = {
    'efectivo': 'green',
    'cuenta-bancaria': 'blue',
    'cuenta-ahorro': 'indigo',
    'cuenta-corriente': 'purple',
    'cuenta-dolares': 'yellow',
    'plazo-fijo-tradicional': 'gray'
  }
  
  return colorMap[tipoEfectivo] || 'gray'
}