import { describe, it, expect } from 'vitest'
import { validateEfectivo, calculateEfectivo } from './efectivoCalculations'

describe('validateEfectivo', () => {
  it('validates correct efectivo data', () => {
    const data = {
      amount: 10000,
      tipoEfectivo: 'efectivo',
      currency: 'ARS'
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects missing amount', () => {
    const data = {
      tipoEfectivo: 'efectivo',
      currency: 'ARS'
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('El monto debe ser mayor a 0')
  })

  it('rejects zero or negative amount', () => {
    const data1 = {
      amount: 0,
      tipoEfectivo: 'efectivo',
      currency: 'ARS'
    }
    
    const result1 = validateEfectivo(data1)
    expect(result1.isValid).toBe(false)
    
    const data2 = {
      amount: -1000,
      tipoEfectivo: 'efectivo',
      currency: 'ARS'
    }
    
    const result2 = validateEfectivo(data2)
    expect(result2.isValid).toBe(false)
  })

  it('rejects missing tipo de efectivo', () => {
    const data = {
      amount: 10000,
      currency: 'ARS'
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Debe seleccionar un tipo de tenencia')
  })

  it('rejects invalid tipo de efectivo', () => {
    const data = {
      amount: 10000,
      tipoEfectivo: 'invalid-tipo',
      currency: 'ARS'
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Tipo de tenencia no válido')
  })

  it('accepts valid tipo de efectivo', () => {
    const validTipos = ['efectivo', 'cuenta-bancaria', 'cuenta-ahorro', 'cuenta-corriente', 'cuenta-dolares']
    
    validTipos.forEach(tipo => {
      const data = {
        amount: 10000,
        tipoEfectivo: tipo,
        currency: 'ARS',
        banco: 'Test Bank'
      }
      
      const result = validateEfectivo(data)
      expect(result.isValid).toBe(true)
    })
  })

  it('rejects missing or invalid currency', () => {
    const data1 = {
      amount: 10000,
      tipoEfectivo: 'efectivo'
    }
    
    const result1 = validateEfectivo(data1)
    expect(result1.isValid).toBe(false)
    expect(result1.errors).toContain('Debe especificar la moneda (ARS o USD)')
    
    const data2 = {
      amount: 10000,
      tipoEfectivo: 'efectivo',
      currency: 'EUR'
    }
    
    const result2 = validateEfectivo(data2)
    expect(result2.isValid).toBe(false)
  })

  it('accepts USD currency', () => {
    const data = {
      amount: 10000,
      tipoEfectivo: 'efectivo',
      currency: 'USD'
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(true)
  })

  it('warns when banco is missing for cuenta bancaria', () => {
    const data = {
      amount: 10000,
      tipoEfectivo: 'cuenta-ahorro',
      currency: 'ARS',
      banco: null
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Se recomienda especificar el banco para cuentas bancarias')
  })

  it('does not require banco for efectivo type', () => {
    const data = {
      amount: 10000,
      tipoEfectivo: 'efectivo',
      currency: 'ARS',
      banco: null
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(true)
  })

  it('accumulates multiple errors', () => {
    const data = {
      amount: -100,
      tipoEfectivo: 'invalid',
      currency: 'EUR'
    }
    
    const result = validateEfectivo(data)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

describe('calculateEfectivo', () => {
  it('calculates efectivo correctly', () => {
    const result = calculateEfectivo(10000, 'efectivo', 'ARS')
    
    expect(result.availableAmount).toBe(10000)
    expect(result.currentValue).toBe(10000)
    expect(result.currency).toBe('ARS')
    expect(result.tipoEfectivo).toBe('efectivo')
    expect(result.isLiquid).toBe(true)
    expect(result.hasRisk).toBe(false)
    expect(result.rentabilidad).toBe(0)
    expect(result.yields).toBe(0)
  })

  it('includes banco information when provided', () => {
    const result = calculateEfectivo(10000, 'cuenta-ahorro', 'ARS', 'Banco Galicia')
    
    expect(result.banco).toBe('Banco Galicia')
    expect(result.descripcion).toContain('Banco Galicia')
  })

  it('sets "Sin banco" for efectivo tipo', () => {
    const result = calculateEfectivo(10000, 'efectivo', 'ARS', null)
    
    expect(result.banco).toBe('Sin banco')
  })

  it('requires banco for cuenta bancaria to pass validation', () => {
    // When banco is null for non-efectivo tipo, validation fails
    const validation = validateEfectivo({
      amount: 10000,
      tipoEfectivo: 'cuenta-ahorro',
      currency: 'ARS',
      banco: null
    })
    
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('Se recomienda especificar el banco para cuentas bancarias')
    
    // With banco provided, it should pass
    const result = calculateEfectivo(10000, 'cuenta-ahorro', 'ARS', 'Test Bank')
    expect(result.banco).toBe('Test Bank')
  })

  it('includes tipo descripcion', () => {
    const result = calculateEfectivo(10000, 'cuenta-ahorro', 'ARS', 'Test Bank')
    
    expect(result.tipoDescripcion).toBeTruthy()
  })

  it('uses custom descripcion when provided', () => {
    const customDesc = 'Mi cuenta especial'
    const result = calculateEfectivo(10000, 'efectivo', 'ARS', null, customDesc)
    
    expect(result.descripcion).toBe(customDesc)
  })

  it('handles USD currency', () => {
    const result = calculateEfectivo(5000, 'efectivo', 'USD')
    
    expect(result.currency).toBe('USD')
    expect(result.currentValue).toBe(5000)
  })

  it('throws error for invalid data', () => {
    expect(() => {
      calculateEfectivo(-1000, 'efectivo', 'ARS')
    }).toThrow('Datos de efectivo inválidos')
    
    expect(() => {
      calculateEfectivo(1000, 'invalid-type', 'ARS')
    }).toThrow('Datos de efectivo inválidos')
  })
})
