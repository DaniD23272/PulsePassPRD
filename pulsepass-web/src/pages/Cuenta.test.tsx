import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import CuentaPage from './CuentaPage'
import { renderConRutas } from '../test/render'
import { prepararSesion } from '../test/sesion'
import { server } from '../test/server'
import { usuario } from '../test/fixtures'

describe('Cuenta', () => {
    it('muestra el perfil del usuario autenticado', async () => {
        prepararSesion(['USER'])
        server.use(http.get('http://localhost/api/users/by-email', () => HttpResponse.json(usuario)))
        renderConRutas([{ path: '/', element: <CuentaPage /> }])

        expect(await screen.findByRole('heading', { name: 'Andrea Ruiz' })).toBeInTheDocument()
        expect(screen.getByText('USER')).toHaveClass('rounded-full')
        expect(screen.getByText('Activa')).toHaveClass('rounded-full')
        expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    })

    it('muestra un error recuperable si falla la consulta del perfil', async () => {
        prepararSesion(['USER'])
        server.use(http.get('http://localhost/api/users/by-email', () => HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })))
        renderConRutas([{ path: '/', element: <CuentaPage /> }])

        expect(await screen.findByRole('heading', { name: 'No pudimos cargar tu cuenta' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    })
})
