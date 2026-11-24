import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatearPrecio } from '../features/tickets/api'
import { server } from '../test/server'
import { ApiError, getJson, registrarManejadorSesionExpirada } from './http'

describe('TEST-FE-LIB: cliente HTTP y formato', () => {
    afterEach(() => {
        server.resetHandlers()
    })

    it('TEST-FE-LIB-001 agrega Bearer solo en Authorization', async () => {
        let authorization: string | null = null
        let url: string | undefined
        server.use(http.get('http://localhost/api/prueba', ({ request }) => {
            authorization = request.headers.get('authorization')
            url = request.url
            return HttpResponse.json({ ok: true })
        }))

        await getJson('/api/prueba', 'jwt-de-prueba')

        expect(authorization).toBe('Bearer jwt-de-prueba')
        expect(url).not.toContain('jwt-de-prueba')
    })

    it('TEST-FE-LIB-002 valida ErrorResponse y conserva status/details', async () => {
        server.use(http.get('http://localhost/api/error-valido', () => HttpResponse.json({
            timestamp: '2026-11-24T12:00:00',
            status: 409,
            error: 'Conflict',
            message: 'El ticket ya fue utilizado.',
            details: { ticketCode: 'No se puede volver a usar.' },
        }, { status: 409 })))

        await expect(getJson('/api/error-valido')).rejects.toMatchObject({
            status: 409,
            message: 'El ticket ya fue utilizado.',
            details: { ticketCode: 'No se puede volver a usar.' },
        })
    })

    it('TEST-FE-LIB-003 usa un mensaje genérico si el cuerpo de error no cumple el esquema', async () => {
        server.use(http.get('http://localhost/api/error-invalido', () => HttpResponse.json({
            status: '500',
            message: '<script>no seguro</script>',
            details: ['no', 'es', 'objeto'],
        }, { status: 500 })))

        await expect(getJson('/api/error-invalido')).rejects.toMatchObject({
            status: 500,
            message: 'No fue posible completar la solicitud.',
        })
    })

    it('TEST-FE-LIB-004 ejecuta el cierre de sesión tras un 401 autenticado', async () => {
        const cerrar = vi.fn()
        const retirar = registrarManejadorSesionExpirada(cerrar)
        server.use(http.get('http://localhost/api/sesion', () => HttpResponse.json({
            timestamp: '2026-11-24T12:00:00',
            status: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
            details: {},
        }, { status: 401 })))

        try {
            await expect(getJson('/api/sesion', 'jwt-vencido')).rejects.toBeInstanceOf(ApiError)
            expect(cerrar).toHaveBeenCalledOnce()
        } finally {
            retirar()
        }
    })

    it('TEST-FE-LIB-005 formatea el precio como pesos colombianos', () => {
        expect(formatearPrecio(250000)).toContain('250.000')
        expect(formatearPrecio(250000)).toContain('$')
    })
})
