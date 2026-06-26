export type LabExperimentStatus = 'available' | 'coming-soon'
export type LabExperimentIcon = 'huerto'

export interface LabExperiment {
  id: string
  title: string
  description: string
  route: string
  status: LabExperimentStatus
  icon: LabExperimentIcon
}

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'huerto',
    title: 'Huerto de inversiones',
    description:
      'Visualizá tu cartera como un jardín 3D: cada activo es una planta cuyo tamaño, salud y movimiento reflejan valor, rendimiento y volatilidad.',
    route: '/laboratorio/huerto',
    status: 'available',
    icon: 'huerto',
  },
]

export function getAvailableExperiments(): LabExperiment[] {
  return LAB_EXPERIMENTS.filter(e => e.status === 'available')
}
