import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createCanvas, DOMMatrix, Path2D, ImageData } from '@napi-rs/canvas'
globalThis.DOMMatrix = DOMMatrix
globalThis.Path2D = Path2D
globalThis.ImageData = ImageData
const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
const bytes = new Uint8Array(await readFile('public/resume.pdf'))
const pdf = await getDocument({ data: bytes, useSystemFonts: true }).promise
await mkdir('.qa', { recursive: true })
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i)
  const viewport = page.getViewport({ scale: 1.5 })
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  await writeFile(`.qa/resume-page-${i}.png`, canvas.toBuffer('image/png'))
  const content = await page.getTextContent()
  console.log(`Page ${i}: ${content.items.map(item => item.str).join(' ').length} characters; rendered ${canvas.width}×${canvas.height}.`)
}
console.log(`Verified ${pdf.numPages} PDF page(s).`)
if (typeof pdf.cleanup === 'function') await pdf.cleanup()
