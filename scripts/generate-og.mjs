import sharp from 'sharp'
import { openSync } from 'fontkit'
import { resolve } from 'node:path'

// Use the actual local fonts and existing portrait; no browser or AI assets.
const display = openSync(resolve('node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2'))
const mono = openSync(resolve('node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2'))
function lettering(text, font, size, x, y, fill, maxWidth = 620) {
  const run = font.layout(text)
  const scale = Math.min(size / font.unitsPerEm, maxWidth / run.positions.reduce((sum, position) => sum + position.xAdvance, 0))
  let cursor = 0
  return `<g fill="${fill}">${run.glyphs.map((glyph, i) => {
    const position = run.positions[i]
    const path = `<path transform="translate(${x + (cursor + position.xOffset) * scale} ${y - position.yOffset * scale}) scale(${scale} ${-scale})" d="${glyph.path.toSVG()}"/>`
    cursor += position.xAdvance
    return path
  }).join('')}</g>`
}
const type = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<path fill="#F2EFE8" d="M0 0h1200v630H0z"/>
<path fill="#111111" d="M48 45h1104v2H48zM48 582h1104v2H48z"/>
${lettering('WARREN', display, 108, 48, 270, '#111111')}
${lettering('PANERGAYO', display, 80, 48, 355, '#FF4F00')}
${lettering('Web & Mobile Developer', mono, 24, 52, 415, '#111111')}
${lettering('WARRENQT.VERCEL.APP', mono, 14, 52, 552, '#111111')}
</svg>`
const portrait = await sharp('public/warren-halftone.svg').resize(530, 530).png().toBuffer()
await sharp(Buffer.from(type)).composite([{ input: portrait, left: 670, top: 65 }]).png().toFile('public/og.png')
console.log('Generated public/og.png (1200 × 630).')
