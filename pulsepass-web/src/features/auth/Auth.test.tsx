import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from '../../pages/LoginPage'
import RegistroPage from '../../pages/RegistroPage'
import { RutaPorRol, RutaProtegida } from '../../layouts/Guards'
import { useAuth } from './AuthContext'
import { server } from '../../test/server'
import { renderConRutas, crearClientePrueba } from '../../test/render'
import { perfil, tokenPrueba, usuario } from '../../test/fixtures'
import { prepararSesion } from '../../test/sesion'
import { reloj } from '../../lib/reloj'
import { RegistroSchema } from './api'

function UbicacionActual() {
    const location = useLocation()
    return <output aria-label="Ubicación">{`${location.pathname}|${JSON.stringify(location.state ?? {})}`}</output>
}

function CerrarSesionDePrueba() {
    const queryClient = useQueryClient()
    const { cerrarSesion } = useAuth()
    useEffect(() => { queryClient.setQueryData(['dato-privado'], 'privado') }, [queryClient])
    return <button onClick={cerrarSesion}>Salir</button>
}

const usuarioDePrueba = {
    identifier: 'andrea',
    password: 'Password-segura-123',
}

describe('TEST-FE-AUTH: login, registro y guardas', () => {
    it('TEST-FE-AUTH-001 inicia sesión y vuelve a state.desde', async () => {
        const user = userEvent.setup()
        server.use(
            http.post('http://localhost/api/auth/login', () => HttpResponse.json({ accessToken: tokenPrueba, tokenType: 'Bearer', expiresIn: 900 })),
            http.get('http://localhost/api/auth/me', () => HttpResponse.json(perfil)),
        )
        const { router } = renderConRutas([
            { path: '/login', element: <LoginPage /> },
            { path: '/eventos/CMF-2026', element: <h1>Detalle protegido por destino</h1> },
        ], '/login', crearClientePrueba())
        await act(async () => { await router.navigate('/login', { state: { desde: '/eventos/CMF-2026' } }) })

        await user.type(screen.getByLabelText(/usuario o correo/i), usuarioDePrueba.identifier)
        await user.type(screen.getByLabelText('Contraseña'), usuarioDePrueba.password)
        await user.click(screen.getByRole('button', { name: /ingresar/i }))

        expect(await screen.findByRole('heading', { name: 'Detalle protegido por destino' })).toBeInTheDocument()
        expect(window.sessionStorage.getItem('pulsepass.accessToken')).toBe(tokenPrueba)
    })

    it('TEST-FE-AUTH-002 muestra mensaje genérico cuando el login responde 401', async () => {
        const user = userEvent.setup()
        server.use(http.post('http://localhost/api/auth/login', () => HttpResponse.json({
            timestamp: '2026-11-24', status: 401, error: 'Unauthorized', message: 'Unauthorized', details: {},
        }, { status: 401 })))
        renderConRutas([{ path: '/login', element: <LoginPage /> }], '/login')

        await user.type(screen.getByLabelText(/usuario o correo/i), 'incorrecto')
        await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
        await user.click(screen.getByRole('button', { name: /ingresar/i }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas.')
    })

    it('el login permite mostrar y volver a ocultar la contraseña', async () => {
        const user = userEvent.setup()
        renderConRutas([{ path: '/login', element: <LoginPage /> }], '/login')

        const password = screen.getByLabelText('Contraseña')
        expect(password).toHaveAttribute('type', 'password')
        await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
        expect(password).toHaveAttribute('type', 'text')
        await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
        expect(password).toHaveAttribute('type', 'password')
    })

    it('TEST-FE-AUTH-003 bloquea login vacío sin enviar HTTP', async () => {
        let solicitudes = 0
        server.use(http.post('http://localhost/api/auth/login', () => {
            solicitudes += 1
            return HttpResponse.json({ accessToken: tokenPrueba, tokenType: 'Bearer', expiresIn: 900 })
        }))
        renderConRutas([{ path: '/login', element: <LoginPage /> }], '/login')

        fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

        expect(await screen.findByText('Escribe tu usuario o correo.')).toBeInTheDocument()
        expect(await screen.findByText('Escribe tu contraseña.')).toBeInTheDocument()
        expect(solicitudes).toBe(0)
    })

    it('TEST-FE-AUTH-004 bloquea registro con contraseña corta sin enviar HTTP', async () => {
        const user = userEvent.setup()
        let solicitudes = 0
        server.use(http.post('http://localhost/api/users', () => {
            solicitudes += 1
            return HttpResponse.json(usuario, { status: 201 })
        }))
        renderConRutas([{ path: '/registro', element: <RegistroPage /> }], '/registro')

        await user.type(screen.getByLabelText('Nombres'), 'Andrea')
        await user.type(screen.getByLabelText('Apellidos'), 'Ruiz')
        await user.type(screen.getByLabelText(/nombre de usuario/i), 'andrea')
        await user.type(screen.getByLabelText(/correo electrónico/i), 'andrea@pulsepass.test')
        await user.type(screen.getByLabelText(/fecha de nacimiento/i), '1998-04-12')
        await user.type(screen.getByLabelText('Contraseña (mín. 12 caracteres)'), 'corta')
        await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

        expect(await screen.findByText('La contraseña debe tener al menos 12 caracteres.')).toBeInTheDocument()
        expect(solicitudes).toBe(0)
    })

    it('TEST-FE-AUTH-005 registra con éxito y redirige a login', async () => {
        const user = userEvent.setup()
        server.use(http.post('http://localhost/api/users', () => HttpResponse.json(usuario, { status: 201 })))
        renderConRutas([
            { path: '/registro', element: <RegistroPage /> },
            { path: '/login', element: <LoginPage /> },
        ], '/registro')

        await user.type(screen.getByLabelText('Nombres'), 'Andrea')
        await user.type(screen.getByLabelText('Apellidos'), 'Ruiz')
        await user.type(screen.getByLabelText(/nombre de usuario/i), 'andrea')
        await user.type(screen.getByLabelText(/correo electrónico/i), 'andrea@pulsepass.test')
        await user.type(screen.getByLabelText(/fecha de nacimiento/i), '1998-04-12')
        await user.type(screen.getByLabelText('Contraseña (mín. 12 caracteres)'), 'Password-segura-123')
        await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

        expect(await screen.findByRole('heading', { name: /inicia sesión/i })).toBeInTheDocument()
        expect(screen.getByText(/cuenta creada/i)).toBeInTheDocument()
    })

    it('TEST-FE-AUTH-006 muestra conflicto de registro sin datos internos', async () => {
        const user = userEvent.setup()
        server.use(http.post('http://localhost/api/users', () => HttpResponse.json({
            timestamp: '2026-11-24', status: 409, error: 'Conflict', message: 'username exists: andrea', details: {},
        }, { status: 409 })))
        renderConRutas([{ path: '/registro', element: <RegistroPage /> }], '/registro')

        await user.type(screen.getByLabelText('Nombres'), 'Andrea')
        await user.type(screen.getByLabelText('Apellidos'), 'Ruiz')
        await user.type(screen.getByLabelText(/nombre de usuario/i), 'andrea')
        await user.type(screen.getByLabelText(/correo electrónico/i), 'andrea@pulsepass.test')
        await user.type(screen.getByLabelText(/fecha de nacimiento/i), '1998-04-12')
        await user.type(screen.getByLabelText('Contraseña (mín. 12 caracteres)'), 'Password-segura-123')
        await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

        expect(await screen.findByRole('alert')).toHaveTextContent('El usuario o correo ya está registrado.')
        expect(screen.queryByText(/username exists/i)).not.toBeInTheDocument()
    })

    it('TEST-FE-AUTH-007 redirige anónimos a login y conserva state.desde', async () => {
        renderConRutas([
            { element: <RutaProtegida />, children: [{ path: '/cuenta', element: <h1>Mi cuenta</h1> }] },
            { path: '/login', element: <UbicacionActual /> },
        ], '/cuenta')

        expect(await screen.findByLabelText('Ubicación')).toHaveTextContent('/login|{"desde":"/cuenta"}')
    })

    it('TEST-FE-AUTH-008 redirige USER que intenta entrar en admin a /403', async () => {
        prepararSesion(['USER'])
        renderConRutas([
            { element: <RutaProtegida />, children: [{ element: <RutaPorRol roles={['ADMIN']} />, children: [{ path: '/admin', element: <h1>Admin</h1> }] }] },
            { path: '/403', element: <h1>Sin permisos</h1> },
        ], '/admin')

        expect(await screen.findByRole('heading', { name: 'Sin permisos' })).toBeInTheDocument()
    })

    it('TEST-FE-AUTH-009 permite a ADMIN abrir la sección de administración', async () => {
        prepararSesion(['ADMIN'])
        renderConRutas([
            { element: <RutaProtegida />, children: [{ element: <RutaPorRol roles={['ADMIN']} />, children: [{ path: '/admin', element: <h1>Panel admin</h1> }] }] },
        ], '/admin')

        expect(await screen.findByRole('heading', { name: 'Panel admin' })).toBeInTheDocument()
    })

    it('TEST-FE-AUTH-010 cerrar sesión elimina token y caché', async () => {
        const user = userEvent.setup()
        prepararSesion(['USER'])
        const queryClient = crearClientePrueba()
        queryClient.setQueryData(['privado'], 'privado')
        renderConRutas([
            { path: '/cuenta', element: <CerrarSesionDePrueba /> },
            { path: '/', element: <h1>Sesión cerrada</h1> },
        ], '/cuenta', queryClient)
        await screen.findByRole('button', { name: 'Salir' })

        await user.click(screen.getByRole('button', { name: 'Salir' }))
        await waitFor(() => expect(window.sessionStorage.getItem('pulsepass.accessToken')).toBeNull())
        expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    })

    it('TEST-FE-AUTH-011 descarta token expirado al restaurar sesión', async () => {
        window.sessionStorage.setItem('pulsepass.accessToken', tokenPrueba)
        window.sessionStorage.setItem('pulsepass.accessTokenExpiresAt', String(reloj.ahora() - 1000))
        renderConRutas([
            { element: <RutaProtegida />, children: [{ path: '/cuenta', element: <h1>Mi cuenta</h1> }] },
            { path: '/login', element: <UbicacionActual /> },
        ], '/cuenta')

        expect(await screen.findByLabelText('Ubicación')).toHaveTextContent('/login|{"desde":"/cuenta"}')
        expect(window.sessionStorage.getItem('pulsepass.accessToken')).toBeNull()
    })

    it('TEST-FE-AUTH-012 conserva el aviso al expirar un login durante /me', async () => {
        const user = userEvent.setup()
        server.use(
            http.post('http://localhost/api/auth/login', () => HttpResponse.json({ accessToken: tokenPrueba, tokenType: 'Bearer', expiresIn: 900 })),
            http.get('http://localhost/api/auth/me', () => HttpResponse.json({
                timestamp: '2026-11-24', status: 401, error: 'Unauthorized', message: 'Unauthorized', details: {},
            }, { status: 401 })),
        )
        renderConRutas([{ path: '/login', element: <LoginPage /> }], '/login')

        await user.type(screen.getByLabelText(/usuario o correo/i), usuarioDePrueba.identifier)
        await user.type(screen.getByLabelText('Contraseña'), usuarioDePrueba.password)
        await user.click(screen.getByRole('button', { name: /ingresar/i }))

        expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
        expect(window.sessionStorage.getItem('pulsepass.accessToken')).toBeNull()
    })

    it('valida la fecha de nacimiento usando la fecha inyectada', () => {
        const fechaHoy = vi.spyOn(reloj, 'fechaHoyISO').mockReturnValue('2026-11-24')
        try {
            const resultado = RegistroSchema.safeParse({
                username: 'andrea',
                email: 'andrea@pulsepass.test',
                firstName: 'Andrea',
                lastName: 'Ruiz',
                birthDate: '2026-11-25',
                password: 'Password-segura-123',
            })
            expect(resultado.success).toBe(false)
            if (!resultado.success) expect(resultado.error.issues[0]?.message).toBe('La fecha de nacimiento no puede estar en el futuro.')
        } finally {
            fechaHoy.mockRestore()
        }
    })

    it('muestra los campos en el orden del PRD y permite revelar la contraseña', async () => {
        const user = userEvent.setup()
        const { container } = renderConRutas([{ path: '/registro', element: <RegistroPage /> }], '/registro')

        const etiquetas = Array.from(container.querySelectorAll('form label')).map((etiqueta) => (etiqueta as HTMLLabelElement).htmlFor)
        expect(etiquetas).toEqual(['username', 'email', 'firstName', 'lastName', 'birthDate', 'password'])

        const password = screen.getByLabelText('Contraseña (mín. 12 caracteres)')
        await user.type(password, 'Password-segura-123')
        expect(screen.getByRole('meter', { name: 'Fortaleza de la contraseña' })).toHaveAttribute('aria-valuetext', 'Alta')
        const revelar = screen.getByRole('button', { name: 'Mostrar contraseña' })
        await user.click(revelar)
        expect(password).toHaveAttribute('type', 'text')
        expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText('Entre 12 caracteres y 72 bytes.')).toBeInTheDocument()
    })

    it('rechaza contraseñas que superan 72 bytes UTF-8', () => {
        const resultado = RegistroSchema.safeParse({
            username: 'andrea',
            email: 'andrea@pulsepass.test',
            firstName: 'Andrea',
            lastName: 'Ruiz',
            birthDate: '1998-04-12',
            password: 'é'.repeat(37),
        })
        expect(resultado.success).toBe(false)
        if (!resultado.success) expect(resultado.error.issues.some((issue) => issue.message === 'La contraseña no puede superar 72 bytes UTF-8.')).toBe(true)
    })

    it('calcula el día actual en la zona horaria de Colombia', () => {
        const ahora = vi.spyOn(reloj, 'ahora').mockReturnValue(Date.parse('2026-11-24T02:00:00.000Z'))
        try {
            expect(reloj.fechaHoyISO()).toBe('2026-11-23')
        } finally {
            ahora.mockRestore()
        }
    })
})
