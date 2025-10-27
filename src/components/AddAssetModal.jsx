import { useState } from 'react'
import { ASSET_TYPES } from '../config/constants'

export default function AddAssetModal({ isOpen, onClose, onAdd }) {
  const [assetType, setAssetType] = useState(ASSET_TYPES.CRYPTO)
  const [currency, setCurrency] = useState('USD') // USD o ARS
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    amount: '',
    purchasePrice: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      ...formData,
      type: assetType,
      currency: assetType === ASSET_TYPES.CRYPTO ? 'USD' : currency,
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice),
      id: Date.now(),
    })
    setFormData({ symbol: '', name: '', amount: '', purchasePrice: '' })
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
                }
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={ASSET_TYPES.CRYPTO}>Criptomoneda</option>
              <option value={ASSET_TYPES.STOCK}>Acción Argentina</option>
              <option value={ASSET_TYPES.CEDEAR}>CEDEAR</option>
              <option value={ASSET_TYPES.BOND}>Bono</option>
              <option value={ASSET_TYPES.LETRA}>Letra</option>
            </select>
          </div>

          {assetType !== ASSET_TYPES.CRYPTO && (
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
                  'Selecciona la moneda en que cotiza el activo'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              {assetType === ASSET_TYPES.CRYPTO ? 'ID (ej: bitcoin)' : 'Ticker/Símbolo (ej: GGAL, AL30)'}
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => {
                const raw = e.target.value
                const formatted = assetType === ASSET_TYPES.CRYPTO ? raw.toLowerCase() : raw.toUpperCase()
                handleChange('symbol', formatted)
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              required
              placeholder={assetType === ASSET_TYPES.CRYPTO ? 'bitcoin' : 'GGAL'}
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
              placeholder="Nombre del activo"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm">Cantidad</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              required
              placeholder="0"
            />
          </div>

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
