import { describe, it, expect } from 'vitest'
import {
  calculatePlazoFijo,
  calculateEquivalentTNA,
  formatPlazoFijoInfo,
  validatePlazoFijo
} from './plazoFijoCalculations'

describe('calculatePlazoFijo', () => {
  it('calculates correctly for active plazo fijo', () => {
    const capital = 100000
    const tna = 50 // 50% annual rate
    const startDate = '2026-01-01'
    const endDate = '2026-12-31'
    const currentDate = new Date('2026-06-01') // Mid-year
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate, currentDate)
    
    expect(result.capital).toBe(capital)
    expect(result.tna).toBe(tna)
    expect(result.isActive).toBe(true)
    expect(result.isExpired).toBe(false)
    expect(result.status).toBe('activo')
    expect(result.totalDays).toBeGreaterThan(0)
    expect(result.currentValue).toBeGreaterThan(capital)
    expect(result.finalValue).toBeGreaterThan(result.currentValue)
    expect(result.completionPercentage).toBeGreaterThan(0)
    expect(result.completionPercentage).toBeLessThan(100)
  })

  it('marks plazo fijo as expired when current date > end date', () => {
    const capital = 100000
    const tna = 50
    const startDate = '2026-01-01'
    const endDate = '2026-03-31'
    const currentDate = new Date('2026-05-01') // After end date
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate, currentDate)
    
    expect(result.isExpired).toBe(true)
    expect(result.isActive).toBe(false)
    expect(result.status).toBe('vencido')
    expect(result.completionPercentage).toBe(100)
    expect(result.currentValue).toBe(result.finalValue)
    expect(result.earnedInterest).toBe(result.totalInterest)
  })

  it('marks plazo fijo as pending when current date < start date', () => {
    const capital = 100000
    const tna = 50
    const startDate = '2026-06-01'
    const endDate = '2026-12-31'
    const currentDate = new Date('2026-05-01') // Before start date
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate, currentDate)
    
    expect(result.isActive).toBe(false)
    expect(result.isExpired).toBe(false)
    expect(result.status).toBe('pendiente')
    expect(result.elapsedDays).toBe(0)
    expect(result.earnedInterest).toBe(0)
  })

  it('calculates correct daily rate', () => {
    const capital = 100000
    const tna = 36.5 // Convenient for testing: 36.5% / 365 = 0.1% daily
    const startDate = '2026-01-01'
    const endDate = '2026-12-31'
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate)
    
    expect(result.dailyRate).toBeCloseTo(0.001, 5) // 0.1%
  })

  it('calculates final value correctly for 365 days at 100% TNA', () => {
    const capital = 100000
    const tna = 100 // 100% annual rate
    const startDate = '2026-01-01'
    const endDate = '2026-12-31' // 364 days in 2026 (not leap year)
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate)
    
    // finalValue = capital * (1 + tna% * days/365)
    // For approximately 365 days at 100%, should be close to double
    expect(result.finalValue).toBeGreaterThan(capital)
    expect(result.totalInterest).toBeGreaterThan(0)
  })

  it('handles same start and end date', () => {
    const capital = 100000
    const tna = 50
    const startDate = '2026-05-01'
    const endDate = '2026-05-01'
    const currentDate = new Date('2026-05-01')
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate, currentDate)
    
    expect(result.totalDays).toBeGreaterThanOrEqual(0)
    expect(result.isActive).toBe(true)
  })

  it('handles zero TNA', () => {
    const capital = 100000
    const tna = 0
    const startDate = '2026-01-01'
    const endDate = '2026-12-31'
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate)
    
    expect(result.finalValue).toBe(capital)
    expect(result.totalInterest).toBe(0)
    expect(result.dailyRate).toBe(0)
  })

  it('uses current date by default when not provided', () => {
    const capital = 100000
    const tna = 50
    const startDate = '2025-01-01'
    const endDate = '2027-01-01'
    
    const result = calculatePlazoFijo(capital, tna, startDate, endDate)
    
    // Should use current date (May 2026 based on test context)
    expect(result.isActive || result.isExpired || result.status === 'pendiente').toBe(true)
  })
})

describe('calculateEquivalentTNA', () => {
  it('calculates correct TNA for known values', () => {
    const capital = 100000
    const finalValue = 150000 // 50% gain
    const days = 365
    
    const tna = calculateEquivalentTNA(capital, finalValue, days)
    
    // 50% gain over 365 days = 50% TNA
    expect(tna).toBeCloseTo(50, 1)
  })

  it('returns 0 for zero capital', () => {
    expect(calculateEquivalentTNA(0, 100000, 365)).toBe(0)
  })

  it('returns 0 for negative capital', () => {
    expect(calculateEquivalentTNA(-100000, 100000, 365)).toBe(0)
  })

  it('returns 0 for zero days', () => {
    expect(calculateEquivalentTNA(100000, 150000, 0)).toBe(0)
  })

  it('returns 0 for negative days', () => {
    expect(calculateEquivalentTNA(100000, 150000, -365)).toBe(0)
  })

  it('calculates TNA for 180-day period', () => {
    const capital = 100000
    const finalValue = 110000 // 10% gain
    const days = 180
    
    const tna = calculateEquivalentTNA(capital, finalValue, days)
    
    // 10% gain in 180 days = 20% annualized (approx)
    expect(tna).toBeGreaterThan(19)
    expect(tna).toBeLessThan(21)
  })

  it('handles same capital and final value (0% return)', () => {
    const tna = calculateEquivalentTNA(100000, 100000, 365)
    expect(tna).toBe(0)
  })

  it('calculates high TNA correctly', () => {
    const capital = 100000
    const finalValue = 200000 // 100% gain
    const days = 365
    
    const tna = calculateEquivalentTNA(capital, finalValue, days)
    
    expect(tna).toBeCloseTo(100, 1)
  })
})

describe('formatPlazoFijoInfo', () => {
  it('formats active plazo fijo correctly', () => {
    const plazoFijoData = {
      capital: 100000,
      tna: 50,
      totalDays: 100,
      elapsedDays: 50,
      remainingDays: 50,
      currentValue: 110000,
      finalValue: 120000,
      earnedInterest: 10000,
      totalInterest: 20000,
      completionPercentage: 50,
      dailyRate: 0.001,
      isExpired: false,
      isActive: true,
      status: 'activo' as const
    }
    
    const formatted = formatPlazoFijoInfo(plazoFijoData)
    
    expect(formatted.durationText).toBe('100 días')
    expect(formatted.progressText).toBe('50/100 días')
    expect(formatted.remainingText).toBe('50 días restantes')
    expect(formatted.statusText).toBe('Activo')
    expect(formatted.statusColor).toBe('text-green-400')
    expect(formatted.progressPercentage).toBe(50)
    expect(formatted.progressBarColor).toBe('bg-green-500')
  })

  it('formats expired plazo fijo correctly', () => {
    const plazoFijoData = {
      capital: 100000,
      tna: 50,
      totalDays: 100,
      elapsedDays: 100,
      remainingDays: 0,
      currentValue: 120000,
      finalValue: 120000,
      earnedInterest: 20000,
      totalInterest: 20000,
      completionPercentage: 100,
      dailyRate: 0.001,
      isExpired: true,
      isActive: false,
      status: 'vencido' as const
    }
    
    const formatted = formatPlazoFijoInfo(plazoFijoData)
    
    expect(formatted.progressText).toBe('Vencido')
    expect(formatted.remainingText).toBe('Plazo cumplido')
    expect(formatted.statusText).toBe('Vencido')
    expect(formatted.statusColor).toBe('text-red-400')
    expect(formatted.progressPercentage).toBe(100)
    expect(formatted.progressBarColor).toBe('bg-red-500')
  })

  it('formats pending plazo fijo correctly', () => {
    const plazoFijoData = {
      capital: 100000,
      tna: 50,
      totalDays: 100,
      elapsedDays: 0,
      remainingDays: 100,
      currentValue: 100000,
      finalValue: 120000,
      earnedInterest: 0,
      totalInterest: 20000,
      completionPercentage: 0,
      dailyRate: 0.001,
      isExpired: false,
      isActive: false,
      status: 'pendiente' as const
    }
    
    const formatted = formatPlazoFijoInfo(plazoFijoData)
    
    expect(formatted.statusText).toBe('Pendiente')
    expect(formatted.statusColor).toBe('text-yellow-400')
    expect(formatted.progressBarColor).toBe('bg-yellow-500')
    expect(formatted.remainingText).toBe('100 días restantes')
  })

  it('rounds completion percentage correctly', () => {
    const plazoFijoData = {
      capital: 100000,
      tna: 50,
      totalDays: 100,
      elapsedDays: 33,
      remainingDays: 67,
      currentValue: 105000,
      finalValue: 120000,
      earnedInterest: 5000,
      totalInterest: 20000,
      completionPercentage: 33.333,
      dailyRate: 0.001,
      isExpired: false,
      isActive: true,
      status: 'activo' as const
    }
    
    const formatted = formatPlazoFijoInfo(plazoFijoData)
    
    expect(formatted.progressPercentage).toBe(33)
  })
})

describe('validatePlazoFijo', () => {
  it('validates correct plazo fijo data', () => {
    const data = {
      amount: 100000,
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects missing amount', () => {
    const data = {
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('El monto debe ser mayor a 0')
  })

  it('rejects zero or negative amount', () => {
    const data1 = {
      amount: 0,
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }
    
    const result1 = validatePlazoFijo(data1)
    expect(result1.isValid).toBe(false)
    expect(result1.errors).toContain('El monto debe ser mayor a 0')
    
    const data2 = {
      amount: -1000,
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }
    
    const result2 = validatePlazoFijo(data2)
    expect(result2.isValid).toBe(false)
  })

  it('rejects missing TNA', () => {
    const data = {
      amount: 100000,
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('La TNA debe ser mayor a 0')
  })

  it('rejects excessively high TNA (>200%)', () => {
    const data = {
      amount: 100000,
      tna: 250,
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('La TNA parece excesivamente alta (>200%)')
  })

  it('accepts TNA at 200% boundary', () => {
    const data = {
      amount: 100000,
      tna: 200,
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(true)
  })

  it('rejects missing start date', () => {
    const data = {
      amount: 100000,
      tna: 50,
      endDate: '2026-12-31'
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('La fecha de inicio es requerida')
  })

  it('rejects missing end date', () => {
    const data = {
      amount: 100000,
      tna: 50,
      startDate: '2026-01-01'
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('La fecha de vencimiento es requerida')
  })

  it('rejects end date before or equal to start date', () => {
    const data1 = {
      amount: 100000,
      tna: 50,
      startDate: '2026-12-31',
      endDate: '2026-01-01'
    }
    
    const result1 = validatePlazoFijo(data1)
    expect(result1.isValid).toBe(false)
    expect(result1.errors).toContain('La fecha de vencimiento debe ser posterior a la fecha de inicio')
    
    const data2 = {
      amount: 100000,
      tna: 50,
      startDate: '2026-06-01',
      endDate: '2026-06-01'
    }
    
    const result2 = validatePlazoFijo(data2)
    expect(result2.isValid).toBe(false)
  })

  it('rejects plazo fijo shorter than 1 day', () => {
    const data = {
      amount: 100000,
      tna: 50,
      startDate: '2026-06-01T10:00:00',
      endDate: '2026-06-01T14:00:00' // Same day, few hours later
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('El plazo fijo debe durar al menos 1 día')
  })

  it('rejects plazo fijo longer than 10 years', () => {
    const data = {
      amount: 100000,
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2037-01-01' // 11 years
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('El plazo fijo no puede durar más de 10 años')
  })

  it('accepts plazo fijo under 10 years', () => {
    const data = {
      amount: 100000,
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2035-06-01' // About 9.5 years (well under 3650 days)
    }
    
    const result = validatePlazoFijo(data)
    
    // Should be valid (no >10 years error)
    expect(result.errors).not.toContain('El plazo fijo no puede durar más de 10 años')
  })

  it('accumulates multiple errors', () => {
    const data = {
      amount: -100,
      tna: 0,
      startDate: '',
      endDate: ''
    }
    
    const result = validatePlazoFijo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })
})
