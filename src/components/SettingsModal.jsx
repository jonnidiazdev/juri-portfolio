import { useState, useEffect } from 'react'

export default function SettingsModal({ isOpen, onClose }) {
  const [iolUser, setIolUser] = useState('')
  const [iolPass, setIolPass] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // No cargar credenciales (ya no se guardan)
      // Solo limpiar el formulario
      setIolUser('')
      setIolPass('')
      setIsSaved(false)
      
      // Verificar si hay sesión activa
      const sessionToken = localStorage.getItem('iol-session-token')
      if (sessionToken) {
        // Opcional: verificar si la sesión sigue válida
        fetch('http://localhost:4000/api/iol/session', {
          headers: { 'x-session-token': sessionToken }
        })
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            localStorage.removeItem('iol-session-token')
          }
        })
        .catch(console.error)
      }
    }
  }, [isOpen])

  const handleSave = async () => {
    if (iolUser.trim() && iolPass.trim()) {
      try {
        // Login en el backend para crear sesión
        const response = await fetch('http://localhost:4000/api/iol/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: iolUser.trim(),
            password: iolPass.trim()
          })
        })

        const result = await response.json()
        
        if (response.ok && result.success) {
          // Guardar solo el session token (no las credenciales)
          localStorage.setItem('iol-session-token', result.sessionToken)
          localStorage.removeItem('iol-user') // Limpiar credenciales viejas si existen
          localStorage.removeItem('iol-pass')
          
          setIsSaved(true)
          setTimeout(() => {
            setIsSaved(false)
            onClose()
          }, 1500)
        } else {
          alert(`❌ Error: ${result.error || 'No se pudo crear la sesión'}`)
        }
      } catch (error) {
        alert(`❌ Error de conexión: ${error.message}`)
      }
    }
  }

  const handleClear = async () => {
    if (confirm('¿Estás seguro de eliminar las credenciales guardadas?')) {
      // Logout del backend
      const sessionToken = localStorage.getItem('iol-session-token')
      if (sessionToken) {
        try {
          await fetch('http://localhost:4000/api/iol/logout', {
            method: 'POST',
            headers: { 'x-session-token': sessionToken }
          })
        } catch (error) {
          console.error('Error al cerrar sesión:', error)
        }
      }
      
      localStorage.removeItem('iol-session-token')
      localStorage.removeItem('iol-user') // Por si quedan credenciales viejas
      localStorage.removeItem('iol-pass')
      setIolUser('')
      setIolPass('')
    }
  }

  const handleTestConnection = async () => {
    if (!iolUser.trim() || !iolPass.trim()) {
      alert('Por favor ingresa usuario y contraseña primero')
      return
    }

    try {
      const response = await fetch('http://localhost:4000/api/iol/test-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: iolUser.trim(),
          password: iolPass.trim()
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert('✅ Conexión exitosa con IOL')
      } else {
        alert(`❌ Error: ${result.error || 'Credenciales inválidas'}`)
      }
    } catch (error) {
      alert(`❌ Error de conexión: ${error.message}`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Credenciales de InvertirOnline</p>
                <p className="text-blue-200">
                  Tus credenciales se guardan <strong>localmente en tu navegador</strong> y nunca se envían a ningún servidor externo excepto al API de IOL para autenticación.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Usuario IOL
            </label>
            <input
              type="text"
              value={iolUser}
              onChange={(e) => setIolUser(e.target.value)}
              placeholder="tu-usuario"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Contraseña IOL
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={iolPass}
                onChange={(e) => setIolPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Probar Conexión
            </button>
          </div>

          {isSaved && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Credenciales guardadas exitosamente
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-semibold transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
