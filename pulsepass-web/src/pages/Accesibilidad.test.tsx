import { http, HttpResponse } from 'msw'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import LoginPage from './LoginPage'
import RegistroPage from './RegistroPage'
import EventosPage from './EventosPage'
import EventoDetallePage from './EventoDetallePage'
import MisEntradasPage from './MisEntradasPage'
import ValidacionIngresoPage from './ValidacionIngresoPage'
import AdminEventosPage from './AdminEventosPage'
import InicioPage from './InicioPage'
import { renderLayout } from '../test/render'
import { artista, evento, eventoResumen, sede, ticket } from '../test/fixtures'
import { prepararSesion } from '../test/sesion'
import { server } from '../test/server'
import { screen } from '@testing-library/react'

async function verificarAccesibilidad(container: HTMLElement) {
    const getContextOriginal = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { configurable: true, value: () => null })
    try {
        const resultado = await axe.run(container, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
            rules: { 'color-contrast': { enabled: false } },
        })
        expect(resultado.violations).toEqual([])
    } finally {
        Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { configurable: true, value: getContextOriginal })
    }
}

describe('QT-FE-011 accesibilidad estructural axe en pantallas principales', () => {
    it('inicio tiene landmarks y encabezados accesibles', async () => {
        server.use(
            http.get('http://localhost/api/events/published', () => HttpResponse.json([])),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([])),
        )
        const { container } = renderLayout([{ path: '/', element: <InicioPage /> }])
        await screen.findByRole('heading', { name: 'Descubre los mejores eventos' })
        await verificarAccesibilidad(container)
    })

    it('login tiene etiquetas, landmarks y controles accesibles', async () => {
        const { container } = renderLayout([{ path: '/', element: <LoginPage /> }])
        await screen.findByRole('heading', { name: 'Inicia sesión' })
        await verificarAccesibilidad(container)
    })

    it('registro tiene etiquetas y controles accesibles', async () => {
        const { container } = renderLayout([{ path: '/', element: <RegistroPage /> }])
        await screen.findByRole('heading', { name: 'Crea tu cuenta' })
        await verificarAccesibilidad(container)
    })

    it('cartelera con resultados tiene etiquetas, landmarks y enlaces accesibles', async () => {
        server.use(
            http.get('http://localhost/api/events/published', () => HttpResponse.json([eventoResumen])),
            http.get('http://localhost/api/events/CMF-2026', () => HttpResponse.json(evento)),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([artista])),
            http.get('http://localhost/api/venues/VEN-SMR-01', () => HttpResponse.json(sede)),
        )
        const { container } = renderLayout([{ path: '/', element: <EventosPage /> }])
        await screen.findByRole('link', { name: /Caribbean Music Fest 2026/i })
        await verificarAccesibilidad(container)
    })

    it('detalle de evento con datos cargados es accesible', async () => {
        server.use(
            http.get('http://localhost/api/events/CMF-2026', () => HttpResponse.json(evento)),
            http.get('http://localhost/api/venues/VEN-SMR-01', () => HttpResponse.json(sede)),
        )
        const { container } = renderLayout([{ path: '/eventos/:eventCode', element: <EventoDetallePage /> }], '/eventos/CMF-2026')
        await screen.findByRole('heading', { name: evento.name })
        await verificarAccesibilidad(container)
    })

    it('mis tickets de USER mantiene controles y datos etiquetados', async () => {
        prepararSesion(['USER'])
        server.use(http.get('http://localhost/api/tickets/by-user', () => HttpResponse.json([ticket])))
        const { container } = renderLayout([{ path: '/', element: <MisEntradasPage /> }])
        await screen.findByText(/TKT-8F2A1C/)
        await verificarAccesibilidad(container)
    })

    it('validación de STAFF y administración de ADMIN son accesibles', async () => {
        prepararSesion(['STAFF'])
        const staff = renderLayout([{ path: '/', element: <ValidacionIngresoPage /> }])
        await screen.findByRole('heading', { name: 'Validación de ingreso' })
        await verificarAccesibilidad(staff.container)
        staff.unmount()

        prepararSesion(['ADMIN'])
        const admin = renderLayout([{ path: '/', element: <AdminEventosPage /> }])
        await screen.findByRole('heading', { name: 'Administración de eventos' })
        await verificarAccesibilidad(admin.container)
        admin.unmount()
    })
})
