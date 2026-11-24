import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import Layout from './components/Layout'
import { AuthProvider } from './features/auth/AuthProvider'
import { RutaPorRol, RutaProtegida, SoloAnonimo } from './layouts/Guards'
import { RUTAS } from './lib/rutas'
import { ApiError } from './lib/http'
import InicioPage from './pages/InicioPage'
import ErrorRuta from './components/ErrorRuta'
import CargaInicial from './components/CargaInicial'
import VerificacionEdad from './components/VerificacionEdad'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
                if (failureCount >= 1 || !(error instanceof ApiError)) return false
                return error.status === 0 || error.status >= 500
            },
            retryDelay: 500,
        },
        mutations: { retry: false },
    },
})

const router = createBrowserRouter([
    {
        path: RUTAS.inicio,
        element: <AuthProvider><Layout /></AuthProvider>,
        HydrateFallback: CargaInicial,
        errorElement: <ErrorRuta />,
        children: [
            { index: true, element: <InicioPage /> },
            {
                path: RUTAS.eventos.slice(1),
                lazy: async () => ({ Component: (await import('./pages/EventosPage')).default }),
            },
            {
                path: `${RUTAS.eventos.slice(1)}/:eventCode`,
                lazy: async () => ({ Component: (await import('./pages/EventoDetallePage')).default }),
            },
            {
                element: <SoloAnonimo />,
                children: [
                    {
                        path: RUTAS.login.slice(1),
                        lazy: async () => ({ Component: (await import('./pages/LoginPage')).default }),
                    },
                    {
                        path: RUTAS.registro.slice(1),
                        lazy: async () => ({ Component: (await import('./pages/RegistroPage')).default }),
                    },
                ],
            },
            {
                element: <RutaProtegida />,
                children: [
                    {
                        path: RUTAS.cuenta.slice(1),
                        lazy: async () => ({ Component: (await import('./pages/CuentaPage')).default }),
                    },
                    {
                        element: <RutaPorRol roles={['USER']} />,
                        children: [
                            {
                                path: RUTAS.misTickets.slice(1),
                                lazy: async () => ({ Component: (await import('./pages/MisEntradasPage')).default }),
                            },
                            {
                                path: `${RUTAS.misTickets.slice(1)}/:ticketCode`,
                                lazy: async () => ({ Component: (await import('./pages/DetalleTicketPage')).default }),
                            },
                            {
                                path: 'compra/confirmacion/:ticketCode',
                                lazy: async () => ({ Component: (await import('./pages/ConfirmacionCompraPage')).default }),
                            },
                        ],
                    },
                    {
                        element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
                        children: [
                            {
                                path: RUTAS.staffValidacion.slice(1),
                                lazy: async () => ({ Component: (await import('./pages/ValidacionIngresoPage')).default }),
                            },
                            {
                                path: 'staff/eventos/:eventCode/tickets',
                                lazy: async () => ({ Component: (await import('./pages/TicketsPagadosEventoPage')).default }),
                            },
                        ],
                    },
                    {
                        element: <RutaPorRol roles={['ADMIN']} />,
                        children: [
                            {
                                path: RUTAS.adminEventos.slice(1),
                                lazy: async () => ({ Component: (await import('./pages/AdminEventosPage')).default }),
                            },
                            {
                                path: `${RUTAS.adminEventos.slice(1)}/nuevo`,
                                lazy: async () => ({ Component: (await import('./pages/AdminCrearEventoPage')).default }),
                            },
                            {
                                path: `${RUTAS.adminEventos.slice(1)}/:eventCode`,
                                lazy: async () => ({ Component: (await import('./pages/AdminGestionEventoPage')).default }),
                            },
                        ],
                    },
                ],
            },
            {
                path: RUTAS.sinPermisos.slice(1),
                lazy: async () => {
                    const page = await import('./pages/ErroresPage')
                    return { Component: page.SinPermisosPage }
                },
            },
            {
                path: RUTAS.artistas.slice(1),
                lazy: async () => {
                    const page = await import('./pages/ListaArtistasPage')
                    return { Component: page.default }
                },
            },
            {
                path: `${RUTAS.artistas.slice(1)}/:id`,
                lazy: async () => {
                    const page = await import('./pages/DetalleArtistaPage')
                    return { Component: page.default }
                },
            },
            {
                path: RUTAS.sedes.slice(1),
                lazy: async () => {
                    const page = await import('./pages/ListaSedesPage')
                    return { Component: page.default }
                },
            },
            {
                path: `${RUTAS.sedes.slice(1)}/:code`,
                lazy: async () => {
                    const page = await import('./pages/DetalleSedePage')
                    return { Component: page.default }
                },
            },
            {
                path: '*',
                lazy: async () => {
                    const page = await import('./pages/ErroresPage')
                    return { Component: page.NoEncontradaPage }
                },
            },
        ],
    },
])

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <VerificacionEdad>
                <RouterProvider router={router} />
            </VerificacionEdad>
        </QueryClientProvider>
    )
}
