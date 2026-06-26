import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  it('renders with role alert', () => {
    render(<ErrorMessage message="Algo salió mal" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  it('shows retry button when onRetry is provided', () => {
    render(<ErrorMessage message="Error de red" onRetry={() => {}} />)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})
