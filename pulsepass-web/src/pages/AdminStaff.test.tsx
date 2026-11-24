import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import { artista, evento, sede, ticket } from '../test/fixtures'
import { renderConRutas } from '../test/render'
import { prepararSesion } from '../test/sesion'
import AdminCrearEventoPage from './AdminCrearEventoPage'
import AdminGestionEventoPage from './AdminGestionEventoPage'
import ValidacionIngresoPage from './ValidacionIngresoPage'
import TicketsPagadosEventoPage from './TicketsPagadosEventoPage'

const eventoBorrador = { ...evento, status: 'DRAFT' as const, artists: [] }
const crearUrl = 'http://localhost/api/events'

function renderAdminCreacion() {
    prepararSesion(['ADMIN'])
    server.use(http.get('http://localhost/api/venues/active', () => HttpResponse.json([sede])))
    return renderConRutas([
        { path: '/admin/eventos/nuevo', element: <AdminCrearEventoPage /> },
        { path: '/admin/eventos/:eventCode', element: <h1>Gestión del evento</h1> },
    ], '/admin/eventos/nuevo')
}

async function llenarEvento(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Código del evento'), 'E2E-NUEVO-01')
    await user.type(screen.getByLabelText('Nombre'), 'Evento de prueba')
    await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
    await user.type(screen.getByLabelText('Fecha y hora'), '2027-06-20T20:30')
    await user.clear(screen.getByLabelText('Edad mínima'))
    await user.type(screen.getByLabelText('Edad mínima'), '18')
    await user.selectOptions(screen.getByLabelText('Sede'), sede.code)
    await user.type(screen.getByLabelText('Descripción'), 'Descripción de prueba')
}

describe('TEST-FE-STF: validación de ingreso y tickets pagados', () => {
    it('TEST-FE-STF-001 busca y marca un ticket pagado como usado', async () => {
        prepararSesion(['STAFF'])
        server.use(
            http.get(`http://localhost/api/tickets/${ticket.ticketCode}`, () => HttpResponse.json(ticket)),
            http.patch(`http://localhost/api/tickets/${ticket.ticketCode}/use`, () => HttpResponse.json({ ...ticket, status: 'USED' })),
        )
        const user = userEvent.setup()
        renderConRutas([{ path: '/staff/validar', element: <ValidacionIngresoPage /> }], '/staff/validar')

        await user.type(screen.getByLabelText('Código de ticket'), ticket.ticketCode)
        await user.click(screen.getByRole('button', { name: 'Buscar' }))
        await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))

        expect(await screen.findByRole('status')).toHaveTextContent('Ingreso registrado. El ticket quedó como USED.')
        expect(screen.getByLabelText('Código de ticket')).toHaveValue('')
        expect(screen.getByLabelText('Código de ticket')).toHaveFocus()
    })

    it('TEST-FE-STF-002 muestra el conflicto al intentar usar el ticket por segunda vez', async () => {
        prepararSesion(['STAFF'])
        server.use(
            http.get(`http://localhost/api/tickets/${ticket.ticketCode}`, () => HttpResponse.json(ticket)),
            http.patch(`http://localhost/api/tickets/${ticket.ticketCode}/use`, () => HttpResponse.json({
                timestamp: '2026-11-24', status: 409, error: 'Conflict', message: 'El ticket ya fue usado.', details: {},
            }, { status: 409 })),
        )
        const user = userEvent.setup()
        renderConRutas([{ path: '/staff/validar', element: <ValidacionIngresoPage /> }], '/staff/validar')

        await user.type(screen.getByLabelText('Código de ticket'), ticket.ticketCode)
        await user.click(screen.getByRole('button', { name: 'Buscar' }))
        await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('El ticket ya fue usado.')
    })

    it('TEST-FE-STF-003 informa cuando el código de ticket no existe', async () => {
        prepararSesion(['STAFF'])
        server.use(http.get('http://localhost/api/tickets/NO-EXISTE', () => HttpResponse.json({
            timestamp: '2026-11-24', status: 404, error: 'Not Found', message: 'No existe', details: {},
        }, { status: 404 })))
        const user = userEvent.setup()
        renderConRutas([{ path: '/staff/validar', element: <ValidacionIngresoPage /> }], '/staff/validar')

        await user.type(screen.getByLabelText('Código de ticket'), 'NO-EXISTE')
        await user.click(screen.getByRole('button', { name: 'Buscar' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Ticket no encontrado.')
    })

    it('TEST-FE-STF-004 muestra una tabla con los tickets pagados del evento', async () => {
        prepararSesion(['STAFF'])
        server.use(
            http.get(`http://localhost/api/events/${evento.eventCode}`, () => HttpResponse.json(evento)),
            http.get(`http://localhost/api/events/${evento.eventCode}/tickets/paid`, () => HttpResponse.json([ticket])),
        )
        renderConRutas([{ path: '/staff/eventos/:eventCode/tickets', element: <TicketsPagadosEventoPage /> }], `/staff/eventos/${evento.eventCode}/tickets`)

        const tabla = await screen.findByRole('table', { name: `Tickets pagados del evento ${evento.eventCode}` })
        expect(within(tabla).getByRole('row', { name: new RegExp(ticket.ticketCode) })).toBeInTheDocument()
        expect(within(tabla).getByText(ticket.userEmail)).toBeInTheDocument()
    })
})

describe('TEST-FE-ADM: creación y gestión de eventos', () => {
    it('TEST-FE-ADM-001 valida campos vacíos sin enviar la petición', async () => {
        let solicitudes = 0
        server.use(http.post(crearUrl, () => { solicitudes += 1; return HttpResponse.json(eventoBorrador, { status: 201 }) }))
        const user = userEvent.setup()
        renderAdminCreacion()

        await user.click(await screen.findByRole('button', { name: 'Crear evento' }))

        expect(await screen.findByText('Escribe el código del evento.')).toBeInTheDocument()
        expect(screen.getByText('Escribe el nombre del evento.')).toBeInTheDocument()
        expect(solicitudes).toBe(0)
    })

    it('TEST-FE-ADM-002 crea un borrador y abre su pantalla de gestión', async () => {
        server.use(http.post(crearUrl, () => HttpResponse.json(eventoBorrador, { status: 201 })))
        const user = userEvent.setup()
        const { router } = renderAdminCreacion()
        await llenarEvento(user)
        await user.click(await screen.findByRole('button', { name: 'Crear evento' }))

        expect(await screen.findByRole('heading', { name: 'Gestión del evento' })).toBeInTheDocument()
        expect(router.state.location.pathname).toBe(`/admin/eventos/${eventoBorrador.eventCode}`)
    })

    it('TEST-FE-ADM-003 coloca errores 400 del servidor junto a sus campos', async () => {
        server.use(http.post(crearUrl, () => HttpResponse.json({
            timestamp: '2026-11-24', status: 400, error: 'Bad Request', message: 'Validation failed',
            details: { name: 'El nombre ya está en uso.' },
        }, { status: 400 })))
        const user = userEvent.setup()
        renderAdminCreacion()
        await llenarEvento(user)
        await user.click(await screen.findByRole('button', { name: 'Crear evento' }))

        expect(await screen.findByText('El nombre ya está en uso.')).toBeInTheDocument()
    })

    it('TEST-FE-ADM-004 publica el borrador y muestra el estado actualizado', async () => {
        prepararSesion(['ADMIN'])
        let publicado = false
        server.use(
            http.get(`http://localhost/api/events/${evento.eventCode}`, () => HttpResponse.json({ ...eventoBorrador, status: publicado ? 'PUBLISHED' : 'DRAFT' })),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([])),
            http.patch(`http://localhost/api/events/${evento.eventCode}/publish`, () => {
                publicado = true
                return HttpResponse.json({ ...eventoBorrador, status: 'PUBLISHED' })
            }),
        )
        const user = userEvent.setup()
        renderConRutas([{ path: '/admin/eventos/:eventCode', element: <AdminGestionEventoPage /> }], `/admin/eventos/${evento.eventCode}`)

        await user.click(await screen.findByRole('button', { name: 'Publicar evento' }))
        await user.click(screen.getByRole('button', { name: 'Confirmar publicación' }))

        expect(await screen.findAllByText('PUBLISHED')).toHaveLength(2)
        expect(await screen.findByText('El evento está publicado.')).toBeInTheDocument()
    })

    it('TEST-FE-ADM-005 deja visible el error 409 dentro del diálogo de publicación', async () => {
        prepararSesion(['ADMIN'])
        server.use(
            http.get(`http://localhost/api/events/${evento.eventCode}`, () => HttpResponse.json(eventoBorrador)),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([])),
            http.patch(`http://localhost/api/events/${evento.eventCode}/publish`, () => HttpResponse.json({
                timestamp: '2026-11-24', status: 409, error: 'Conflict', message: 'El evento ya no se puede publicar.', details: {},
            }, { status: 409 })),
        )
        const user = userEvent.setup()
        renderConRutas([{ path: '/admin/eventos/:eventCode', element: <AdminGestionEventoPage /> }], `/admin/eventos/${evento.eventCode}`)

        await user.click(await screen.findByRole('button', { name: 'Publicar evento' }))
        await user.click(screen.getByRole('button', { name: 'Confirmar publicación' }))

        expect(await screen.findByRole('dialog')).toHaveTextContent('El evento ya no se puede publicar.')
    })

    it('TEST-FE-ADM-006 asocia un artista y lo muestra en la lista', async () => {
        prepararSesion(['ADMIN'])
        let artistasAsociados: typeof evento.artists = []
        server.use(
            http.get(`http://localhost/api/events/${evento.eventCode}`, () => HttpResponse.json({ ...eventoBorrador, artists: artistasAsociados })),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([artista])),
            http.post(`http://localhost/api/events/${evento.eventCode}/artists/${artista.id}`, () => {
                artistasAsociados = [artista]
                return HttpResponse.json({ ...eventoBorrador, artists: artistasAsociados })
            }),
        )
        const user = userEvent.setup()
        renderConRutas([{ path: '/admin/eventos/:eventCode', element: <AdminGestionEventoPage /> }], `/admin/eventos/${evento.eventCode}`)

        await user.selectOptions(await screen.findByLabelText('Agregar artista'), String(artista.id))
        await user.click(screen.getByRole('button', { name: 'Asociar' }))

        expect(await screen.findByText(artista.stageName)).toBeInTheDocument()
    })

    it('muestra el conflicto cuando la API rechaza un artista duplicado', async () => {
        prepararSesion(['ADMIN'])
        server.use(
            http.get(`http://localhost/api/events/${evento.eventCode}`, () => HttpResponse.json(eventoBorrador)),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([artista])),
            http.post(`http://localhost/api/events/${evento.eventCode}/artists/${artista.id}`, () => HttpResponse.json({
                timestamp: '2026-11-24', status: 409, error: 'Conflict', message: 'El artista ya está asociado.', details: {},
            }, { status: 409 })),
        )
        const user = userEvent.setup()
        renderConRutas([{ path: '/admin/eventos/:eventCode', element: <AdminGestionEventoPage /> }], `/admin/eventos/${evento.eventCode}`)

        await user.selectOptions(await screen.findByLabelText('Agregar artista'), String(artista.id))
        await user.click(screen.getByRole('button', { name: 'Asociar' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('El artista ya está asociado.')
    })
})
