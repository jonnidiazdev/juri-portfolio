import { useState } from 'react'
import { ASSET_TYPES } from '../config/constants'

export default function EditAssetModal({ isOpen, onClose, onSave, asset }) {
  const [formData, setFormData] = useState({
    amount: asset?.amount || '',
    purchasePrice: asset?.purchasePrice || '',
    currency: asset?.currency || 'ARS',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...asset,
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice),
      currency: asset.type === ASSET_TYPES.CRYPTO ? 'USD' : formData.currency,
    })
    onClose()
  }

  if (!isOpen || !asset) return null

  const isCrypto = asset.type === ASSET_TYPES.CRYPTO

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Editar Activo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-900 rounded-lg">
          <div className="text-sm text-gray-400">Activo</div>
          <div className="text-lg font-semibold text-white">{asset.name}</div>
          <div className="text-sm text-gray-400 uppercase">{asset.symbol}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isCrypto && (
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Moneda del Activo</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-2 text-sm">Cantidad</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              Precio de Compra ({isCrypto ? 'USD' : formData.currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              required
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
