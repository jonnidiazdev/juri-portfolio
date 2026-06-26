import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GARDEN_BEDS, PLOT_DEPTH, PLOT_WIDTH } from './gardenLayout'
import { SKY_MOOD_CONFIG } from '../shared/labColors'
import { createCartoonPlant, disposePlantMesh, type PlantMeshResult } from './plants/createCartoonPlant'
import { createToonMaterial } from './plants/toonMaterial'
import type { PlantState, SkyMood } from './portfolioMetaphor'

export interface GardenSceneOptions {
  plants: PlantState[]
  skyMood: SkyMood
  onHover?: (assetId: number | null) => void
  onClick?: (assetId: number | null) => void
  reducedMotion?: boolean
}

interface PlantEntry {
  assetId: number
  group: THREE.Object3D
  meshResult: PlantMeshResult
  wind: number
  baseRotation: number
  bedIndex: number
}

interface SceneHandle {
  dispose: () => void
  setHighlighted: (assetId: number | null) => void
  updateGarden: (plants: PlantState[], skyMood: SkyMood) => void
}

function applySkyMood(scene: THREE.Scene, skyMood: SkyMood, dirLight: THREE.DirectionalLight): void {
  const config = SKY_MOOD_CONFIG[skyMood]
  scene.background = new THREE.Color(config.sky)
  scene.fog = new THREE.Fog(config.fog, config.fogNear, config.fogFar)
  dirLight.intensity = config.sunIntensity
}

function createLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(14, 18, 23, 0.75)'
  ctx.roundRect(8, 8, 240, 48, 8)
  ctx.fill()
  ctx.fillStyle = '#f5f0e8'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 32)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(2.2, 0.55, 1)
  return sprite
}

function buildGardenStructure(scene: THREE.Group, disposables: Array<THREE.BufferGeometry | THREE.Material>): void {
  const soilMat = createToonMaterial(0x4a7c4e)
  const pathMat = createToonMaterial(0xc4a574)
  const woodMat = createToonMaterial(0x6d4c33)
  disposables.push(soilMat, pathMat, woodMat)

  const groundGeo = new THREE.PlaneGeometry(PLOT_WIDTH, PLOT_DEPTH)
  disposables.push(groundGeo)
  const ground = new THREE.Mesh(groundGeo, soilMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const pathGeo = new THREE.PlaneGeometry(0.8, PLOT_DEPTH - 0.4)
  disposables.push(pathGeo)
  const pathV = new THREE.Mesh(pathGeo, pathMat)
  pathV.rotation.x = -Math.PI / 2
  pathV.position.y = 0.01
  scene.add(pathV)

  const pathHGeo = new THREE.PlaneGeometry(PLOT_WIDTH - 0.4, 0.8)
  disposables.push(pathHGeo)
  const pathH = new THREE.Mesh(pathHGeo, pathMat)
  pathH.rotation.x = -Math.PI / 2
  pathH.position.y = 0.01
  scene.add(pathH)

  for (const bed of GARDEN_BEDS) {
    const bedGeo = new THREE.PlaneGeometry(bed.size, bed.size)
    disposables.push(bedGeo)
    const bedMesh = new THREE.Mesh(bedGeo, createToonMaterial(0x3d6b3d))
    disposables.push(bedMesh.material as THREE.Material)
    bedMesh.rotation.x = -Math.PI / 2
    bedMesh.position.set(bed.centerX, 0.02, bed.centerZ)
    bedMesh.receiveShadow = true
    scene.add(bedMesh)

    const borderThickness = 0.08
    const borderHeight = 0.12
    const half = bed.size / 2
    const borders = [
      { w: bed.size + borderThickness, d: borderThickness, x: bed.centerX, z: bed.centerZ - half },
      { w: bed.size + borderThickness, d: borderThickness, x: bed.centerX, z: bed.centerZ + half },
      { w: borderThickness, d: bed.size, x: bed.centerX - half, z: bed.centerZ },
      { w: borderThickness, d: bed.size, x: bed.centerX + half, z: bed.centerZ },
    ]
    for (const b of borders) {
      const geo = new THREE.BoxGeometry(b.w, borderHeight, b.d)
      disposables.push(geo)
      const mesh = new THREE.Mesh(geo, woodMat)
      mesh.position.set(b.x, borderHeight / 2, b.z)
      mesh.castShadow = true
      scene.add(mesh)
    }

    const label = createLabelSprite(bed.label)
    label.position.set(bed.centerX, 1.8, bed.centerZ - bed.size / 2 - 0.35)
    scene.add(label)
  }

  const fenceMat = createToonMaterial(0x8d6e63)
  disposables.push(fenceMat)
  const postGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.5, 5)
  const railGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06)
  disposables.push(postGeo, railGeo)

  const corners = [
    [-PLOT_WIDTH / 2, -PLOT_DEPTH / 2],
    [PLOT_WIDTH / 2, -PLOT_DEPTH / 2],
    [-PLOT_WIDTH / 2, PLOT_DEPTH / 2],
    [PLOT_WIDTH / 2, PLOT_DEPTH / 2],
  ]
  for (const [x, z] of corners) {
    const post = new THREE.Mesh(postGeo, fenceMat)
    post.position.set(x, 0.25, z)
    post.castShadow = true
    scene.add(post)
  }

  const rails = [
    { w: PLOT_WIDTH, x: 0, z: -PLOT_DEPTH / 2, rotY: 0 },
    { w: PLOT_WIDTH, x: 0, z: PLOT_DEPTH / 2, rotY: 0 },
    { w: PLOT_DEPTH, x: -PLOT_WIDTH / 2, z: 0, rotY: Math.PI / 2 },
    { w: PLOT_DEPTH, x: PLOT_WIDTH / 2, z: 0, rotY: Math.PI / 2 },
  ]
  for (const rail of rails) {
    const geo = new THREE.BoxGeometry(rail.w, 0.05, 0.05)
    disposables.push(geo)
    const mesh = new THREE.Mesh(geo, fenceMat)
    mesh.position.set(rail.x, 0.35, rail.z)
    mesh.rotation.y = rail.rotY
    scene.add(mesh)
  }
}

export function createInvestmentGardenScene(
  container: HTMLElement,
  options: GardenSceneOptions
): SceneHandle {
  const width = container.clientWidth
  const height = container.clientHeight || 400

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 7, 9)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.maxPolarAngle = Math.PI / 2.4
  controls.minDistance = 4
  controls.maxDistance = 16
  controls.target.set(0, 0, 0)

  const hemiLight = new THREE.HemisphereLight(0xbfdfff, 0x3d5c3d, 0.65)
  scene.add(hemiLight)

  const dirLight = new THREE.DirectionalLight(0xfff5e0, 0.95)
  dirLight.position.set(6, 12, 8)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(1024, 1024)
  scene.add(dirLight)

  const structureGroup = new THREE.Group()
  scene.add(structureGroup)
  const disposables: Array<THREE.BufferGeometry | THREE.Material> = []
  buildGardenStructure(structureGroup, disposables)

  const plantRoot = new THREE.Group()
  scene.add(plantRoot)

  const bedHighlightMeshes: THREE.Mesh[] = []
  for (const bed of GARDEN_BEDS) {
    const geo = new THREE.PlaneGeometry(bed.size + 0.1, bed.size + 0.1)
    disposables.push(geo)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x6badc9,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    disposables.push(mat)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(bed.centerX, 0.04, bed.centerZ)
    mesh.userData.bedIndex = bed.bedIndex
    structureGroup.add(mesh)
    bedHighlightMeshes.push(mesh)
  }

  let plantEntries: PlantEntry[] = []
  let particleSystem: THREE.Points | null = null
  let highlightedId: number | null = null
  let animationId = 0
  const clock = new THREE.Clock()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const reducedMotion = options.reducedMotion ?? false

  function clearPlants(): void {
    for (const entry of plantEntries) {
      plantRoot.remove(entry.group)
      disposePlantMesh(entry.meshResult)
    }
    plantEntries = []
  }

  function buildPlants(plants: PlantState[]): void {
    clearPlants()

    for (const plant of plants) {
      const meshResult = createCartoonPlant(plant.species, plant.scale, plant.health)
      const { group, parts } = meshResult
      group.position.set(plant.position.x, 0, plant.position.z)
      group.userData.assetId = plant.assetId
      group.userData.bedIndex = plant.bedIndex

      for (const part of parts) {
        part.userData.assetId = plant.assetId
      }

      plantRoot.add(group)
      plantEntries.push({
        assetId: plant.assetId,
        group,
        meshResult,
        wind: plant.wind,
        baseRotation: (plant.assetId % 360) * (Math.PI / 180),
        bedIndex: plant.bedIndex,
      })
    }
  }

  function buildParticles(plants: PlantState[]): void {
    if (particleSystem) {
      scene.remove(particleSystem)
      particleSystem.geometry.dispose()
      ;(particleSystem.material as THREE.Material).dispose()
      particleSystem = null
    }

    const windy = plants.filter(p => p.wind > 0.3)
    if (windy.length === 0 || reducedMotion) return

    const count = windy.length * 6
    const positions = new Float32Array(count * 3)
    windy.forEach((plant, pi) => {
      for (let i = 0; i < 6; i++) {
        const idx = (pi * 6 + i) * 3
        positions[idx] = plant.position.x + (Math.random() - 0.5) * 0.3
        positions[idx + 1] = 0.4 + Math.random() * plant.scale * 0.8
        positions[idx + 2] = plant.position.z + (Math.random() - 0.5) * 0.3
      }
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ color: 0xfff9c4, size: 0.06, transparent: true, opacity: 0.7 })
    disposables.push(geo, mat)
    particleSystem = new THREE.Points(geo, mat)
    scene.add(particleSystem)
  }

  function getIntersectableMeshes(): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = []
    plantEntries.forEach(entry => {
      entry.group.traverse(child => {
        if (child instanceof THREE.Mesh) meshes.push(child)
      })
    })
    return meshes
  }

  function pickAssetId(clientX: number, clientY: number): number | null {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)

    const hits = raycaster.intersectObjects(getIntersectableMeshes(), false)
    if (hits.length === 0) return null

    const hit = hits[0].object
    return (hit.userData.assetId as number) ?? null
  }

  function setBedHighlight(bedIndex: number | null): void {
    for (const mesh of bedHighlightMeshes) {
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = mesh.userData.bedIndex === bedIndex ? 0.18 : 0
    }
  }

  function setHighlight(assetId: number | null): void {
    highlightedId = assetId
    const entry = plantEntries.find(e => e.assetId === assetId)
    setBedHighlight(entry?.bedIndex ?? null)

    for (const plantEntry of plantEntries) {
      const isHighlighted = plantEntry.assetId === assetId
      plantEntry.group.traverse(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshToonMaterial) {
          if (isHighlighted) {
            child.material.emissive = new THREE.Color(0x224422)
            child.material.emissiveIntensity = 0.35
          } else {
            child.material.emissive = new THREE.Color(0x000000)
            child.material.emissiveIntensity = 0
          }
        }
      })
    }
  }

  function onPointerMove(e: PointerEvent): void {
    const id = pickAssetId(e.clientX, e.clientY)
    renderer.domElement.style.cursor = id != null ? 'pointer' : 'grab'
    options.onHover?.(id)
    if (id != null) {
      const entry = plantEntries.find(p => p.assetId === id)
      setBedHighlight(entry?.bedIndex ?? null)
    } else if (highlightedId == null) {
      setBedHighlight(null)
    }
  }

  function onPointerClick(e: PointerEvent): void {
    const id = pickAssetId(e.clientX, e.clientY)
    options.onClick?.(id)
    setHighlight(id)
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('click', onPointerClick)

  function animate(): void {
    animationId = requestAnimationFrame(animate)
    const elapsed = clock.getElapsedTime()

    if (!reducedMotion) {
      for (const entry of plantEntries) {
        const sway = Math.sin(elapsed * 2 + entry.baseRotation) * entry.wind * 0.1
        entry.group.rotation.z = sway
      }
      if (particleSystem) {
        particleSystem.rotation.y = elapsed * 0.08
      }
    }

    controls.update()
    renderer.render(scene, camera)
  }

  applySkyMood(scene, options.skyMood, dirLight)
  buildPlants(options.plants)
  buildParticles(options.plants)

  if (!reducedMotion) {
    animate()
  } else {
    controls.update()
    renderer.render(scene, camera)
  }

  const resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth
    const h = container.clientHeight || 400
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObserver.observe(container)

  return {
    dispose() {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('click', onPointerClick)
      clearPlants()
      if (particleSystem) {
        particleSystem.geometry.dispose()
        ;(particleSystem.material as THREE.Material).dispose()
      }
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      for (const d of disposables) d.dispose()
      structureGroup.traverse(obj => {
        if (obj instanceof THREE.Sprite) {
          const mat = obj.material as THREE.SpriteMaterial
          mat.map?.dispose()
          mat.dispose()
        }
      })
    },

    setHighlighted(assetId: number | null) {
      setHighlight(assetId)
    },

    updateGarden(plants: PlantState[], skyMood: SkyMood) {
      applySkyMood(scene, skyMood, dirLight)
      buildPlants(plants)
      buildParticles(plants)
      if (highlightedId != null) setHighlight(highlightedId)
      if (reducedMotion) {
        controls.update()
        renderer.render(scene, camera)
      }
    },
  }
}
