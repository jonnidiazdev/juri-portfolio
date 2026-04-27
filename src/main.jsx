import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GoogleLoginGate from './components/GoogleLoginGate'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleLoginGate>
        {(user) => <App user={user} />}
      </GoogleLoginGate>
    </QueryClientProvider>
  </React.StrictMode>,
)