import PDFDocument from 'pdfkit'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { portfolio } from '../src/data/portfolio.js'

await mkdir('public', { recursive: true })
const document = new PDFDocument({ size: 'A4', margin: 44, info: { Title: 'Warren A Panergayo Resume', Author: 'Warren A. Panergayo', Subject: 'Education, experience, certifications, and technical skills' } })
const output = createWriteStream('public/resume.pdf')
document.pipe(output)
const left = 44, width = 507
document.registerFont('regular', 'C:/Windows/Fonts/arial.ttf')
document.registerFont('bold', 'C:/Windows/Fonts/arialbd.ttf')

const text = (copy, options = {}) => document.font(options.bold ? 'bold' : 'regular').fontSize(options.size ?? 9).fillColor('#111111').text(copy, options.x ?? left, options.y, { width: options.width ?? width, lineGap: options.lineGap ?? 2, ...options })
const heading = title => { document.moveDown(.65); text(title, { bold: true, size: 10 }); document.moveDown(.35) }

text(portfolio.name, { bold: true, size: 24, lineGap: 0 })
document.moveDown(.25)
text('San Pablo City, Laguna, Philippines', { size: 9 })
text(`${portfolio.email}  |  09063742673  |  github.com/Warrenqt`, { size: 9 })

heading('SUMMARY')
text('BS Information Technology student majoring in Web and Mobile Application Development with hands-on experience in web and mobile application development, database management, REST APIs, and UI/UX design. Skilled in various programming languages and development tools, with strong problem-solving, teamwork, and adaptability. Seeking an opportunity to apply my skills and gain further experience in software and application development.', { lineGap: 2.1 })

heading('EDUCATION')
text('Laguna State Polytechnic University — San Pablo City Campus', { bold: true })
text('BS Information Technology · 2023–Present')
text('Major in Web and Mobile Application Development')
document.moveDown(.4)
text('STI College — San Pablo City Campus', { bold: true })
text('Mobile App and Web Development · 2023')

heading('WORK IMMERSION')
text('Khaleesi Trucking', { bold: true })
text('IT Intern — Management System Development')
text('San Pablo City, Laguna · April–June 2023')

heading('TRAINING AND CERTIFICATIONS')
for (const cert of portfolio.log.certificates) {
  const y = document.y
  const label = cert.issuer === '—' ? cert.name : `${cert.name} — ${cert.issuer}`
  text(label, { size: 8.2, width: 393, lineGap: 1.5 })
  const next = document.y
  text(cert.date.replace('SEP', 'Sep').replace('OCT', 'Oct').replace('MAY', 'May').replace('MAR', 'Mar').replace('JAN', 'Jan').replace('JUN', 'Jun'), { size: 7.8, x: 446, y, width: 105, align: 'right' })
  document.y = Math.max(next, document.y) + 3.8
}

heading('SKILLS AND INTERESTS')
for (const group of portfolio.stack.groups) {
  text(`${group.title}: `, { bold: true, size: 8.4, continued: true, lineGap: 1.6 })
  document.font('regular').text(group.items.join(', '), { lineGap: 1.6 })
  document.moveDown(.18)
}
text('Interests: Gym, gaming, basketball.', { size: 8.4 })
document.end()
await new Promise((resolve, reject) => { output.on('finish', resolve); output.on('error', reject) })
console.log('Created public/resume.pdf from the supplied résumé content.')
