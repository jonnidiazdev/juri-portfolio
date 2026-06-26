export interface CurrencyOption {
  id: string
  name: string
  icon: string
  apiKey: string
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { id: 'blue', name: 'Blue', icon: '💸', apiKey: 'blue' },
  { id: 'bolsa', name: 'MEP', icon: '💱', apiKey: 'bolsa' },
  { id: 'contadoconliqui', name: 'CCL', icon: '🏦', apiKey: 'contadoconliqui' },
  { id: 'oficial', name: 'Oficial', icon: '🏛️', apiKey: 'oficial' },
]

import type { DolarPrices } from '../types'

export function getSelectedCurrencyRate(
  dolarData: DolarPrices | Record<string, { compra: number; venta: number }> | null | undefined,
  preference: string = 'blue'
) {
  const option = CURRENCY_OPTIONS.find(opt => opt.id === preference)
  const quote = option ? dolarData?.[option.apiKey] : undefined
  if (!option || !quote?.venta) return null

  return {
    buy: quote.compra,
    sell: quote.venta,
    name: option.name,
    id: option.id,
  }
}
