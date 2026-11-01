import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(query => ({ matches: query.includes('prefers-reduced-motion'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() })) })
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
afterEach(() => { cleanup(); vi.restoreAllMocks() })
