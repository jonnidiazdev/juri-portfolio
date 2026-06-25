import { useState } from 'react'
import { ASSET_TYPES, PLAZO_FIJO_CONFIG, EFECTIVO_CONFIG } from '../config/constants'
import { validatePlazoFijo } from '../utils/plazoFijoCalculations'
import { validateEfectivo } from '../utils/efectivoCalculations'
import type { Asset } from '../types'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (asset: Asset) => void
}

export default function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const assetData: Record<string, any> = {
      ...formData,
      type: assetType,
      currency: assetType === ASSET_TYPES.CRYPTO ? 'USD' : currency,
      amount: parseFloat(formData.amount),
      id: Date.now() + Math.floor(Math.random() * 1000),
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

    onAdd(assetData as Asset)
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
    <div className="modal-overlay">
      <div className="modal-panel max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-semibold text-paper">Agregar activo</h2>
          <button
            onClick={onClose}
            className="text-subtle hover:text-paper transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Tipo de Activo</label>
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
              className="field-input"
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
              <label className="field-label">Moneda del Activo</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="field-input"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
              <p className="text-xs text-subtle mt-1">
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
            <label className="field-label">
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
                const formatted = assetType === ASSET_TYPES.CRYPTO
                  ? raw.toLowerCase()
                  : raw.toUpperCase()
                handleChange('symbol', formatted)
              }}
              className="field-input"
              required
              placeholder={assetType === ASSET_TYPES.CRYPTO ? 'bitcoin' : 
                          assetType === ASSET_TYPES.PLAZO_FIJO ? 'PF-001' : 
                          assetType === ASSET_TYPES.EFECTIVO ? 'EFECTIVO-001' : 'GGAL'}
            />
          </div>

          <div>
            <label className="field-label">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="field-input"
              required
              placeholder={assetType === ASSET_TYPES.PLAZO_FIJO ? 'Plazo Fijo Banco X' : 'Nombre del activo'}
            />
          </div>

          {/* Campos específicos para plazo fijo */}
          {assetType === ASSET_TYPES.PLAZO_FIJO && (
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
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="field-input"
                >
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
                <p className="text-xs text-subtle mt-1">
                  TNA típica: ARS {PLAZO_FIJO_CONFIG.TYPICAL_RATES.ARS.min}-{PLAZO_FIJO_CONFIG.TYPICAL_RATES.ARS.max}%, 
                  USD {PLAZO_FIJO_CONFIG.TYPICAL_RATES.USD.min}-{PLAZO_FIJO_CONFIG.TYPICAL_RATES.USD.max}%
                </p>
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
                  placeholder={currency === 'ARS' ? '85.00' : '5.00'}
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
            </>
          )}

          {/* Campos específicos para efectivo */}
          {assetType === ASSET_TYPES.EFECTIVO && (
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
                <p className="text-xs text-subtle mt-1">
                  Opcional para efectivo en mano, recomendado para cuentas bancarias
                </p>
              </div>

              <div>
                <label className="field-label">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
            </>
          )}

          <div>
            <label className="field-label">
              {assetType === ASSET_TYPES.PLAZO_FIJO ? `Capital Inicial (${currency})` : 
               assetType === ASSET_TYPES.EFECTIVO ? `Monto Disponible (${currency})` : 'Cantidad'}
            </label>
            <input
              type="number"
              step={assetType === ASSET_TYPES.PLAZO_FIJO || assetType === ASSET_TYPES.EFECTIVO ? "0.01" : "0.00000001"}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="field-input"
              required
              placeholder={assetType === ASSET_TYPES.PLAZO_FIJO ? "100000.00" : 
                          assetType === ASSET_TYPES.EFECTIVO ? "50000.00" : "0"}
            />
          </div>

          {assetType !== ASSET_TYPES.PLAZO_FIJO && assetType !== ASSET_TYPES.EFECTIVO && (
            <div>
              <label className="field-label">
                Precio de Compra ({assetType === ASSET_TYPES.CRYPTO ? 'USD' : currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', e.target.value)}
                className="field-input"
                required
                placeholder="0.00"
              />
            </div>
          )}

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
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
