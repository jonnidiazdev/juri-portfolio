// Utilidades para cálculos de plazos fijos

import type { PlazoFijoResult, PlazoFijoFormatted, ValidationResult } from '../types'

export function calculatePlazoFijo(
  capital: number,
  tna: number,
  startDate: string | Date,
  endDate: string | Date,
  currentDate: Date = new Date()
): PlazoFijoResult {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const current = new Date(currentDate)
  
  // Calcular días
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const remainingDays = Math.max(0, totalDays - elapsedDays)
  
  // Tasa diaria
  const dailyRate = tna / 100 / 365
  
  // Valor proyectado al vencimiento
  const finalValue = capital * (1 + (tna / 100) * (totalDays / 365))
  
  // Valor actual (rendimiento devengado hasta hoy)
  const currentValue = capital * (1 + dailyRate * elapsedDays)
  
  // Intereses devengados hasta hoy
  const earnedInterest = currentValue - capital
  
  // Intereses totales al vencimiento
  const totalInterest = finalValue - capital
  
  // Porcentaje completado
  const completionPercentage = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0
  
  // Estado del plazo fijo
  const isExpired = current > end
  const isActive = current >= start && current <= end
  
  return {
    capital,
    tna,
    totalDays,
    elapsedDays,
    remainingDays,
    currentValue: isExpired ? finalValue : currentValue,
    finalValue,
    earnedInterest: isExpired ? totalInterest : earnedInterest,
    totalInterest,
    completionPercentage: isExpired ? 100 : Math.min(completionPercentage, 100),
    dailyRate,
    isExpired,
    isActive,
    status: isExpired ? 'vencido' : isActive ? 'activo' : 'pendiente'
  }
}

export function calculateEquivalentTNA(capital: number, finalValue: number, days: number): number {
  if (capital <= 0 || days <= 0) return 0
  const gain = finalValue - capital
  const dailyReturn = gain / capital / days
  return dailyReturn * 365 * 100
}

export function formatPlazoFijoInfo(plazoFijoData: PlazoFijoResult): PlazoFijoFormatted {
  const {
    totalDays,
    elapsedDays,
    remainingDays,
    completionPercentage,
    isExpired,
    status
  } = plazoFijoData
  
  return {
    durationText: `${totalDays} días`,
    progressText: isExpired 
      ? 'Vencido' 
      : `${elapsedDays}/${totalDays} días`,
    remainingText: isExpired 
      ? 'Plazo cumplido' 
      : `${remainingDays} días restantes`,
    statusText: status === 'vencido' 
      ? 'Vencido' 
      : status === 'activo' 
        ? 'Activo' 
        : 'Pendiente',
    statusColor: status === 'vencido' 
      ? 'text-red-400' 
      : status === 'activo' 
        ? 'text-green-400' 
        : 'text-yellow-400',
    progressPercentage: Math.round(completionPercentage),
    progressBarColor: status === 'vencido' 
      ? 'bg-red-500' 
      : status === 'activo' 
        ? 'bg-green-500' 
        : 'bg-yellow-500'
  }
}

export function validatePlazoFijo(plazoFijoData: { amount?: number; tna?: number; startDate?: string; endDate?: string }): ValidationResult {
  const errors: string[] = []
  
  if (!plazoFijoData.amount || plazoFijoData.amount <= 0) {
    errors.push('El monto debe ser mayor a 0')
  }
  
  if (!plazoFijoData.tna || plazoFijoData.tna <= 0) {
    errors.push('La TNA debe ser mayor a 0')
  }
  
  if (plazoFijoData.tna && plazoFijoData.tna > 200) {
    errors.push('La TNA parece excesivamente alta (>200%)')
  }
  
  if (!plazoFijoData.startDate) {
    errors.push('La fecha de inicio es requerida')
  }
  
  if (!plazoFijoData.endDate) {
    errors.push('La fecha de vencimiento es requerida')
  }
  
  if (plazoFijoData.startDate && plazoFijoData.endDate) {
    const start = new Date(plazoFijoData.startDate)
    const end = new Date(plazoFijoData.endDate)
    
    if (end <= start) {
      errors.push('La fecha de vencimiento debe ser posterior a la fecha de inicio')
    }
    
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    if (days < 1) {
      errors.push('El plazo fijo debe durar al menos 1 día')
    }
    
    if (days > 3650) { // 10 años
      errors.push('El plazo fijo no puede durar más de 10 años')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}