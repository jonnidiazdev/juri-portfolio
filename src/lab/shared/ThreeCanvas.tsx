import { useEffect, useRef } from 'react'
import { createInvestmentGardenScene } from '../huerto/InvestmentGardenScene'
import type { PlantState, SkyMood } from '../huerto/portfolioMetaphor'

interface ThreeCanvasProps {
  plants: PlantState[]
  skyMood: SkyMood
  highlightedAssetId?: number | null
  onHover?: (assetId: number | null) => void
  onClick?: (assetId: number | null) => void
  className?: string
}

export default function ThreeCanvas({
  plants,
  skyMood,
  highlightedAssetId = null,
  onHover,
  onClick,
  className = '',
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneHandleRef = useRef<ReturnType<typeof createInvestmentGardenScene> | null>(null)
  const onHoverRef = useRef(onHover)
  const onClickRef = useRef(onClick)

  onHoverRef.current = onHover
  onClickRef.current = onClick

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    sceneHandleRef.current = createInvestmentGardenScene(container, {
      plants,
      skyMood,
      reducedMotion,
      onHover: id => onHoverRef.current?.(id),
      onClick: id => onClickRef.current?.(id),
    })

    return () => {
      sceneHandleRef.current?.dispose()
      sceneHandleRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  useEffect(() => {
    sceneHandleRef.current?.updateGarden(plants, skyMood)
  }, [plants, skyMood])

  useEffect(() => {
    sceneHandleRef.current?.setHighlighted(highlightedAssetId ?? null)
  }, [highlightedAssetId])

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-[360px] sm:min-h-[480px] rounded-lg overflow-hidden bg-surface ${className}`}
      role="img"
      aria-label="Visualización 3D del huerto de inversiones"
    />
  )
}
