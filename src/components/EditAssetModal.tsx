import { useEffect, useId, useState, type FormEvent } from 'react'
import { ASSET_TYPES } from '../config/constants'
import type { Asset } from '../types'
import Modal from './Modal'

interface EditAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (asset: Asset) => void
  asset: Asset | null
}

export default function EditAssetModal({ isOpen, onClose, onSave, asset }: EditAssetModalProps) {
  const fieldId = useId()
  const [formData, setFormData] = useState({
    amount: '',
    purchasePrice: '',
    currency: 'ARS',
  })

  const ids = {
    currency: `${fieldId}-currency`,
    amount: `${fieldId}-amount`,
    purchasePrice: `${fieldId}-purchase-price`,
  }

  useEffect(() => {
    if (asset) {
      setFormData({
        amount: String(asset.amount ?? ''),
        purchasePrice: String(asset.purchasePrice ?? ''),
        currency: asset.currency || 'ARS',
      })
    }
  }, [asset])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!asset) return
    onSave({
      ...asset,
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice),
      currency: asset.type === ASSET_TYPES.CRYPTO ? 'USD' : formData.currency,
    })
    onClose()
  }

  if (!asset) return null

  const isCrypto = asset.type === ASSET_TYPES.CRYPTO

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar activo">
      <div className="mb-4 p-3 card-raised">
        <div className="text-xs text-subtle font-mono-data uppercase tracking-wide">Activo</div>
        <div className="text-lg font-semibold text-paper">{asset.name}</div>
        <div className="text-sm text-muted font-mono-data uppercase">{asset.symbol}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isCrypto && (
          <div>
            <label htmlFor={ids.currency} className="field-label">Moneda del activo</label>
            <select
              id={ids.currency}
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
          <label htmlFor={ids.amount} className="field-label">Cantidad</label>
          <input
            id={ids.amount}
            type="number"
            step="0.00000001"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="field-input"
            required
          />
        </div>

        <div>
          <label htmlFor={ids.purchasePrice} className="field-label">
            Precio de compra ({isCrypto ? 'USD' : formData.currency})
          </label>
          <input
            id={ids.purchasePrice}
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
            className="field-input"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 px-4 py-3">
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex-1 px-4 py-3">
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  )
}
