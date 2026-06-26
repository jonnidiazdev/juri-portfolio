import * as THREE from 'three'
import { SPECIES_COLORS, healthToFoliageColor } from '../../shared/labColors'
import type { PlantSpecies } from '../portfolioMetaphor'

export interface PlantMeshResult {
  group: THREE.Group
  parts: THREE.Mesh[]
}

function makePart(
  geometry: THREE.BufferGeometry,
  color: number,
  position: THREE.Vector3,
  scale: THREE.Vector3
): THREE.Mesh {
  const material = new THREE.MeshLambertMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)
  mesh.scale.copy(scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function createPlantMesh(
  species: PlantSpecies,
  scale: number,
  health: number
): PlantMeshResult {
  const group = new THREE.Group()
  const parts: THREE.Mesh[] = []
  const colors = SPECIES_COLORS[species]
  const foliageColor = healthToFoliageColor(health)
  const s = scale

  const add = (mesh: THREE.Mesh) => {
    parts.push(mesh)
    group.add(mesh)
  }

  switch (species) {
    case 'exotic': {
      add(makePart(
        new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.6 * s, 6),
        colors.trunk,
        new THREE.Vector3(0, 0.3 * s, 0),
        new THREE.Vector3(1, 1, 1)
      ))
      add(makePart(
        new THREE.ConeGeometry(0.35 * s, 0.9 * s, 5),
        foliageColor,
        new THREE.Vector3(0, 0.95 * s, 0),
        new THREE.Vector3(1, 1, 1)
      ))
      add(makePart(
        new THREE.SphereGeometry(0.12 * s, 6, 6),
        0xe74c3c,
        new THREE.Vector3(0.2 * s, 1.2 * s, 0.1 * s),
        new THREE.Vector3(1, 1, 1)
      ))
      break
    }
    case 'native': {
      add(makePart(
        new THREE.CylinderGeometry(0.1 * s, 0.14 * s, 0.8 * s, 8),
        colors.trunk,
        new THREE.Vector3(0, 0.4 * s, 0),
        new THREE.Vector3(1, 1, 1)
      ))
      add(makePart(
        new THREE.SphereGeometry(0.45 * s, 8, 8),
        foliageColor,
        new THREE.Vector3(0, 1.0 * s, 0),
        new THREE.Vector3(1, 1.1, 1)
      ))
      break
    }
    case 'slow': {
      add(makePart(
        new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 0.35 * s, 6),
        colors.trunk,
        new THREE.Vector3(0, 0.18 * s, 0),
        new THREE.Vector3(1, 1, 1)
      ))
      add(makePart(
        new THREE.ConeGeometry(0.5 * s, 0.5 * s, 8),
        foliageColor,
        new THREE.Vector3(0, 0.5 * s, 0),
        new THREE.Vector3(1, 0.7, 1)
      ))
      break
    }
    case 'ground': {
      add(makePart(
        new THREE.BoxGeometry(0.7 * s, 0.08 * s, 0.7 * s),
        colors.foliage,
        new THREE.Vector3(0, 0.04 * s, 0),
        new THREE.Vector3(1, 1, 1)
      ))
      for (let i = 0; i < 3; i++) {
        add(makePart(
          new THREE.SphereGeometry(0.1 * s, 6, 6),
          foliageColor,
          new THREE.Vector3(
            (i - 1) * 0.2 * s,
            0.12 * s,
            (i % 2 === 0 ? 0.15 : -0.1) * s
          ),
          new THREE.Vector3(1, 0.8, 1)
        ))
      }
      break
    }
  }

  return { group, parts }
}

export function disposePlantMesh(result: PlantMeshResult): void {
  for (const mesh of result.parts) {
    mesh.geometry.dispose()
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose())
    } else {
      mesh.material.dispose()
    }
  }
}
