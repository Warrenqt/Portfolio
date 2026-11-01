import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { createPortraitPoints, layoutPortraitPoints, samplePortraitPoint, PARTICLE_DURATION, GATHER_START, PORTRAIT_SIZE } from '../src/lib/portraitParticles'

describe('portrait scatter and gather', () => {
  it('uses light dots for photo highlights in dark mode, preserving natural tonality', () => {
    const pixels = new Uint8ClampedArray(8 * 8 * 4)
    for (const x of [2, 5]) {
      const i = (2 * 8 + x) * 4
      pixels.fill(x === 2 ? 30 : 220, i, i + 3)
      pixels[i + 3] = 255
    }
    const light = createPortraitPoints(pixels, 8)
    const dark = createPortraitPoints(pixels, 8, 3, 'dark')
    expect(light[0].r).toBeGreaterThan(light[1].r)
    expect(dark[0].r).toBeLessThan(dark[1].r)
  })
  it('excludes transparent background pixels, even if their RGB is black', () => {
    const pixels = new Uint8ClampedArray(8 * 8 * 4)
    pixels[(2 * 8 + 2) * 4 + 3] = 255
    expect(createPortraitPoints(pixels, 8)).toHaveLength(1)
    expect(createPortraitPoints(pixels, 8)[0]).toMatchObject({ x: 2, y: 2 })
  })

  it('bursts outside the portrait, reverses, and finishes at exact photo coordinates', () => {
    const [point] = layoutPortraitPoints([{ x: 280, y: 280, r: 1.2, seed: 0.5, spreadX: 0.01, spreadY: 0.2 }], {
      width: 1200, height: 500, portrait: { x: 800, y: 0, width: 400, height: 400 },
    })
    const early = samplePortraitPoint(point, 100)
    const outward = samplePortraitPoint(point, GATHER_START)
    const returning = samplePortraitPoint(point, 1400)
    const final = samplePortraitPoint(point, PARTICLE_DURATION)
    const distance = sample => Math.hypot(sample.x - point.x, sample.y - point.y)
    expect(distance(outward)).toBeGreaterThan(distance(early))
    expect(outward.x).toBeLessThan(800)
    expect(distance(returning)).toBeLessThan(distance(outward))
    expect(final).toEqual({ x: point.x, y: point.y, r: point.r, alpha: 1 })
    expect(samplePortraitPoint(point, PARTICLE_DURATION + 10000)).toEqual(final)
  })

  it('ships a real alpha cutout and keeps every sampled dot inside the subject', async () => {
    const { data, info } = await sharp('public/warren-hero.png').resize(PORTRAIT_SIZE, PORTRAIT_SIZE).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    expect(info.channels).toBe(4)
    const alphas = Array.from(data).filter((_, index) => index % 4 === 3)
    expect(alphas.filter(alpha => alpha === 0).length / alphas.length).toBeGreaterThan(0.3)
    expect(alphas.filter(alpha => alpha >= 250).length / alphas.length).toBeGreaterThan(0.3)
    const points = createPortraitPoints(data)
    expect(points.length).toBeGreaterThan(5000)
    expect(points.every(point => data[(point.y * PORTRAIT_SIZE + point.x) * 4 + 3] > 0)).toBe(true)
  })
})
