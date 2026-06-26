import type { PlantSpecies, SkyMood } from '../huerto/portfolioMetaphor'

export const SPECIES_COLORS: Record<PlantSpecies, { trunk: number; foliage: number }> = {
  exotic: { trunk: 0x5d4037, foliage: 0xab47bc },
  native: { trunk: 0x6d4c41, foliage: 0x66bb6a },
  slow: { trunk: 0x8d6e63, foliage: 0x9ccc65 },
  ground: { trunk: 0x795548, foliage: 0xa1887f },
}

export const SKY_MOOD_CONFIG: Record<
  SkyMood,
  { sky: number; fog: number; fogNear: number; fogFar: number; sunIntensity: number }
> = {
  stormy: { sky: 0x4a5568, fog: 0x718096, fogNear: 5, fogFar: 25, sunIntensity: 0.4 },
  cloudy: { sky: 0x7a8a9a, fog: 0x9aa8b4, fogNear: 8, fogFar: 35, sunIntensity: 0.6 },
  neutral: { sky: 0x87ceeb, fog: 0xb0d4e8, fogNear: 10, fogFar: 50, sunIntensity: 0.8 },
  sunny: { sky: 0x5eb3f5, fog: 0x8ec8f0, fogNear: 15, fogFar: 60, sunIntensity: 1.0 },
  golden: { sky: 0xffb347, fog: 0xffd89b, fogNear: 12, fogFar: 55, sunIntensity: 0.9 },
}

export function healthToFoliageColor(health: number): number {
  if (health < 0.35) return 0xa1887f
  if (health < 0.65) return 0x9ccc65
  return 0x66bb6a
}
