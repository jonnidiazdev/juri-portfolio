import { getAvailableExperiments } from './labExperiments'
import LabExperimentCard from './LabExperimentCard'

export default function LaboratorioPage() {
  const experiments = getAvailableExperiments()

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-paper mb-1">
          Laboratorio
        </h2>
        <p className="text-muted text-sm">
          Experimentos visuales para explorar tu cartera desde otra perspectiva
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map(experiment => (
          <LabExperimentCard key={experiment.id} experiment={experiment} />
        ))}
      </div>
    </div>
  )
}
