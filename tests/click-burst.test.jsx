import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import ClickBurst from '../src/components/ClickBurst'

let media
beforeEach(() => {
  vi.useFakeTimers()
  media = new Map()
  vi.spyOn(window, 'matchMedia').mockImplementation(query => {
    const entry = { matches: false, addEventListener: vi.fn((_, fn) => { entry.change = fn }), removeEventListener: vi.fn() }
    media.set(query, entry)
    return entry
  })
})
afterEach(() => vi.useRealTimers())
function pointer(target = document.body, pointerType = 'mouse', button = 0) {
  const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button, clientX: 140, clientY: 220 })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  fireEvent(target, event)
  return event
}
const count = () => document.querySelectorAll('.click-burst').length

describe('global click bursts', () => {
  it('creates a burst at the click position without cancelling button actions, and cleans it up', () => {
    const click = vi.fn()
    render(<><ClickBurst /><button onClick={click}>Action</button></>)
    const button = screen.getByRole('button')
    expect(pointer(button).defaultPrevented).toBe(false)
    fireEvent.click(button)
    expect(click).toHaveBeenCalledOnce()
    const burst = document.querySelector('.click-burst')
    expect(burst.style.left).toBe('140px')
    expect(burst.style.top).toBe('220px')
    expect(burst.children).toHaveLength(42)
    fireEvent.animationEnd(burst.firstChild)
    // React selects this fallback when JSDOM has no AnimationEvent constructor.
    fireEvent(burst.firstChild, new Event('webkitAnimationEnd', { bubbles: true }))
    expect(count()).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('ignores movement, touch, pen, right-click and editable fields including their labels', () => {
    render(<><ClickBurst /><label htmlFor="name">Name</label><input id="name" /><textarea /><div contentEditable suppressContentEditableWarning>Edit</div></>)
    fireEvent.pointerMove(document.body)
    pointer(document.body, 'touch')
    pointer(document.body, 'pen')
    pointer(document.body, 'mouse', 2)
    for (const target of document.querySelectorAll('input, textarea, label, [contenteditable]')) pointer(target)
    expect(count()).toBe(0)
  })
  it('caps rapid clicks at six and removes expired bursts even without animation events', () => {
    render(<ClickBurst />)
    for (let i = 0; i < 20; i++) pointer()
    expect(count()).toBe(6)
    expect(vi.getTimerCount()).toBe(6)
    act(() => vi.advanceTimersByTime(600))
    expect(count()).toBe(0)
  })
  it.each(['(prefers-reduced-motion: reduce)', '(hover: none)'])('disables and clears bursts when %s changes', query => {
    render(<ClickBurst />)
    pointer()
    expect(count()).toBe(1)
    const preference = media.get(query)
    act(() => { preference.matches = true; preference.change() })
    pointer()
    expect(count()).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('removes listeners and timers on unmount', () => {
    const { unmount } = render(<ClickBurst />)
    pointer()
    unmount()
    pointer()
    expect(vi.getTimerCount()).toBe(0)
    for (const preference of media.values()) expect(preference.removeEventListener).toHaveBeenCalled()
  })
})
