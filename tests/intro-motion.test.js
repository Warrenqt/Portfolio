import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { DOCK_START, LETTER_START, LETTER_STAGGER, sampleLetter } from '../src/lib/introMotion'

describe('reel-inspired intro', () => {
  it('releases letters in order from one point instead of bursting all at once', () => {
    for (let index = 0; index < 6; index++) {
      const launch = LETTER_START + LETTER_STAGGER * index
      expect(sampleLetter(launch - 0.001, index, index - 2.5).visible).toBe(false)
      const pose = sampleLetter(launch, index, index - 2.5)
      expect(pose.visible).toBe(true)
      expect(pose.x).toBeCloseTo(0)
      expect(pose.y).toBeCloseTo(-0.95)
      expect(sampleLetter(launch + 0.2, index, index - 2.5).y).toBeGreaterThan(0)
    }
  })
  it('settles every glyph before the hero handoff and flattens its depth', () => {
    for (let index = 0; index < 6; index++) {
      const pose = sampleLetter(DOCK_START, index, index - 2.5)
      expect(pose.x).toBe(index - 2.5)
      expect(pose.y).toBe(0)
      expect(pose.rotationX).toBe(0)
      expect(pose.rotationY).toBeCloseTo(0)
      expect(pose.rotationZ).toBeCloseTo(0)
      expect(pose.scale).toBe(1)
      expect(sampleLetter(1.9, index, index - 2.5).depth).toBe(0.001)
    }
  })
  it('uses real heading-font outlines that produce valid extruded geometry', () => {
    const font = new FontLoader().parse(JSON.parse(readFileSync('src/assets/intro-font.json', 'utf8')))
    expect(font.data.familyName).toBe('Archivo Black')
    for (const letter of 'WAREN') {
      const geometry = new TextGeometry(letter, { font, size: 1.42, depth: 0.4 })
      geometry.computeBoundingBox()
      expect(geometry.attributes.position.count).toBeGreaterThan(0)
      expect(geometry.boundingBox.max.y - geometry.boundingBox.min.y).toBeGreaterThan(0.8)
      expect([...geometry.attributes.position.array].every(Number.isFinite)).toBe(true)
      geometry.dispose()
    }
  })
})
