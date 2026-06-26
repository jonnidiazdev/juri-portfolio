import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import type { LabExperiment } from './labExperiments'

function HuertoIcon() {
  return (
    <svg className="w-8 h-8 text-profit" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
      <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
    </svg>
  )
}

const ICONS: Record<LabExperiment['icon'], () => JSX.Element> = {
  huerto: HuertoIcon,
}

interface LabExperimentCardProps {
  experiment: LabExperiment
}

export default function LabExperimentCard({ experiment }: LabExperimentCardProps) {
  const Icon = ICONS[experiment.icon]
  const isAvailable = experiment.status === 'available'

  const content = (
    <div className={`card p-5 h-full flex flex-col gap-3 transition-colors ${isAvailable ? 'hover:border-celeste/40' : 'opacity-60'}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-surface-raised border border-border">
          <Icon />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-paper">{experiment.title}</h3>
          {!isAvailable && (
            <span className="text-xs font-mono-data uppercase tracking-wider text-subtle">Próximamente</span>
          )}
        </div>
      </div>
      <p className="text-muted text-sm flex-1">{experiment.description}</p>
      {isAvailable && (
        <span className="text-celeste text-sm font-medium inline-flex items-center gap-1">
          Explorar
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  )

  if (!isAvailable) {
    return <div aria-disabled="true">{content}</div>
  }

  return (
    <Link to={experiment.route} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste rounded-lg">
      {content}
    </Link>
  )
}
