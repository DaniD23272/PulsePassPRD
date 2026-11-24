import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider, type RouteObject } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider'
import Layout from '../components/Layout'
import CargaInicial from '../components/CargaInicial'

export function crearClientePrueba() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    })
}

export function renderConRutas(rutas: RouteObject[], rutaInicial = '/', queryClient = crearClientePrueba()) {
    const router = createMemoryRouter([
        {
            element: <AuthProvider><Outlet /></AuthProvider>,
            HydrateFallback: CargaInicial,
            children: rutas,
        },
    ], { initialEntries: [rutaInicial] })
    const resultado = render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    return { ...resultado, router, queryClient }
}

export function renderLayout(rutas: RouteObject[], rutaInicial = '/', queryClient = crearClientePrueba()) {
    const router = createMemoryRouter([
        {
            element: <AuthProvider><Layout /></AuthProvider>,
            HydrateFallback: CargaInicial,
            children: rutas,
        },
    ], { initialEntries: [rutaInicial] })
    const resultado = render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    )
    return { ...resultado, router, queryClient }
}
