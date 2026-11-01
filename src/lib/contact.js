export function getFormEndpoint(value) {
  if (!value || value.includes('YOUR_FORM_ID')) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'formspree.io' && /^\/f\/[a-zA-Z0-9]+$/.test(url.pathname) ? url.href : null
  } catch { return null }
}

export function createMailto(email, fields) {
  const subject = `Portfolio enquiry from ${fields.name}`
  const body = `${fields.message}\n\nFrom: ${fields.name}\nEmail: ${fields.email}`
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export async function submitContact(endpoint, fields, fetcher = fetch) {
  const response = await fetcher(endpoint, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: fields.name, email: fields.email, message: fields.message, _subject: `Portfolio enquiry from ${fields.name}` }),
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error('Message could not be sent')
}
