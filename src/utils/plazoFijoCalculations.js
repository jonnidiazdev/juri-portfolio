// Utilidades para cálculos de plazos fijos

/**
 * Calcula el valor actual de un plazo fijo basado en días transcurridos
 * @param {number} capital - Capital inicial invertido
 * @param {number} tna - Tasa Nominal Anual (en porcentaje, ej: 85.5)
 * @param {Date} startDate - Fecha de inicio del plazo fijo
 * @param {Date} endDate - Fecha de vencimiento del plazo fijo
 * @param {Date} currentDate - Fecha actual (por defecto hoy)
 * @returns {Object} Información del plazo fijo
 */
export function calculatePlazoFijo(capital, tna, startDate, endDate, currentDate = new Date()) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const current = new Date(currentDate)
  
  // Calcular días
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, Math.ceil((current - start) / (1000 * 60 * 60 * 24)))
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

/**
 * Calcula la TNA equivalente basada en rendimiento obtenido
 * @param {number} capital - Capital inicial
 * @param {number} finalValue - Valor final obtenido
 * @param {number} days - Días de la inversión
 * @returns {number} TNA equivalente
 */
export function calculateEquivalentTNA(capital, finalValue, days) {
  if (capital <= 0 || days <= 0) return 0
  const gain = finalValue - capital
  const dailyReturn = gain / capital / days
  return dailyReturn * 365 * 100
}

/**
 * Formatea información de plazo fijo para mostrar
 * @param {Object} plazoFijoData - Datos del plazo fijo
 * @returns {Object} Datos formateados
 */
export function formatPlazoFijoInfo(plazoFijoData) {
  const {
    totalDays,
    elapsedDays,
    remainingDays,
    completionPercentage,
    isExpired,
    isActive,
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

/**
 * Valida los datos de un plazo fijo
 * @param {Object} plazoFijoData - Datos a validar
 * @returns {Object} Resultado de validación
 */
export function validatePlazoFijo(plazoFijoData) {
  const errors = []
  
  if (!plazoFijoData.amount || plazoFijoData.amount <= 0) {
    errors.push('El monto debe ser mayor a 0')
  }
  
  if (!plazoFijoData.tna || plazoFijoData.tna <= 0) {
    errors.push('La TNA debe ser mayor a 0')
  }
  
  if (plazoFijoData.tna > 200) {
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
    
    const days = (end - start) / (1000 * 60 * 60 * 24)
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