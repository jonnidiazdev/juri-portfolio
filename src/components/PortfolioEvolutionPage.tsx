import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolioOutletContext } from '../hooks/usePortfolioOutletContext'
import { usePortfolioSnapshots } from '../hooks/usePortfolioSnapshots'
import { useEvolutionPageTab } from '../hooks/useEvolutionPageTab'
import { useEvolutionViewPrefs } from '../hooks/useEvolutionViewPrefs'
import { buildPortfolioSnapshot } from '../utils/portfolioSnapshot'
import PortfolioEvolutionChart from './PortfolioEvolutionChart'
import LoadingSpinner from './LoadingSpinner'
import EvolutionPageTabs from './evolution/EvolutionPageTabs'
import SnapshotChangesPanel from './evolution/SnapshotChangesPanel'
import AssetEvolutionPanel from './evolution/AssetEvolutionPanel'

export default function PortfolioEvolutionPage() {
  const {
    user,
    assets,
    isCloudSyncing,
    currencyPreference,
    multiCurrencyData,
    cryptoStats,
    argentineStats,
    plazoFijoStats,
    efectivoStats,
    cryptoPrices,
    argQuotes,
    loadingCrypto,
    loadingDolar,
    loadingArgQuotes,
    onAddAsset,
  } = usePortfolioOutletContext()

  const { snapshots, isLoading, error, saveSnapshot, isSaving } = usePortfolioSnapshots(user.uid)
  const { tab, setTab } = useEvolutionPageTab(user.uid)
  const { prefs, updatePrefs } = useEvolutionViewPrefs(user.uid)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const quotesLoading = loadingCrypto || loadingDolar || loadingArgQuotes
  const canSave = assets.length > 0 && !isCloudSyncing && !quotesLoading && !isSaving && !!multiCurrencyData.exchangeRate

  const lastSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null
  const lastSnapshotLabel = lastSnapshot
    ? new Date(lastSnapshot.capturedAt).toLocaleString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const handleSaveSnapshot = async () => {
    if (!canSave || !multiCurrencyData.exchangeRate || !multiCurrencyData.exchangeRateInfo) return

    setSaveMessage(null)
    setSaveError(null)

    try {
      const payload = buildPortfolioSnapshot({
        currencyPreference,
        exchangeRate: multiCurrencyData.exchangeRate,
        exchangeRateName: multiCurrencyData.exchangeRateInfo.name,
        totalsARS: multiCurrencyData.totalsARS,
        totalsUSD: multiCurrencyData.totalsUSD,
        cryptoStats,
        argentineStats,
        plazoFijoStats,
        efectivoStats,
        assets,
        priceContext: { cryptoPrices, argQuotes },
      })
      await saveSnapshot(payload)
      setSaveMessage('Snapshot guardado')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch {
      setSaveError('No se pudo guardar el snapshot. Intentá de nuevo.')
    }
  }

  if (isCloudSyncing || isLoading) {
    return (
      <div className="text-center py-16">
        <LoadingSpinner text={isCloudSyncing ? 'Cargando portfolio desde la nube...' : 'Cargando historial...'} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-chalk text-2xl sm:text-3xl text-paper mb-1">
            Evolución histórica
          </h2>
          <p className="text-muted text-sm">
            Snapshots de tu cartera en el tiempo
          </p>
          {lastSnapshotLabel && (
            <p className="text-subtle text-xs font-mono-data mt-2">
              Último snapshot: {lastSnapshotLabel}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveSnapshot}
          disabled={!canSave}
          className="btn-primary px-4 sm:px-6 py-3 flex items-center gap-2 justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Guardar snapshot
            </>
          )}
        </button>
      </div>

      {assets.length === 0 && (
        <div className="card p-8 text-center mb-6">
          <p className="text-muted mb-4">Agregá activos para poder registrar snapshots de tu cartera.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-ghost px-4 py-2 inline-flex items-center justify-center">
              Ir a activos
            </Link>
            <button type="button" onClick={onAddAsset} className="btn-primary px-4 py-2">
              Agregar activo
            </button>
          </div>
        </div>
      )}

      {quotesLoading && assets.length > 0 && (
        <p className="text-subtle text-sm mb-4">Esperando cotizaciones actuales para guardar un snapshot preciso…</p>
      )}

      {saveMessage && (
        <div className="status-banner mb-4 bg-profit/10 border border-profit/25 text-profit">
          {saveMessage}
        </div>
      )}

      {saveError && (
        <div className="status-banner mb-4 bg-loss/10 border border-loss/25 text-loss justify-between">
          <span>{saveError}</span>
          <button onClick={() => setSaveError(null)} aria-label="Descartar aviso" className="text-loss/70 hover:text-loss shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="status-banner mb-4 bg-loss/10 border border-loss/25 text-loss">
          No se pudieron cargar los snapshots.
        </div>
      )}

      <EvolutionPageTabs activeTab={tab} onTabChange={setTab} />

      {(tab === 'changes' || tab === 'asset') && (
        <div className="flex gap-2 mb-6">
          {(['ARS', 'USD'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updatePrefs({ currency: option })}
              className={`px-3 py-1.5 text-xs font-mono-data rounded-md border transition-colors ${
                prefs.currency === option
                  ? 'bg-celeste/15 text-celeste border-celeste/30'
                  : 'text-muted border-border hover:text-paper'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {tab === 'evolution' && <PortfolioEvolutionChart snapshots={snapshots} userId={user.uid} />}

      {tab === 'changes' && (
        <SnapshotChangesPanel snapshots={snapshots} currency={prefs.currency} />
      )}

      {tab === 'asset' && (
        <AssetEvolutionPanel snapshots={snapshots} currency={prefs.currency} />
      )}
    </div>
  )
}
