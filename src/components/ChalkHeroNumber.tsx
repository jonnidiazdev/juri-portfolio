import type { CSSProperties } from 'react'

interface ChalkHeroNumberProps {
  label: string
  value: string
  secondaryValue?: string
}

export default function ChalkHeroNumber({ label, value, secondaryValue }: ChalkHeroNumberProps) {
  return (
    <div>
      <p className="text-subtle text-xs sm:text-sm font-mono-data uppercase tracking-[0.2em] mb-2">
        {label}
      </p>
      <div key={value} className="chalk-dust-in inline-block">
        <p className="font-chalk text-paper text-4xl sm:text-6xl leading-none tracking-tight">
          {value}
        </p>
        <svg
          viewBox="0 0 320 20"
          className="w-full max-w-[22rem] h-4 mt-1"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M4,11 Q40,3 80,10 T160,9 T240,11 T316,8"
            fill="none"
            stroke="var(--color-celeste)"
            strokeWidth="3"
            strokeLinecap="round"
            className="chalk-figure"
            style={{ '--chalk-dash-length': 340 } as CSSProperties}
          />
        </svg>
      </div>
      {secondaryValue && (
        <p className="text-muted font-mono-data text-sm sm:text-base mt-1">{secondaryValue}</p>
      )}
    </div>
  )
}
