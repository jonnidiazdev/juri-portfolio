import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setIOLSession, clearIOLSession } from '../services/iolSession'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [iolUser, setIolUser] = useState('')
  const [iolPass, setIolPass] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (isOpen) {
      setIolUser('')
      setIolPass('')
      setIsSaved(false)
      setErrorMessage(null)
      setTestMessage(null)
    }
  }, [isOpen])

  const describeConnectionError = (error: unknown) => {
    const message = error instanceof Error ? error.message : ''
    if (/failed to fetch|network/i.test(message)) {
      return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
    }
    return 'No pudimos conectar con el servidor. Intentá de nuevo en unos segundos.'
  }

  const handleSave = async () => {
    if (iolUser.trim() && iolPass.trim()) {
      setErrorMessage(null)
      try {
        const response = await fetch('/api/iol/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: iolUser.trim(),
            password: iolPass.trim()
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          setIOLSession(result.sessionToken)
          queryClient.invalidateQueries({ queryKey: ['argentineQuotes'] })

          setIsSaved(true)
          setTimeout(() => {
            setIsSaved(false)
            onClose()
          }, 1500)
        } else {
          setErrorMessage(result.error || 'Usuario o contraseña incorrectos. Revisalos e intentá de nuevo.')
        }
      } catch (error) {
        setErrorMessage(describeConnectionError(error))
      }
    }
  }

  const handleClear = async () => {
    if (confirm('¿Estás seguro de eliminar la sesión guardada?')) {
      clearIOLSession('logout')
      queryClient.invalidateQueries({ queryKey: ['argentineQuotes'] })
      setIolUser('')
      setIolPass('')
    }
  }

  const handleTestConnection = async () => {
    setErrorMessage(null)
    setTestMessage(null)

    if (!iolUser.trim() || !iolPass.trim()) {
      setErrorMessage('Ingresá usuario y contraseña primero.')
      return
    }

    try {
      const response = await fetch('/api/iol/test-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: iolUser.trim(),
          password: iolPass.trim()
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setTestMessage('Conexión exitosa con IOL.')
      } else {
        setErrorMessage(result.error || 'Credenciales inválidas. Revisalas e intentá de nuevo.')
      }
    } catch (error) {
      setErrorMessage(describeConnectionError(error))
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-chalk text-2xl text-paper flex items-center gap-2">
            <svg className="w-5 h-5 text-celeste" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </h2>
          <button
            onClick={onClose}
            className="text-subtle hover:text-paper transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-celeste/10 border border-celeste/25 rounded-lg p-3">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-celeste flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-muted">
                <p className="font-semibold text-paper mb-1">Credenciales seguras</p>
                <p>
                  Tus credenciales se encriptan en un token JWT guardado localmente.
                  No se envían en texto plano después del login inicial.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="field-label">Usuario IOL</label>
            <input
              type="text"
              value={iolUser}
              onChange={(e) => setIolUser(e.target.value)}
              placeholder="tu-usuario"
              className="field-input"
            />
          </div>

          <div>
            <label className="field-label">Contraseña IOL</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={iolPass}
                onChange={(e) => setIolPass(e.target.value)}
                placeholder="••••••••"
                className="field-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-paper transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            className="btn-ghost w-full px-4 py-2 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Probar conexión
          </button>

          {errorMessage && (
            <div className="status-banner bg-loss/10 border border-loss/25 text-loss">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </div>
          )}

          {testMessage && (
            <div className="status-banner bg-profit/10 border border-profit/25 text-profit">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {testMessage}
            </div>
          )}

          {isSaved && (
            <div className="status-banner bg-profit/10 border border-profit/25 text-profit">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sesión creada. Actualizando cotizaciones…
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-border">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 border border-loss/30 text-loss hover:bg-loss/10 rounded-lg font-semibold transition-colors"
            >
              Cerrar sesión
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1 px-4 py-2"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
