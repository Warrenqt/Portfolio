export const PORTRAIT_SIZE = 560
export const PARTICLE_DURATION = 2200
export const SCATTER_END = 560
export const GATHER_START = 720

const clamp = value => Math.min(1, Math.max(0, value))
const mix = (from, to, progress) => from + (to - from) * progress
const random = (x, y, seed) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
  return value - Math.floor(value)
}

// Both the canvas and static fallback sample the cutout's alpha mask.
export function createPortraitPoints(pixels, size = PORTRAIT_SIZE, gap = 3, theme = 'light') {
  const points = []
  for (let y = 2; y < size; y += gap) for (let x = 2; x < size; x += gap) {
    const i = (y * size + x) * 4
    const alpha = pixels[i + 3] / 255
    if (alpha < 0.15) continue
    const light = (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255
    const density = clamp(((theme === 'dark' ? light : 1 - light) - 0.08) * 1.2)
    const r = Math.sqrt(density * alpha) * gap * 0.51
    if (r < 0.2) continue
    points.push({ x, y, r, seed: random(x, y, 1), spreadX: random(x, y, 2), spreadY: random(x, y, 3) })
  }
  return points
}

// Coordinates are in CSS pixels; the canvas covers the whole hero, not a photo box.
export function layoutPortraitPoints(points, { width, height, portrait }) {
  const scale = portrait.width / PORTRAIT_SIZE
  const centerX = portrait.x + portrait.width * 0.5
  const centerY = portrait.y + portrait.height * 0.43
  return points.map(point => ({
    ...point,
    x: portrait.x + point.x * scale,
    y: portrait.y + point.y * scale,
    r: point.r * scale,
    startX: centerX + (point.spreadX - 0.5) * portrait.width * 0.22,
    startY: centerY + (point.spreadY - 0.5) * portrait.height * 0.18,
    outX: (point.spreadX * 1.24 - 0.12) * width,
    outY: (point.spreadY * 1.36 - 0.18) * height,
    delay: point.seed * 180,
    curl: (point.seed - 0.5) * portrait.width * 0.16,
    dustRadius: Math.max(0.24, scale * (0.4 + point.seed * 0.48)),
  }))
}

export function samplePortraitPoint(point, elapsed) {
  if (elapsed >= PARTICLE_DURATION) return { x: point.x, y: point.y, r: point.r, alpha: 1 }
  if (elapsed < GATHER_START + point.delay) {
    const progress = clamp((elapsed - point.delay * 0.35) / SCATTER_END)
    const outward = 1 - (1 - progress) ** 3
    return {
      x: mix(point.startX, point.outX, outward),
      y: mix(point.startY, point.outY, outward),
      r: point.dustRadius,
      alpha: clamp(elapsed / 160) * 0.62,
    }
  }
  const progress = clamp((elapsed - GATHER_START - point.delay) / (PARTICLE_DURATION - GATHER_START - point.delay))
  const inward = 1 - (1 - progress) ** 3
  const drift = Math.sin(progress * Math.PI) * (1 - inward)
  return {
    x: mix(point.outX, point.x, inward) + point.curl * drift,
    y: mix(point.outY, point.y, inward) - point.curl * drift,
    r: mix(point.dustRadius, point.r, inward),
    alpha: mix(0.62, 1, inward),
  }
}

export function drawPortraitFrame(ctx, points, elapsed, { width, height }, pointer = null, ink = '#111111') {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = ink
  const settled = elapsed >= PARTICLE_DURATION
  // Four opacity groups avoid thousands of fill() calls per frame.
  for (let group = 0; group < 4; group++) {
    ctx.beginPath()
    let opacity = 1
    for (let index = group; index < points.length; index += 4) {
      const sample = samplePortraitPoint(points[index], elapsed)
      let { x, y, r } = sample
      opacity = sample.alpha
      if (pointer && settled) {
        const dx = x - pointer.x, dy = y - pointer.y
        const distance = Math.hypot(dx, dy)
        if (distance < 48 && distance > 0) {
          const repel = (1 - distance / 48) * 5
          x += dx / distance * repel
          y += dy / distance * repel
          r *= 0.9
        }
      }
      ctx.moveTo(x + r, y)
      ctx.arc(x, y, r, 0, Math.PI * 2)
    }
    ctx.globalAlpha = opacity
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
