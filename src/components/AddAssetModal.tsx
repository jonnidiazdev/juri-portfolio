import { useId, useState, type FormEvent } from 'react'
import { ASSET_TYPES, PLAZO_FIJO_CONFIG, EFECTIVO_CONFIG } from '../config/constants'
import { validatePlazoFijo } from '../utils/plazoFijoCalculations'
import { validateEfectivo } from '../utils/efectivoCalculations'
import type { Asset } from '../types'
import Modal from './Modal'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (asset: Asset) => void
}

export default function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
  const fieldId = useId()
  const [assetType, setAssetType] = useState(ASSET_TYPES.CRYPTO)
  const [currency, setCurrency] = useState('USD')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
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

  const ids = {
    assetType: `${fieldId}-asset-type`,
    currency: `${fieldId}-currency`,
    symbol: `${fieldId}-symbol`,
    name: `${fieldId}-name`,
    bank: `${fieldId}-bank`,
    pfCurrency: `${fieldId}-pf-currency`,
    tna: `${fieldId}-tna`,
    startDate: `${fieldId}-start-date`,
    endDate: `${fieldId}-end-date`,
    tipoEfectivo: `${fieldId}-tipo-efectivo`,
    banco: `${fieldId}-banco`,
    efCurrency: `${fieldId}-ef-currency`,
    descripcion: `${fieldId}-descripcion`,
    amount: `${fieldId}-amount`,
    purchasePrice: `${fieldId}-purchase-price`,
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const assetData: Record<string, unknown> = {
      ...formData,
      type: assetType,
      currency: assetType === ASSET_TYPES.CRYPTO ? 'USD' : currency,
      amount: parseFloat(formData.amount),
      id: Date.now() + Math.floor(Math.random() * 1000),
    }

    if (assetType !== ASSET_TYPES.EFECTIVO) {
      assetData.purchasePrice = parseFloat(formData.purchasePrice)
    }

    if (assetType === ASSET_TYPES.PLAZO_FIJO) {
      assetData.tna = parseFloat(formData.tna)
      assetData.startDate = formData.startDate
      assetData.endDate = formData.endDate
      assetData.bank = formData.bank

      const validation = validatePlazoFijo(assetData)
      if (!validation.isValid) {
        setValidationError(validation.errors.join('. '))
        return
      }
    }

    if (assetType === ASSET_TYPES.EFECTIVO) {
      assetData.tipoEfectivo = formData.tipoEfectivo
      assetData.banco = formData.banco
      assetData.descripcion = formData.descripcion

      const validation = validateEfectivo(assetData)
      if (!validation.isValid) {
        setValidationError(validation.errors.join('. '))
        return
      }
    }

    onAdd(assetData as unknown as Asset)
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
    setValidationError(null)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setValidationError(null)
    setFormData({ ...formData, [field]: value })
  }

  const handleClose = () => {
    setValidationError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar activo" panelClassName="max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div role="alert" className="status-banner bg-loss/10 border border-loss/25 text-loss text-sm">
            {validationError}
          </div>
        )}

        <div>
          <label htmlFor={ids.assetType} className="field-label">Tipo de activo</label>
          <select
            id={ids.assetType}
            value={assetType}
            onChange={(e) => {
              setAssetType(e.target.value)
              if (e.target.value === ASSET_TYPES.CRYPTO) {
                setCurrency('USD')
              } else if (e.target.value === ASSET_TYPES.STOCK || e.target.value === ASSET_TYPES.LETRA) {
                setCurrency('ARS')
              } else if (e.target.value === ASSET_TYPES.EFECTIVO) {
                setCurrency('ARS')
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
            <label htmlFor={ids.currency} className="field-label">Moneda del activo</label>
            <select
              id={ids.currency}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="field-input"
            >
              <option value="ARS">Pesos Argentinos (ARS)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
            <p className="text-xs text-subtle mt-1">
              {assetType === ASSET_TYPES.BOND
                ? 'Bonos pueden estar en ARS (ej: TX28) o USD (ej: GD30)'
                : assetType === ASSET_TYPES.CEDEAR
                  ? 'CEDEARs cotizan en ARS pero representan acciones en USD'
                  : assetType === ASSET_TYPES.EFECTIVO
                    ? 'Seleccioná la moneda del efectivo o cuenta bancaria'
                    : 'Seleccioná la moneda en que cotiza el activo'}
            </p>
          </div>
        )}

        <div>
          <label htmlFor={ids.symbol} className="field-label">
            {assetType === ASSET_TYPES.CRYPTO ? 'ID (ej: bitcoin)'
              : assetType === ASSET_TYPES.PLAZO_FIJO ? 'Identificador (ej: PF-001)'
                : assetType === ASSET_TYPES.EFECTIVO ? 'Identificador (ej: EFECTIVO-001)'
                  : 'Ticker/Símbolo (ej: GGAL, AL30)'}
          </label>
          <input
            id={ids.symbol}
            type="text"
            value={formData.symbol}
            onChange={(e) => {
              const raw = e.target.value
              const formatted = assetType === ASSET_TYPES.CRYPTO ? raw.toLowerCase() : raw.toUpperCase()
              handleChange('symbol', formatted)
            }}
            className="field-input"
            required
            placeholder={
              assetType === ASSET_TYPES.CRYPTO ? 'bitcoin'
                : assetType === ASSET_TYPES.PLAZO_FIJO ? 'PF-001'
                  : assetType === ASSET_TYPES.EFECTIVO ? 'EFECTIVO-001' : 'GGAL'
            }
          />
        </div>

        <div>
          <label htmlFor={ids.name} className="field-label">Nombre</label>
          <input
            id={ids.name}
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="field-input"
            required
            placeholder={assetType === ASSET_TYPES.PLAZO_FIJO ? 'Plazo Fijo Banco X' : 'Nombre del activo'}
          />
        </div>

        {assetType === ASSET_TYPES.PLAZO_FIJO && (
          <>
            <div>
              <label htmlFor={ids.bank} className="field-label">Banco/Institución</label>
              <select
                id={ids.bank}
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
              <label htmlFor={ids.pfCurrency} className="field-label">Moneda del plazo fijo</label>
              <select
                id={ids.pfCurrency}
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
              <label htmlFor={ids.tna} className="field-label">TNA (Tasa Nominal Anual %)</label>
              <input
                id={ids.tna}
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
                <label htmlFor={ids.startDate} className="field-label">Fecha de inicio</label>
                <input
                  id={ids.startDate}
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="field-input"
                  required
                />
              </div>
              <div>
                <label htmlFor={ids.endDate} className="field-label">Fecha de vencimiento</label>
                <input
                  id={ids.endDate}
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

        {assetType === ASSET_TYPES.EFECTIVO && (
          <>
            <div>
              <label htmlFor={ids.tipoEfectivo} className="field-label">Tipo de tenencia</label>
              <select
                id={ids.tipoEfectivo}
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
              <label htmlFor={ids.banco} className="field-label">Banco/Entidad</label>
              <select
                id={ids.banco}
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
              <label htmlFor={ids.efCurrency} className="field-label">Moneda</label>
              <select
                id={ids.efCurrency}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="field-input"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>

            <div>
              <label htmlFor={ids.descripcion} className="field-label">Descripción (opcional)</label>
              <input
                id={ids.descripcion}
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
          <label htmlFor={ids.amount} className="field-label">
            {assetType === ASSET_TYPES.PLAZO_FIJO ? `Capital inicial (${currency})`
              : assetType === ASSET_TYPES.EFECTIVO ? `Monto disponible (${currency})` : 'Cantidad'}
          </label>
          <input
            id={ids.amount}
            type="number"
            step={assetType === ASSET_TYPES.PLAZO_FIJO || assetType === ASSET_TYPES.EFECTIVO ? '0.01' : '0.00000001'}
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="field-input"
            required
            placeholder={
              assetType === ASSET_TYPES.PLAZO_FIJO ? '100000.00'
                : assetType === ASSET_TYPES.EFECTIVO ? '50000.00' : '0'
            }
          />
        </div>

        {assetType !== ASSET_TYPES.PLAZO_FIJO && assetType !== ASSET_TYPES.EFECTIVO && (
          <div>
            <label htmlFor={ids.purchasePrice} className="field-label">
              Precio de compra ({assetType === ASSET_TYPES.CRYPTO ? 'USD' : currency})
            </label>
            <input
              id={ids.purchasePrice}
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
          <button type="button" onClick={handleClose} className="btn-ghost flex-1 px-4 py-3">
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex-1 px-4 py-3">
            Agregar
          </button>
        </div>
      </form>
    </Modal>
  )
}
