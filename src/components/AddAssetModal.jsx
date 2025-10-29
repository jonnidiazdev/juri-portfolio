import { useState } from 'react'
import { ASSET_TYPES, PLAZO_FIJO_CONFIG, EFECTIVO_CONFIG } from '../config/constants'
import { validatePlazoFijo } from '../utils/plazoFijoCalculations'
import { validateEfectivo } from '../utils/efectivoCalculations'

export default function AddAssetModal({ isOpen, onClose, onAdd }) {
  const [assetType, setAssetType] = useState(ASSET_TYPES.CRYPTO)
  const [currency, setCurrency] = useState('USD') // USD o ARS
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    amount: '',
    purchasePrice: '',
    // Campos específicos para plazo fijo
    tna: '',
    startDate: '',
    endDate: '',
    bank: '',
    // Campos específicos para efectivo
    tipoEfectivo: 'efectivo',
    banco: '',
    descripcion: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const assetData = {
      ...formData,
      type: assetType,
      currency: assetType === ASSET_TYPES.CRYPTO ? 'USD' : currency,
      amount: parseFloat(formData.amount),
      id: Date.now(),
    }

    // Para efectivo, no hay precio de compra
    if (assetType !== ASSET_TYPES.EFECTIVO) {
      assetData.purchasePrice = parseFloat(formData.purchasePrice)
    }

    // Validaciones específicas para plazo fijo
    if (assetType === ASSET_TYPES.PLAZO_FIJO) {
      assetData.tna = parseFloat(formData.tna)
      assetData.startDate = formData.startDate
      assetData.endDate = formData.endDate
      assetData.bank = formData.bank
      
      const validation = validatePlazoFijo(assetData)
      if (!validation.isValid) {
        alert('Errores en el plazo fijo:\n' + validation.errors.join('\n'))
        return
      }
    }

    // Validaciones específicas para efectivo
    if (assetType === ASSET_TYPES.EFECTIVO) {
      assetData.tipoEfectivo = formData.tipoEfectivo
      assetData.banco = formData.banco
      assetData.descripcion = formData.descripcion
      
      const validation = validateEfectivo(assetData)
      if (!validation.isValid) {
        alert('Errores en el efectivo:\n' + validation.errors.join('\n'))
        return
      }
    }

    onAdd(assetData)
    setFormData({ 
      symbol: '', 
      name: '', 
      amount: '', 
      purchasePrice: '',
      tna: '',
      startDate: '',
      endDate: '',
      bank: '',
      tipoEfectivo: 'efectivo',
      banco: '',
      descripcion: '',
    })
    setCurrency('USD')
    onClose()
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Agregar Activo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2 text-sm">Tipo de Activo</label>
            <select
              value={assetType}
              onChange={(e) => {
                setAssetType(e.target.value)
                // Auto-ajustar moneda según tipo
                if (e.target.value === ASSET_TYPES.CRYPTO) {
                  setCurrency('USD')
                } else if (e.target.value === ASSET_TYPES.STOCK || e.target.value === ASSET_TYPES.LETRA) {
                  setCurrency('ARS')
                } else if (e.target.value === ASSET_TYPES.EFECTIVO) {
                  setCurrency('ARS') // Por defecto pesos para efectivo
                }
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={ASSET_TYPES.CRYPTO}>Criptomoneda</option>
              <option value={ASSET_TYPES.STOCK}>Acción Argentina</option>
              <option value={ASSET_TYPES.CEDEAR}>CEDEAR</option>
              <option value={ASSET_TYPES.BOND}>Bono</option>
              <option value={ASSET_TYPES.LETRA}>Letra</option>
              <option value={ASSET_TYPES.OBLIGACION_NEGOCIABLE}>Obligación Negociable</option>
              <option value={ASSET_TYPES.PLAZO_FIJO}>Plazo Fijo</option>
              <option value={ASSET_TYPES.EFECTIVO}>Efectivo/Cuenta Bancaria</option>
            </select>
          </div>

          {assetType !== ASSET_TYPES.CRYPTO && assetType !== ASSET_TYPES.PLAZO_FIJO && (
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Moneda del Activo</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {assetType === ASSET_TYPES.BOND ? 
                  'Bonos pueden estar en ARS (ej: TX28) o USD (ej: GD30)' :
                  assetType === ASSET_TYPES.CEDEAR ?
                  'CEDEARs cotizan en ARS pero representan acciones en USD' :
                  assetType === ASSET_TYPES.EFECTIVO ?
                  'Selecciona la moneda del efectivo o cuenta bancaria' :
                  'Selecciona la moneda en que cotiza el activo'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              {assetType === ASSET_TYPES.CRYPTO ? 'ID (ej: bitcoin)' : 
               assetType === ASSET_TYPES.PLAZO_FIJO ? 'Identificador (ej: PF-001)' :
               assetType === ASSET_TYPES.EFECTIVO ? 'Identificador (ej: EFECTIVO-001)' :
               'Ticker/Símbolo (ej: GGAL, AL30)'}
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => {
                const raw = e.target.value
                const formatted = raw.toUpperCase()
                handleChange('symbol', formatted)
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              required
              placeholder={assetType === ASSET_TYPES.CRYPTO ? 'bitcoin' : 
                          assetType === ASSET_TYPES.PLAZO_FIJO ? 'PF-001' : 
                          assetType === ASSET_TYPES.EFECTIVO ? 'EFECTIVO-001' : 'GGAL'}
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              required
              placeholder={assetType === ASSET_TYPES.PLAZO_FIJO ? 'Plazo Fijo Banco X' : 'Nombre del activo'}
            />
          </div>

          {/* Campos específicos para plazo fijo */}
          {assetType === ASSET_TYPES.PLAZO_FIJO && (
            <>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Banco/Institución</label>
                <select
                  value={formData.bank}
                  onChange={(e) => handleChange('bank', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">Seleccionar banco...</option>
                  {PLAZO_FIJO_CONFIG.POPULAR_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">Moneda del Plazo Fijo</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  TNA típica: ARS {PLAZO_FIJO_CONFIG.TYPICAL_RATES.ARS.min}-{PLAZO_FIJO_CONFIG.TYPICAL_RATES.ARS.max}%, 
                  USD {PLAZO_FIJO_CONFIG.TYPICAL_RATES.USD.min}-{PLAZO_FIJO_CONFIG.TYPICAL_RATES.USD.max}%
                </p>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">TNA (Tasa Nominal Anual %)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tna}
                  onChange={(e) => handleChange('tna', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                  placeholder={currency === 'ARS' ? '85.00' : '5.00'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos específicos para efectivo */}
          {assetType === ASSET_TYPES.EFECTIVO && (
            <>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Tipo de Tenencia</label>
                <select
                  value={formData.tipoEfectivo}
                  onChange={(e) => handleChange('tipoEfectivo', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  {Object.entries(EFECTIVO_CONFIG.TIPOS_DESCRIPCIONES).map(([key, description]) => (
                    <option key={key} value={key}>{description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">Banco/Entidad</label>
                <select
                  value={formData.banco}
                  onChange={(e) => handleChange('banco', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Seleccionar banco...</option>
                  {EFECTIVO_CONFIG.BANCOS.map(banco => (
                    <option key={banco} value={banco}>{banco}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Opcional para efectivo en mano, recomendado para cuentas bancarias
                </p>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Ej: Efectivo para gastos, Cuenta para emergencias"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              {assetType === ASSET_TYPES.PLAZO_FIJO ? `Capital Inicial (${currency})` : 
               assetType === ASSET_TYPES.EFECTIVO ? `Monto Disponible (${currency})` : 'Cantidad'}
            </label>
            <input
              type="number"
              step={assetType === ASSET_TYPES.PLAZO_FIJO || assetType === ASSET_TYPES.EFECTIVO ? "0.01" : "0.00000001"}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              required
              placeholder={assetType === ASSET_TYPES.PLAZO_FIJO ? "100000.00" : 
                          assetType === ASSET_TYPES.EFECTIVO ? "50000.00" : "0"}
            />
          </div>

          {assetType !== ASSET_TYPES.PLAZO_FIJO && assetType !== ASSET_TYPES.EFECTIVO && (
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                Precio de Compra ({assetType === ASSET_TYPES.CRYPTO ? 'USD' : currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                required
                placeholder="0.00"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
