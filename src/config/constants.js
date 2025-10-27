export const API_ENDPOINTS = {
  // Usa endpoint Pro si hay API key definida
  crypto: import.meta.env.VITE_COINGECKO_API_KEY
    ? 'https://pro-api.coingecko.com/api/v3/simple/price'
    : 'https://api.coingecko.com/api/v3/simple/price',
  // Para activos argentinos (se consume vía backend proxy, este valor es referencial)
  iolAPI: 'https://api.invertironline.com/api/v2/Cotizaciones',
  dolarAPI: 'https://dolarapi.com/v1/dolares',
  // Cotizaciones individuales
  dolarBlue: 'https://dolarapi.com/v1/dolares/blue',
  dolarOficial: 'https://dolarapi.com/v1/dolares/oficial',
  dolarBolsa: 'https://dolarapi.com/v1/dolares/bolsa',
  dolarContadoConLiqui: 'https://dolarapi.com/v1/dolares/contadoconliqui',
  dolarMayorista: 'https://dolarapi.com/v1/dolares/mayorista',
  dolarCripto: 'https://dolarapi.com/v1/dolares/cripto',
  dolarTarjeta: 'https://dolarapi.com/v1/dolares/tarjeta',
}

// Tipos de dólar disponibles en Argentina
export const DOLAR_TYPES = {
  OFICIAL: 'oficial',
  BLUE: 'blue',
  BOLSA: 'bolsa',
  CCL: 'contadoconliqui',
  MAYORISTA: 'mayorista',
  CRIPTO: 'cripto',
  TARJETA: 'tarjeta',
}

// Descripciones de cada tipo de dólar
export const DOLAR_DESCRIPTIONS = {
  oficial: 'Dólar Oficial (Banco Nación)',
  blue: 'Dólar Blue (Informal)',
  bolsa: 'Dólar MEP (Bolsa)',
  contadoconliqui: 'Dólar CCL (Contado con Liquidación)',
  mayorista: 'Dólar Mayorista (Interbancario)',
  cripto: 'Dólar Cripto (Exchanges)',
  tarjeta: 'Dólar Tarjeta (Turista + Impuestos)',
}

export const ASSET_TYPES = {
  CRYPTO: 'crypto',
  STOCK: 'accion',
  CEDEAR: 'cedear',
  BOND: 'bono',
  LETRA: 'letra',
}

export const FIAT_CURRENCIES = ['usd', 'ars']

export const REFRESH_INTERVALS = {
  normal: 60000, // 1 minuto para precios más frescos
  slow: 300000, // 5 minutos
}

// IDs populares de criptomonedas
export const POPULAR_CRYPTOS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'usd-coin',
  'ripple', 'cardano', 'dogecoin', 'solana', 'polkadot'
]
