import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ErrorRuta from '../components/ErrorRuta'
import { renderConRutas, renderLayout } from '../test/render'
import { prepararSesion } from '../test/sesion'
import { NoEncontradaPage } from './ErroresPage'

describe('TEST-FE-GEN: errores, navegación y accesibilidad', () => {
    it('TEST-FE-GEN-001 muestra 404 para una ruta inexistente', () => {
        renderConRutas([{ path: '*', element: <NoEncontradaPage /> }], '/ruta-que-no-existe')
        expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeInTheDocument()
        expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('TEST-FE-GEN-002 muestra un error seguro sin filtrar el error interno', async () => {
        renderConRutas([{
            path: '/rota',
            loader: () => { throw new Error('stack secreto de la aplicación') },
            element: <p>Contenido</p>,
            errorElement: <ErrorRuta />,
        }], '/rota')

        expect(await screen.findByRole('heading', { name: '¡Ups! Algo salió mal.' })).toBeInTheDocument()
        expect(screen.queryByText(/stack secreto/)).not.toBeInTheDocument()
    })

    it('TEST-FE-GEN-003 adapta los enlaces del navbar al rol de sesión', async () => {
        const { container: anonimo } = renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
        const navAnonimo = anonimo.querySelector('nav[aria-label="Principal"]')
        expect(within(navAnonimo as HTMLElement).getByRole('link', { name: 'Eventos' })).toBeInTheDocument()
        expect(within(navAnonimo as HTMLElement).queryByRole('link', { name: 'Inicio' })).not.toBeInTheDocument()
        expect(within(anonimo).getByRole('link', { name: 'PulsePass' })).toHaveAttribute('href', '/')
        expect(within(navAnonimo as HTMLElement).getByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
        expect(within(navAnonimo as HTMLElement).getByRole('link', { name: 'Registrarse' })).toBeInTheDocument()

        prepararSesion(['USER'])
        const { container: usuario } = renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
        const navUsuario = usuario.querySelector('nav[aria-label="Principal"]')
        expect(await within(navUsuario as HTMLElement).findAllByRole('link', { name: 'Mis tickets' })).toHaveLength(1)
        expect(navUsuario?.querySelector('summary[aria-label^="Menú de cuenta"]')).toBeInTheDocument()
        expect(within(navUsuario as HTMLElement).queryByRole('link', { name: 'Validar ingreso' })).not.toBeInTheDocument()

        prepararSesion(['STAFF'])
        const { container: staff } = renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
        const navStaff = staff.querySelector('nav[aria-label="Principal"]')
        expect(await within(navStaff as HTMLElement).findByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
        expect(within(navStaff as HTMLElement).queryByRole('link', { name: 'Administrar eventos' })).not.toBeInTheDocument()

        prepararSesion(['USER', 'STAFF'])
        const { container: staffConRolBase } = renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
        const navStaffConRolBase = staffConRolBase.querySelector('nav[aria-label="Principal"]')
        expect(await within(navStaffConRolBase as HTMLElement).findByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
        expect(navStaffConRolBase?.querySelector(':scope > a[href="/mis-tickets"]')).not.toBeInTheDocument()

        prepararSesion(['ADMIN'])
        const { container: admin } = renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
        const navAdmin = admin.querySelector('nav[aria-label="Principal"]')
        expect(await within(navAdmin as HTMLElement).findByRole('link', { name: 'Administrar eventos' })).toBeInTheDocument()

        prepararSesion(['USER', 'ADMIN'])
        const { container: adminConRolBase } = renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
        const navAdminConRolBase = adminConRolBase.querySelector('nav[aria-label="Principal"]')
        expect(await within(navAdminConRolBase as HTMLElement).findByRole('link', { name: 'Administrar eventos' })).toBeInTheDocument()
        expect(navAdminConRolBase?.querySelector(':scope > a[href="/mis-tickets"]')).not.toBeInTheDocument()
    })

    it('TEST-FE-GEN-004 abre el menú móvil y lo cierra con Escape y con navegación', async () => {
        const user = userEvent.setup()
        renderLayout([
            { path: '/', element: <h1>Inicio</h1> },
            { path: '/eventos', element: <h1>Cartelera</h1> },
        ])
        const boton = screen.getByRole('button', { name: 'Abrir menú' })

        await user.click(boton)
        expect(boton).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getAllByRole('navigation', { name: 'Principal' })).toHaveLength(2)
        fireEvent.keyDown(document, { key: 'Escape' })
        await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false'))

        await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
        const menus = screen.getAllByRole('navigation', { name: 'Principal' })
        await user.click(within(menus[1]).getByRole('link', { name: 'Eventos' }))
        expect(await screen.findByRole('heading', { name: 'Cartelera' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
    })

    it('permite alternar el tema oscuro con el teclado', async () => {
        const user = userEvent.setup()
        renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
        const botonTema = screen.getByRole('button', { name: 'Activar modo oscuro' })
        botonTema.focus()
        await user.keyboard('{Enter}')
        await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
        expect(screen.getByRole('button', { name: 'Activar modo claro' })).toHaveAttribute('aria-pressed', 'true')
        document.documentElement.classList.remove('dark')
    })

    it('inicializa el tema según prefers-color-scheme', () => {
        const originalMatchMedia = window.matchMedia
        const consultaOscura = Object.assign(new EventTarget(), {
            matches: true,
            media: '(prefers-color-scheme: dark)',
            onchange: null,
        }) as MediaQueryList
        window.matchMedia = vi.fn(() => consultaOscura)
        try {
            renderLayout([{ path: '/', element: <h1>Inicio</h1> }])
            expect(screen.getByRole('button', { name: 'Activar modo claro' })).toHaveAttribute('aria-pressed', 'true')
        } finally {
            window.matchMedia = originalMatchMedia
        }
    })
})
