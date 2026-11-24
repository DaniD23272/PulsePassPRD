import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AvisoExito from './AvisoExito'

describe('AvisoExito', () => {
    afterEach(() => vi.useRealTimers())

    it('se oculta a los cuatro segundos', () => {
        vi.useFakeTimers()
        render(<AvisoExito>Acción completada</AvisoExito>)

        expect(screen.getByRole('status')).toHaveTextContent('Acción completada')
        act(() => vi.advanceTimersByTime(3_999))
        expect(screen.getByRole('status')).toBeInTheDocument()
        act(() => vi.advanceTimersByTime(1))
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
})
