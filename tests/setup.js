import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(query => ({ matches: query.includes('prefers-reduced-motion'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() })) })
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = class { observe() {} disconnect() {} }
// jsdom does not implement the native dialog top layer.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); vi.restoreAllMocks() })
