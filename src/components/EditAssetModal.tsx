import { useState, useEffect } from 'react'
import { ASSET_TYPES } from '../config/constants'

export default function EditAssetModal({ isOpen, onClose, onSave, asset }) {
  const [formData, setFormData] = useState({
    amount: '',
    purchasePrice: '',
    currency: 'ARS',
  })

  useEffect(() => {
    if (asset) {
      setFormData({
        amount: asset.amount || '',
        purchasePrice: asset.purchasePrice || '',
        currency: asset.currency || 'ARS',
      })
    }
  }, [asset])

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
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-semibold text-paper">Editar activo</h2>
          <button
            onClick={onClose}
            className="text-subtle hover:text-paper transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 card-raised">
          <div className="text-xs text-subtle font-mono-data uppercase tracking-wide">Activo</div>
          <div className="text-lg font-semibold text-paper">{asset.name}</div>
          <div className="text-sm text-muted font-mono-data uppercase">{asset.symbol}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isCrypto && (
            <div>
              <label className="field-label">Moneda del activo</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="field-input"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          )}

          <div>
            <label className="field-label">Cantidad</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="field-input"
              required
            />
          </div>

          <div>
            <label className="field-label">
              Precio de compra ({isCrypto ? 'USD' : formData.currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              className="field-input"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 px-4 py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 px-4 py-3"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
