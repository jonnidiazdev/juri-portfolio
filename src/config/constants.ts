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
  OBLIGACION_NEGOCIABLE: 'obligacion-negociable',
  PLAZO_FIJO: 'plazo-fijo',
  EFECTIVO: 'efectivo',
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

// Configuración específica para efectivo y cuentas bancarias
export const EFECTIVO_CONFIG = {
  // Tipos de tenencia de efectivo
  TIPOS: {
    EFECTIVO: 'efectivo',
    CUENTA_BANCARIA: 'cuenta-bancaria',
    CUENTA_AHORRO: 'cuenta-ahorro',
    CUENTA_CORRIENTE: 'cuenta-corriente',
    CUENTA_DOLARES: 'cuenta-dolares',
    PLAZO_FIJO_TRADICIONAL: 'plazo-fijo-tradicional'
  },
  // Descripción de cada tipo
  TIPOS_DESCRIPCIONES: {
    'efectivo': 'Efectivo (Billetes)',
    'cuenta-bancaria': 'Cuenta Bancaria',
    'cuenta-ahorro': 'Caja de Ahorro',
    'cuenta-corriente': 'Cuenta Corriente',
    'cuenta-dolares': 'Cuenta en Dólares',
    'plazo-fijo-tradicional': 'Plazo Fijo Tradicional'
  },
  // Bancos populares en Argentina
  BANCOS: [
    'Banco Nación',
    'Banco Provincia de Buenos Aires',
    'Banco Ciudad de Buenos Aires',
    'Banco Macro',
    'Banco Galicia',
    'Banco Santander Río',
    'BBVA Argentina',
    'Banco Hipotecario',
    'Banco Supervielle',
    'Banco Patagonia',
    'Banco Credicoop',
    'Banco Industrial',
    'Efectivo (Sin banco)',
    'Otro'
  ]
}

export const PLAZO_FIJO_CONFIG = {
  // Tasas típicas en Argentina (solo referencia, el usuario ingresa la real)
  TYPICAL_RATES: {
    ARS: { min: 80, max: 120 }, // TNA típica en pesos
    USD: { min: 3, max: 8 }     // TNA típica en dólares
  },
  // Duración típica en días
  TYPICAL_DURATIONS: [30, 60, 90, 120, 180, 365],
  // Bancos populares (para referencia)
  POPULAR_BANKS: [
    'Banco Nación',
    'Banco Provincia',
    'Banco Ciudad',
    'Banco Macro',
    'Banco Galicia',
    'Banco Santander',
    'BBVA',
    'Banco Hipotecario',
    'Otros'
  ]
}
