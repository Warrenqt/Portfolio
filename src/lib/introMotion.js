// Each glyph curls up from a shared emitter; all timings are in seconds.
export const LETTER_START = 0.3
export const LETTER_STAGGER = 0.125
export const LETTER_TRAVEL = 0.75
export const DOCK_START = 1.7
export const DOCK_END = 2.1

export const clamp01 = value => Math.min(1, Math.max(0, value))
export const easeOutCubic = value => 1 - (1 - clamp01(value)) ** 3
export const easeInOutCubic = value => {
  const t = clamp01(value)
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}
const bezier = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d

export function sampleLetter(time, index, targetX) {
  const elapsed = time - LETTER_START - index * LETTER_STAGGER
  const progress = clamp01(elapsed / LETTER_TRAVEL)
  const p = easeOutCubic(progress)
  const curl = Math.sin(Math.PI * progress) * (1 - progress)
  return {
    visible: elapsed >= 0,
    x: bezier(0, targetX * 0.15 - 0.3, targetX - 0.22, targetX, p),
    y: bezier(-0.95, 1.15, 1.1, 0, p),
    z: Math.sin(Math.PI * p) * 0.9,
    rotationX: (1 - p) * 0.65,
    rotationY: (1 - p) * -1.15,
    rotationZ: (1 - p) * (index * 0.13 - 0.52) - curl * 0.42,
    scale: Math.max(0.001, easeOutCubic(progress / 0.38)),
    depth: time >= 1.88 ? 0.001 : 1,
  }
}
