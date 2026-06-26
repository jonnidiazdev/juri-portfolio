import * as THREE from 'three'

let sharedGradient: THREE.DataTexture | null = null

function getToonGradient(): THREE.DataTexture {
  if (sharedGradient) return sharedGradient
  const colors = new Uint8Array([0, 128, 255])
  const gradient = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat)
  gradient.minFilter = THREE.NearestFilter
  gradient.magFilter = THREE.NearestFilter
  gradient.needsUpdate = true
  sharedGradient = gradient
  return gradient
}

export function createToonMaterial(color: number, emissive = 0x000000, emissiveIntensity = 0): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    emissive,
    emissiveIntensity,
    gradientMap: getToonGradient(),
  })
}
