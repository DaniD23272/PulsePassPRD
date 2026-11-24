import { describe, expect, it } from 'vitest'
import { artista } from '../test/fixtures'
import { artistasNoAsociados, eventoAceptaCompras, eventoPermiteAsociarArtistas, rolPuedeComprarEntrada } from './eventos/politicas'
import { ticketPuedeCancelarse, ticketPuedeValidarse } from './tickets/politicas'

describe('políticas de presentación derivadas del contrato de la API', () => {
    it('muestra compra solo para rol USER y eventos publicados', () => {
        expect(rolPuedeComprarEntrada(['USER'])).toBe(true)
        expect(rolPuedeComprarEntrada(['USER', 'STAFF'])).toBe(false)
        expect(rolPuedeComprarEntrada(undefined)).toBe(false)
        expect(eventoAceptaCompras('PUBLISHED')).toBe(true)
        expect(eventoAceptaCompras('DRAFT')).toBe(false)
    })

    it('oculta asociaciones en eventos cancelados o finalizados', () => {
        expect(eventoPermiteAsociarArtistas('DRAFT')).toBe(true)
        expect(eventoPermiteAsociarArtistas('CANCELLED')).toBe(false)
        expect(eventoPermiteAsociarArtistas('FINISHED')).toBe(false)
    })

    it('no ofrece acciones de ticket para estados que el servidor no acepta', () => {
        expect(ticketPuedeCancelarse('PAID')).toBe(true)
        expect(ticketPuedeCancelarse('USED')).toBe(false)
        expect(ticketPuedeValidarse('PAID')).toBe(true)
        expect(ticketPuedeValidarse('CANCELLED')).toBe(false)
    })

    it('filtra los artistas ya asociados por id', () => {
        expect(artistasNoAsociados([artista, { ...artista, id: 2, stageName: 'Neon Waves' }], [artista]))
            .toMatchObject([{ id: 2, stageName: 'Neon Waves' }])
    })
})
