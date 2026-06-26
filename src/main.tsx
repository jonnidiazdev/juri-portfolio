import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import GoogleLoginGate from './components/GoogleLoginGate'
import { queryClient } from './config/queryClient'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleLoginGate>
          {(user) => <App user={user} />}
        </GoogleLoginGate>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
