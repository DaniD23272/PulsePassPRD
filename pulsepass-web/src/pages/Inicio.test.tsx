import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import InicioPage from './InicioPage'
import { renderConRutas } from '../test/render'
import { server } from '../test/server'
import { artista } from '../test/fixtures'

describe('Inicio', () => {
    it('muestra el inicio y sus estados vacíos con respuestas correctas', async () => {
        server.use(
            http.get('http://localhost/api/events/published', () => HttpResponse.json([])),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([])),
        )
        renderConRutas([{ path: '/', element: <InicioPage /> }])

        expect(await screen.findByRole('heading', { name: 'Descubre los mejores eventos' })).toBeInTheDocument()
        expect(await screen.findByText('Aún no hay eventos publicados')).toBeInTheDocument()
        expect(await screen.findByText('Aún no hay artistas activos.')).toBeInTheDocument()
    })

    it('muestra un mensaje recuperable cuando falla la consulta de eventos', async () => {
        server.use(
            http.get('http://localhost/api/events/published', () => HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })),
            http.get('http://localhost/api/artists/active', () => HttpResponse.json([artista])),
        )
        renderConRutas([{ path: '/', element: <InicioPage /> }])

        expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los eventos.')
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    })
})
