import { useState, useEffect } from 'react'
import { ASSET_TYPES, PLAZO_FIJO_CONFIG, EFECTIVO_CONFIG } from '../config/constants'
import { validatePlazoFijo } from '../utils/plazoFijoCalculations'
import { validateEfectivo } from '../utils/efectivoCalculations'

export default function EditAssetModal({ isOpen, onClose, onSave, asset }) {
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [formData, setFormData] = useState({
    amount: '',
    purchasePrice: '',
    currency: 'ARS',
    tna: '',
    startDate: '',
    endDate: '',
    bank: '',
    tipoEfectivo: 'efectivo',
    banco: '',
    descripcion: '',
  })

  useEffect(() => {
    if (asset) {
      setFormErrors([])
      setFormData({
        amount: asset.amount ?? '',
        purchasePrice: asset.purchasePrice ?? '',
        currency: asset.currency || 'ARS',
        tna: asset.tna ?? '',
        startDate: asset.startDate || '',
        endDate: asset.endDate || '',
        bank: asset.bank || '',
        tipoEfectivo: asset.tipoEfectivo || 'efectivo',
        banco: asset.banco || '',
        descripcion: asset.descripcion || '',
      })
    }
  }, [asset])

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleClose = () => {
    setFormErrors([])
    onClose()
  }

  if (!isOpen || !asset) return null

  const isCrypto = asset.type === ASSET_TYPES.CRYPTO
  const isPlazoFijo = asset.type === ASSET_TYPES.PLAZO_FIJO
  const isEfectivo = asset.type === ASSET_TYPES.EFECTIVO

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormErrors([])

    const updatedAsset = {
      ...asset,
      amount: parseFloat(formData.amount),
      currency: isCrypto ? 'USD' : formData.currency,
    }

    if (isPlazoFijo) {
      updatedAsset.tna = parseFloat(formData.tna)
      updatedAsset.startDate = formData.startDate
      updatedAsset.endDate = formData.endDate
      updatedAsset.bank = formData.bank

      const validation = validatePlazoFijo(updatedAsset)
      if (!validation.isValid) {
        setFormErrors(validation.errors)
        return
      }
    } else if (isEfectivo) {
      updatedAsset.tipoEfectivo = formData.tipoEfectivo
      updatedAsset.banco = formData.banco
      updatedAsset.descripcion = formData.descripcion

      const validation = validateEfectivo(updatedAsset)
      if (!validation.isValid) {
        setFormErrors(validation.errors)
        return
      }
    } else {
      updatedAsset.purchasePrice = parseFloat(formData.purchasePrice)
    }

    onSave(updatedAsset)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-semibold text-paper">Editar activo</h2>
          <button
            onClick={handleClose}
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

        {formErrors.length > 0 && (
          <div className="status-banner bg-loss/10 border border-loss/25 text-loss mb-4 items-start">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <ul className="space-y-0.5">
              {formErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isPlazoFijo && (
            <>
              <div>
                <label className="field-label">Banco/Institución</label>
                <select
                  value={formData.bank}
                  onChange={(e) => handleChange('bank', e.target.value)}
                  className="field-input"
                  required
                >
                  <option value="">Seleccionar banco...</option>
                  {PLAZO_FIJO_CONFIG.POPULAR_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Moneda del Plazo Fijo</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="field-input"
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div>
                <label className="field-label">TNA (Tasa Nominal Anual %)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tna}
                  onChange={(e) => handleChange('tna', e.target.value)}
                  className="field-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="field-input"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="field-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Capital Inicial ({formData.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="field-input"
                  required
                />
              </div>
            </>
          )}

          {isEfectivo && (
            <>
              <div>
                <label className="field-label">Tipo de Tenencia</label>
                <select
                  value={formData.tipoEfectivo}
                  onChange={(e) => handleChange('tipoEfectivo', e.target.value)}
                  className="field-input"
                  required
                >
                  {Object.entries(EFECTIVO_CONFIG.TIPOS_DESCRIPCIONES).map(([key, description]) => (
                    <option key={key} value={key}>{description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Banco/Entidad</label>
                <select
                  value={formData.banco}
                  onChange={(e) => handleChange('banco', e.target.value)}
                  className="field-input"
                >
                  <option value="">Seleccionar banco...</option>
                  {EFECTIVO_CONFIG.BANCOS.map(banco => (
                    <option key={banco} value={banco}>{banco}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Moneda</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="field-input"
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div>
                <label className="field-label">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  className="field-input"
                  placeholder="Ej: Efectivo para gastos, Cuenta para emergencias"
                />
              </div>

              <div>
                <label className="field-label">Monto Disponible ({formData.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="field-input"
                  required
                />
              </div>
            </>
          )}

          {!isPlazoFijo && !isEfectivo && (
            <>
              {!isCrypto && (
                <div>
                  <label className="field-label">Moneda del activo</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
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
                  onChange={(e) => handleChange('amount', e.target.value)}
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
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  className="field-input"
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
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
