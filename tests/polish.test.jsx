import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Log from '../src/components/Log'
import { EmailCopy } from '../src/components/Contact'
import { portfolio } from '../src/data/portfolio'

describe('certificate disclosure', () => {
  it('shows five recent certificates and expands and collapses from the keyboard', async () => {
    const user = userEvent.setup()
    render(<Log />)
    expect(document.querySelectorAll('tbody tr')).toHaveLength(5)
    expect(screen.getByRole('rowheader', { name: 'Software Development — IT Specialist' })).toBeTruthy()
    const toggle = screen.getByRole('button', { name: new RegExp(`SHOW ALL ${portfolio.log.certificates.length}`) })
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(document.querySelectorAll('tbody tr')).toHaveLength(portfolio.log.certificates.length)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    await user.keyboard(' ')
    expect(document.querySelectorAll('tbody tr')).toHaveLength(5)
  })
})

describe('email copy', () => {
  it('copies the actual email and announces success', async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<EmailCopy link={portfolio.contact.links[0]} />)
    await user.click(screen.getByRole('button', { name: portfolio.contact.copyEmail }))
    expect(write).toHaveBeenCalledWith(portfolio.email)
    expect(screen.getByRole('status').textContent).toBe(portfolio.contact.copied)
  })
  it('reports clipboard failure without claiming success', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    render(<EmailCopy link={portfolio.contact.links[0]} />)
    await user.click(screen.getByRole('button', { name: portfolio.contact.copyEmail }))
    expect(screen.getByRole('status').textContent).toBe(portfolio.contact.copyFailed)
  })
})
