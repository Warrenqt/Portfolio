import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createPortraitPoints, PORTRAIT_SIZE } from '../src/lib/portraitParticles.js'

const root = process.cwd()
await mkdir(resolve(root, 'public/projects'), { recursive: true })
await sharp(resolve(root, 'Profile pictures/Profile-cutout.png'))
  .rotate().resize(840, 840, { fit: 'cover' }).png({ palette: true, quality: 88, effort: 10 })
  .toFile(resolve(root, 'public/warren-hero.png'))

// A real, pre-rendered halftone fallback: no canvas, WebGL, or remote service needed.
const size = PORTRAIT_SIZE
const data = await sharp(resolve(root, 'public/warren-hero.png')).resize(size, size).ensureAlpha().raw().toBuffer()
const circles = createPortraitPoints(data).map(({ x, y, r }) => `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}"/>`)
await writeFile(resolve(root, 'public/warren-halftone.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><g fill="#111111">${circles.join('')}</g></svg>`)
const highlights = createPortraitPoints(data, size, 3, 'dark').map(({ x, y, r }) => `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}"/>`)
await writeFile(resolve(root, 'public/warren-halftone-dark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><g fill="#f2efe8">${highlights.join('')}</g></svg>`)

const diagrams = {
  streetsmart: '<path d="M170 40 90 360m240-320 120 320M250 40l-5 50m-8 40-8 50m-8 40-8 50m-8 40-8 50"/><path d="m360 100 30 0 0 30-30 0zM104 217h54v35h-54z"/><path d="m385 80 40-30m-305 235-40 30"/>',
  repsynk: '<path d="M100 260h360M100 285h360M130 220v-45m50 45v-80m50 80v-55m50 55v-110m50 110v-70m50 70V85m50 135V60"/><path d="M100 75h115M100 95h65"/>',
  booket: '<path d="M95 100q90-40 185 15 90-55 185-15v220q-90-40-185 0-90-40-185 0zM280 115v205M120 140q75-20 135 10m-135 30q75-20 135 10m-135 30q75-20 135 10m50-80q65-30 135-10m-135 50q65-30 135-10m-135 50q65-30 135-10"/>',
  tandaverse: '<rect x="205" y="110" width="130" height="150"/><path d="M225 135h90m-90 22h65m-65 60h90m-90 22h90M205 175H100v100h105m130-100h120V75H335"/><circle cx="100" cy="80" r="28"/><circle cx="455" cy="310" r="28"/><path d="M100 110v65m355 0v107"/>',
}
for (const [slug, diagram] of Object.entries(diagrams)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#111" opacity=".18"/></pattern></defs><path fill="#E5E0D5" d="M0 0h640v400H0z"/><path fill="url(#dots)" d="M0 0h640v400H0z"/><g transform="translate(35 0)" fill="none" stroke="#111" stroke-width="3">${diagram}</g><path d="M20 20h600v360H20z" fill="none" stroke="#111"/><text x="35" y="45" font-family="monospace" font-size="11">${slug.toUpperCase()} / CASE FILE</text><text x="35" y="365" font-family="monospace" font-size="10">PREVIEW PLACEHOLDER — SCREENSHOT TO FOLLOW</text></svg>`
  await sharp(Buffer.from(svg)).jpeg({ quality: 83 }).toFile(resolve(root, `public/projects/${slug}.jpg`))
}

const fontPath = resolve(root, 'src/assets/intro-font.json')
const font = JSON.parse(await readFile(fontPath, 'utf8'))
font.glyphs = Object.fromEntries(Object.entries(font.glyphs).filter(([char]) => 'WAREN? '.includes(char)))
await writeFile(fontPath, JSON.stringify(font))
console.log('Prepared portrait, static halftone, four preview placeholders, and a subsetted intro font.')
