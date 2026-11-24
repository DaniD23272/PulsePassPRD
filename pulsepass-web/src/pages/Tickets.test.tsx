import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import { evento, perfil, sede, ticket, usuario } from '../test/fixtures'
import { renderConRutas } from '../test/render'
import { prepararSesion } from '../test/sesion'
import EventoDetallePage from './EventoDetallePage'
import ConfirmacionCompraPage from './ConfirmacionCompraPage'
import MisEntradasPage from './MisEntradasPage'
import DetalleTicketPage from './DetalleTicketPage'

const ticketUsado = { ...ticket, id: 2, ticketCode: 'TKT-USADO', status: 'USED' }
const pagoUrl = 'http://localhost/api/tickets'
const eventosUrl = 'http://localhost/api/events/CMF-2026'

function handlersEvento() {
    server.use(
        http.get(eventosUrl, () => HttpResponse.json(evento)),
        http.get(`http://localhost/api/venues/${sede.code}`, () => HttpResponse.json(sede)),
    )
}

function handlersTickets(lista: unknown[]) {
    server.use(http.get('http://localhost/api/tickets/by-user', () => HttpResponse.json(lista)))
}

describe('TEST-FE-TKT: compra y tickets de usuario', () => {
    it('TEST-FE-TKT-001/004 compra y envía el email de la sesión a confirmación', async () => {
        const user = userEvent.setup()
        prepararSesion(['USER'])
        handlersEvento()
        let emailEnviado = ''
        server.use(
            http.post(pagoUrl, async ({ request }) => {
                const cuerpo = await request.json() as { userEmail: string; type: string }
                emailEnviado = cuerpo.userEmail
                return HttpResponse.json(ticket, { status: 201 })
            }),
            http.get('http://localhost/api/tickets/TKT-8F2A1C', () => HttpResponse.json(ticket)),
        )
        renderConRutas([
            { path: '/eventos/:eventCode', element: <EventoDetallePage /> },
            { path: '/compra/confirmacion/:ticketCode', element: <ConfirmacionCompraPage /> },
        ], '/eventos/CMF-2026')

        expect(await screen.findByRole('radio', { name: 'GENERAL' })).toBeChecked()
        expect(screen.getByRole('radio', { name: 'VIP' })).toBeInTheDocument()
        expect(screen.getByRole('radio', { name: 'BACKSTAGE' })).toBeInTheDocument()
        expect(screen.getByRole('radio', { name: 'STUDENT' })).toBeInTheDocument()
        await user.click(screen.getAllByRole('button', { name: 'Comprar entrada' })[0])
        await user.click(screen.getByRole('button', { name: 'Confirmar' }))

        expect(await screen.findByRole('heading', { name: '¡Compra realizada con éxito!' })).toBeInTheDocument()
        expect(emailEnviado).toBe(perfil.email)
    })

    it('TEST-FE-TKT-002 pide login al intentar comprar sin sesión', async () => {
        const user = userEvent.setup()
        handlersEvento()
        const { router } = renderConRutas([
            { path: '/eventos/:eventCode', element: <EventoDetallePage /> },
            { path: '/login', element: <h1>Iniciar sesión de prueba</h1> },
        ], '/eventos/CMF-2026')

        await user.click((await screen.findAllByRole('button', { name: 'Inicia sesión para comprar' }))[0])
        expect(await screen.findByRole('heading', { name: 'Iniciar sesión de prueba' })).toBeInTheDocument()
        expect(router.state.location.state).toEqual({ desde: '/eventos/CMF-2026' })
    })

    it('TEST-FE-TKT-003 muestra error 409 de compra en el modal', async () => {
        const user = userEvent.setup()
        prepararSesion(['USER'])
        handlersEvento()
        server.use(http.post(pagoUrl, () => HttpResponse.json({
            timestamp: '2026-11-24', status: 409, error: 'Conflict', message: 'El usuario no cumple la edad mínima.', details: {},
        }, { status: 409 })))
        renderConRutas([{ path: '/eventos/:eventCode', element: <EventoDetallePage /> }], '/eventos/CMF-2026')

        await user.click((await screen.findAllByRole('button', { name: 'Comprar entrada' }))[0])
        await user.click(screen.getByRole('button', { name: 'Confirmar' }))

        const dialog = await screen.findByRole('dialog', { name: 'Confirmar compra' })
        expect(within(dialog).getByRole('alert')).toHaveTextContent('El usuario no cumple la edad mínima.')
    })

    it('TEST-FE-TKT-005 muestra y filtra tickets por estado', async () => {
        const user = userEvent.setup()
        prepararSesion(['USER'])
        handlersTickets([ticket, ticketUsado])
        renderConRutas([{ path: '/mis-tickets', element: <MisEntradasPage /> }], '/mis-tickets')

        const ticketPagado = await screen.findByText(/TKT-8F2A1C/)
        expect(ticketPagado).toBeInTheDocument()
        expect(ticketPagado.closest('li')).toHaveTextContent('PAID')
        expect(ticketPagado.closest('li')).toHaveTextContent('VIP')
        await user.click(screen.getByRole('button', { name: 'Usados' }))
        expect(screen.getByText(/TKT-USADO/)).toBeInTheDocument()
        expect(screen.queryByText(/TKT-8F2A1C/)).not.toBeInTheDocument()
    })

    it('TEST-FE-TKT-006 muestra estado vacío sin tickets', async () => {
        prepararSesion(['USER'])
        handlersTickets([])
        renderConRutas([{ path: '/mis-tickets', element: <MisEntradasPage /> }], '/mis-tickets')

        expect(await screen.findByRole('heading', { name: 'Aún no tienes tickets' })).toBeInTheDocument()
    })

    it('TEST-FE-TKT-007 cancela PAID e invalida la lista', async () => {
        const user = userEvent.setup()
        prepararSesion(['USER'])
        let estadoActual = ticket
        server.use(
            http.get('http://localhost/api/tickets/by-user', () => HttpResponse.json([estadoActual])),
            http.patch('http://localhost/api/tickets/TKT-8F2A1C/cancel', () => {
                estadoActual = { ...ticket, status: 'CANCELLED' }
                return HttpResponse.json(estadoActual)
            }),
        )
        renderConRutas([{ path: '/mis-tickets', element: <MisEntradasPage /> }], '/mis-tickets')

        await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
        const dialog = screen.getByRole('dialog', { name: 'Cancelar ticket' })
        await user.click(within(dialog).getByRole('button', { name: 'Confirmar cancelación' }))

        expect(await screen.findByRole('status')).toHaveTextContent('El ticket fue cancelado.')
        await waitFor(() => expect(screen.getByText('CANCELLED')).toBeInTheDocument())
        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    })

    it('TEST-FE-TKT-008 conserva el modal y muestra el 409 de cancelación', async () => {
        const user = userEvent.setup()
        prepararSesion(['USER'])
        handlersTickets([ticket])
        server.use(http.patch('http://localhost/api/tickets/TKT-8F2A1C/cancel', () => HttpResponse.json({
            timestamp: '2026-11-24', status: 409, error: 'Conflict', message: 'El ticket ya fue utilizado.', details: {},
        }, { status: 409 })))
        renderConRutas([{ path: '/mis-tickets', element: <MisEntradasPage /> }], '/mis-tickets')

        await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
        const dialog = screen.getByRole('dialog', { name: 'Cancelar ticket' })
        await user.click(within(dialog).getByRole('button', { name: 'Confirmar cancelación' }))

        expect(await within(dialog).findByRole('alert')).toHaveTextContent('El ticket ya fue utilizado.')
        expect(screen.getByRole('dialog', { name: 'Cancelar ticket' })).toBeInTheDocument()
    })

    it('TEST-FE-TKT-009 oculta datos de ticket ajeno o inexistente', async () => {
        prepararSesion(['USER'])
        server.use(http.get('http://localhost/api/tickets/TKT-8F2A1C', () => HttpResponse.json({
            timestamp: '2026-11-24', status: 403, error: 'Forbidden', message: 'Forbidden', details: {},
        }, { status: 403 })),
        http.get('http://localhost/api/users/by-username', () => HttpResponse.json(usuario)),
        )
        renderConRutas([{ path: '/mis-tickets/:ticketCode', element: <DetalleTicketPage /> }], '/mis-tickets/TKT-8F2A1C')

        expect(await screen.findByRole('heading', { name: 'Ticket no disponible' })).toBeInTheDocument()
        expect(screen.queryByText('Forbidden')).not.toBeInTheDocument()
    })

    it('TEST-FE-TKT-010 no ofrece cancelar si el estado no es PAID', async () => {
        prepararSesion(['USER'])
        handlersTickets([ticketUsado])
        renderConRutas([{ path: '/mis-tickets', element: <MisEntradasPage /> }], '/mis-tickets')

        await screen.findByText(/TKT-USADO/)
        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    })

    it('detalle de ticket consulta al titular sin editar su identidad', async () => {
        prepararSesion(['USER'])
        server.use(
            http.get('http://localhost/api/tickets/TKT-8F2A1C', () => HttpResponse.json(ticket)),
            http.get('http://localhost/api/users/by-username', () => HttpResponse.json(usuario)),
        )
        renderConRutas([{ path: '/mis-tickets/:ticketCode', element: <DetalleTicketPage /> }], '/mis-tickets/TKT-8F2A1C')

        expect(await screen.findByText('Andrea Ruiz')).toBeInTheDocument()
        expect(screen.getByText(/TKT-8F2A1C/)).toBeInTheDocument()
    })
})
