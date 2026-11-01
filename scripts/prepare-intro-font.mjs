import * as fontkit from 'fontkit'
import { writeFile } from 'node:fs/promises'
import { portfolio } from '../src/data/portfolio.js'

const font = fontkit.openSync('node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff')
const glyphs = {}
for (const letter of new Set(portfolio.firstName + '? ')) {
  const glyph = font.glyphForCodePoint(letter.codePointAt(0))
  const outline = []
  let start = [0, 0]
  for (const { command, args } of glyph.path.commands) {
    const a = args.map(value => Number(value.toFixed(3)))
    if (command === 'moveTo') { start = a; outline.push('m', ...a) }
    if (command === 'lineTo') outline.push('l', ...a)
    if (command === 'quadraticCurveTo') outline.push('q', a[2], a[3], a[0], a[1])
    if (command === 'bezierCurveTo') outline.push('b', a[4], a[5], a[0], a[1], a[2], a[3])
    if (command === 'closePath') outline.push('l', ...start)
  }
  glyphs[letter] = { ha: glyph.advanceWidth, x_min: glyph.bbox.minX || 0, x_max: glyph.bbox.maxX || 0, o: outline.join(' ') }
}
const data = { glyphs, familyName: 'Archivo Black', ascender: font.ascent, descender: font.descent, resolution: font.unitsPerEm, boundingBox: { yMin: font.descent, yMax: font.ascent }, underlineThickness: 50, original_font_information: { copyright: 'Copyright 2017 The Archivo Black Project Authors', license: 'SIL Open Font License 1.1 — see public/Archivo-Black-LICENSE.txt' } }
await writeFile('src/assets/intro-font.json', JSON.stringify(data))
console.log('Prepared matching Archivo Black outlines for the 3D intro.')
