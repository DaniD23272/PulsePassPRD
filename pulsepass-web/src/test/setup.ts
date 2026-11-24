import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
    cleanup()
    server.resetHandlers()
    window.sessionStorage.clear()
    document.documentElement.classList.remove('dark')
})
afterAll(() => server.close())
