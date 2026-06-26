import * as THREE from 'three'
import { SPECIES_COLORS, healthToFoliageColor } from '../../shared/labColors'
import type { PlantSpecies } from '../portfolioMetaphor'
import { createToonMaterial } from './toonMaterial'

export interface PlantMeshResult {
  group: THREE.Group
  parts: THREE.Mesh[]
}

function addPart(
  group: THREE.Group,
  parts: THREE.Mesh[],
  geometry: THREE.BufferGeometry,
  material: THREE.MeshToonMaterial,
  position: THREE.Vector3,
  rotation?: THREE.Euler,
  scale?: THREE.Vector3
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)
  if (rotation) mesh.rotation.copy(rotation)
  if (scale) mesh.scale.copy(scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parts.push(mesh)
  group.add(mesh)
  return mesh
}

function createExoticPlant(group: THREE.Group, parts: THREE.Mesh[], s: number, health: number): void {
  const colors = SPECIES_COLORS.exotic
  const foliage = healthToFoliageColor(health)
  const emissive = health > 0.65 ? 0x6badc9 : 0x000000

  addPart(
    group, parts,
    new THREE.CylinderGeometry(0.06 * s, 0.1 * s, 0.35 * s, 5),
    createToonMaterial(colors.trunk),
    new THREE.Vector3(0, 0.18 * s, 0)
  )

  const stem = addPart(
    group, parts,
    new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 0.5 * s, 5),
    createToonMaterial(0x7cb342),
    new THREE.Vector3(0, 0.55 * s, 0)
  )
  stem.rotation.z = 0.15

  const petalCount = 5
  const petalDrop = health < 0.35
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2
    const dropAngle = petalDrop ? 0.8 : 0
    addPart(
      group, parts,
      new THREE.SphereGeometry(0.14 * s, 5, 5),
      createToonMaterial(foliage, emissive, health > 0.65 ? 0.25 : 0),
      new THREE.Vector3(Math.cos(angle) * 0.22 * s, 0.85 * s, Math.sin(angle) * 0.22 * s),
      new THREE.Euler(dropAngle, angle, 0)
    )
  }

  addPart(
    group, parts,
    new THREE.SphereGeometry(0.12 * s, 5, 5),
    createToonMaterial(0xffd54f, 0xffb300, 0.3),
    new THREE.Vector3(0, 0.88 * s, 0)
  )

  for (let i = 0; i < 2; i++) {
    addPart(
      group, parts,
      new THREE.SphereGeometry(0.06 * s, 4, 4),
      createToonMaterial(0x6badc9, 0x6badc9, 0.4),
      new THREE.Vector3((i - 0.5) * 0.25 * s, 0.35 * s, 0.12 * s)
    )
  }
}

function createNativePlant(group: THREE.Group, parts: THREE.Mesh[], s: number, health: number): void {
  const colors = SPECIES_COLORS.native
  const foliage = healthToFoliageColor(health)

  addPart(
    group, parts,
    new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.3 * s, 6),
    createToonMaterial(colors.trunk),
    new THREE.Vector3(0, 0.15 * s, 0)
  )

  const layers = [
    { y: 0.45 * s, r: 0.38 * s },
    { y: 0.72 * s, r: 0.28 * s },
    { y: 0.92 * s, r: 0.16 * s },
  ]
  for (const layer of layers) {
    addPart(
      group, parts,
      new THREE.SphereGeometry(layer.r, 6, 6),
      createToonMaterial(foliage),
      new THREE.Vector3(0, layer.y, 0),
      undefined,
      new THREE.Vector3(1, 0.85, 1)
    )
  }
}

function createSlowPlant(group: THREE.Group, parts: THREE.Mesh[], s: number, health: number): void {
  const colors = SPECIES_COLORS.slow
  const foliage = healthToFoliageColor(health)

  addPart(
    group, parts,
    new THREE.CylinderGeometry(0.14 * s, 0.18 * s, 0.2 * s, 6),
    createToonMaterial(colors.trunk),
    new THREE.Vector3(0, 0.1 * s, 0)
  )

  for (let i = 0; i < 3; i++) {
    addPart(
      group, parts,
      new THREE.TorusGeometry(0.12 * s, 0.025 * s, 4, 8),
      createToonMaterial(i % 2 === 0 ? 0x8d6e63 : colors.trunk),
      new THREE.Vector3(0, 0.15 * s + i * 0.06 * s, 0),
      new THREE.Euler(Math.PI / 2, 0, i * 0.5)
    )
  }

  addPart(
    group, parts,
    new THREE.CylinderGeometry(0.35 * s, 0.4 * s, 0.12 * s, 8),
    createToonMaterial(foliage),
    new THREE.Vector3(0, 0.42 * s, 0)
  )
}

function createGroundPlant(group: THREE.Group, parts: THREE.Mesh[], s: number, health: number): void {
  const colors = SPECIES_COLORS.ground
  const foliage = healthToFoliageColor(health)

  addPart(
    group, parts,
    new THREE.BoxGeometry(0.75 * s, 0.06 * s, 0.55 * s),
    createToonMaterial(0x5d4037),
    new THREE.Vector3(0, 0.03 * s, 0)
  )

  for (let i = 0; i < 4; i++) {
    addPart(
      group, parts,
      new THREE.ConeGeometry(0.08 * s, 0.18 * s, 4),
      createToonMaterial(foliage),
      new THREE.Vector3((i - 1.5) * 0.18 * s, 0.12 * s, 0),
      new THREE.Euler(0, i * 0.4, 0)
    )
  }

  addPart(
    group, parts,
    new THREE.SphereGeometry(0.05 * s, 4, 4),
    createToonMaterial(colors.foliage),
    new THREE.Vector3(0, 0.08 * s, 0.15 * s)
  )

  void health
}

export function createCartoonPlant(
  species: PlantSpecies,
  scale: number,
  health: number
): PlantMeshResult {
  const group = new THREE.Group()
  const parts: THREE.Mesh[] = []
  const s = scale

  switch (species) {
    case 'exotic':
      createExoticPlant(group, parts, s, health)
      break
    case 'native':
      createNativePlant(group, parts, s, health)
      break
    case 'slow':
      createSlowPlant(group, parts, s, health)
      break
    case 'ground':
      createGroundPlant(group, parts, s, health)
      break
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
