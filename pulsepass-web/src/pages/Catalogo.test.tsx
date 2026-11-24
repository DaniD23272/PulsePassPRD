import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import { artista, evento, eventoResumen, sede } from '../test/fixtures'
import { renderConRutas } from '../test/render'
import { prepararSesion } from '../test/sesion'
import EventosPage from './EventosPage'
import EventoDetallePage from './EventoDetallePage'
import ListaArtistasPage from './ListaArtistasPage'
import DetalleArtistaPage from './DetalleArtistaPage'
import ListaSedesPage from './ListaSedesPage'
import DetalleSedePage from './DetalleSedePage'

const urls = {
    eventos: 'http://localhost/api/events/published',
    evento: 'http://localhost/api/events/CMF-2026',
    artistas: 'http://localhost/api/artists/active',
    sedes: 'http://localhost/api/venues/active',
    sede: `http://localhost/api/venues/${sede.code}`,
}

describe('TEST-FE-EVT / ART / VEN: cartelera, artistas y sedes', () => {
    it('TEST-FE-EVT-001 lista los eventos publicados', async () => {
        server.use(
            http.get(urls.eventos, () => HttpResponse.json([eventoResumen])),
            http.get(urls.evento, () => HttpResponse.json(evento)),
            http.get(urls.artistas, () => HttpResponse.json([artista])),
            http.get(urls.sede, () => HttpResponse.json(sede)),
        )
        renderConRutas([{ path: '/eventos', element: <EventosPage /> }], '/eventos')

        const tarjeta = await screen.findByRole('link', { name: /Caribbean Music Fest 2026/i })
        expect(tarjeta).toBeInTheDocument()
        expect(tarjeta).toHaveTextContent('MUSIC')
        expect(tarjeta).toHaveTextContent('PUBLISHED')
    })

    it('TEST-FE-EVT-002 muestra estado vacío si no hay eventos', async () => {
        server.use(
            http.get(urls.eventos, () => HttpResponse.json([])),
            http.get(urls.artistas, () => HttpResponse.json([])),
        )
        renderConRutas([{ path: '/eventos', element: <EventosPage /> }], '/eventos')

        expect(await screen.findByText('Aún no hay eventos publicados')).toBeInTheDocument()
    })

    it('TEST-FE-EVT-003 actualiza la URL al filtrar por texto y categoría', async () => {
        const user = userEvent.setup()
        server.use(
            http.get(urls.eventos, () => HttpResponse.json([eventoResumen])),
            http.get(urls.artistas, () => HttpResponse.json([artista])),
            http.get(urls.evento, () => HttpResponse.json(evento)),
            http.get(urls.sede, () => HttpResponse.json(sede)),
        )
        const { router } = renderConRutas([{ path: '/eventos', element: <EventosPage /> }], '/eventos')

        await user.type(await screen.findByLabelText('Buscar por nombre'), 'Caribbean')
        await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
        await waitFor(() => expect(router.state.location.search).toContain('q=Caribbean'))
        expect(router.state.location.search).toContain('categoria=MUSIC')
    })

    it('TEST-FE-EVT-004 muestra detalle, artista y sede', async () => {
        server.use(
            http.get(urls.evento, () => HttpResponse.json(evento)),
            http.get(urls.sede, () => HttpResponse.json(sede)),
        )
        renderConRutas([{ path: '/eventos/:eventCode', element: <EventoDetallePage /> }], '/eventos/CMF-2026')

        expect(await screen.findByRole('heading', { name: evento.name })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: artista.stageName })).toBeInTheDocument()
        expect(await screen.findByRole('link', { name: new RegExp(sede.name) })).toBeInTheDocument()
    })

    it('TEST-FE-EVT-005 convierte 404 en “Evento no disponible”', async () => {
        server.use(http.get(urls.evento, () => HttpResponse.json({
            timestamp: '2026-11-24', status: 404, error: 'Not Found', message: 'No existe', details: {},
        }, { status: 404 })))
        renderConRutas([{ path: '/eventos/:eventCode', element: <EventoDetallePage /> }], '/eventos/CMF-2026')

        expect(await screen.findByRole('heading', { name: 'Evento no disponible' })).toBeInTheDocument()
    })

    it('rechaza un código de evento inválido de la URL sin consultar la API', async () => {
        let consultas = 0
        server.use(http.get('http://localhost/api/events/:eventCode', () => {
            consultas += 1
            return HttpResponse.json(evento)
        }))
        renderConRutas([{ path: '/eventos/:eventCode', element: <EventoDetallePage /> }], '/eventos/%20%20')

        expect(await screen.findByText('El código del evento no es válido.')).toBeInTheDocument()
        expect(consultas).toBe(0)
    })

    it('TEST-FE-EVT-006 deshabilita la compra de un evento SOLD_OUT', async () => {
        prepararSesion(['USER'])
        server.use(
            http.get(urls.evento, () => HttpResponse.json({ ...evento, status: 'SOLD_OUT' })),
            http.get(urls.sede, () => HttpResponse.json(sede)),
        )
        renderConRutas([{ path: '/eventos/:eventCode', element: <EventoDetallePage /> }], '/eventos/CMF-2026')

        expect(await screen.findByRole('button', { name: 'Compra no disponible' })).toBeDisabled()
    })

    it('STAFF con rol USER base no recibe panel ni acción de compra', async () => {
        prepararSesion(['USER', 'STAFF'])
        server.use(
            http.get(urls.evento, () => HttpResponse.json(evento)),
            http.get(urls.sede, () => HttpResponse.json(sede)),
        )
        renderConRutas([{ path: '/eventos/:eventCode', element: <EventoDetallePage /> }], '/eventos/CMF-2026')

        expect(await screen.findByRole('heading', { name: evento.name })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Entradas' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Comprar entrada' })).not.toBeInTheDocument()
    })

    it('TEST-FE-ART-001 muestra artistas activos', async () => {
        server.use(http.get(urls.artistas, () => HttpResponse.json([artista])))
        renderConRutas([{ path: '/artistas', element: <ListaArtistasPage /> }], '/artistas')

        expect(await screen.findByRole('link', { name: /Solar Beat/i })).toBeInTheDocument()
    })

    it('TEST-FE-ART-002 muestra artista y eventos asociados', async () => {
        server.use(
            http.get('http://localhost/api/artists/1', () => HttpResponse.json(artista)),
            http.get('http://localhost/api/events/by-artist', () => HttpResponse.json([eventoResumen])),
            http.get(urls.evento, () => HttpResponse.json(evento)),
            http.get(urls.sede, () => HttpResponse.json(sede)),
        )
        renderConRutas([{ path: '/artistas/:id', element: <DetalleArtistaPage /> }], '/artistas/1')

        expect(await screen.findByRole('heading', { name: 'Solar Beat' })).toBeInTheDocument()
        expect(await screen.findByRole('link', { name: /Caribbean Music Fest 2026/i })).toBeInTheDocument()
    })

    it('TEST-FE-ART-003 id no numérico muestra 404 sin consultar API', async () => {
        let consultas = 0
        server.use(http.get('http://localhost/api/artists/:id', () => {
            consultas += 1
            return HttpResponse.json(artista)
        }))
        renderConRutas([{ path: '/artistas/:id', element: <DetalleArtistaPage /> }], '/artistas/no-es-numero')

        expect(await screen.findByRole('heading', { name: 'Artista no encontrado' })).toBeInTheDocument()
        expect(consultas).toBe(0)
    })

    it('TEST-FE-VEN-001 lista sedes activas y abre su detalle', async () => {
        server.use(
            http.get(urls.sedes, () => HttpResponse.json([sede])),
            http.get(urls.sede, () => HttpResponse.json(sede)),
        )
        const { router } = renderConRutas([
            { path: '/sedes', element: <ListaSedesPage /> },
            { path: '/sedes/:code', element: <DetalleSedePage /> },
        ], '/sedes')

        await userEvent.setup().click(await screen.findByRole('link', { name: /Marina Convention Center/i }))
        await waitFor(() => expect(router.state.location.pathname).toBe('/sedes/VEN-SMR-01'))
        expect(await screen.findByRole('heading', { name: 'Marina Convention Center' })).toBeInTheDocument()
    })
})
