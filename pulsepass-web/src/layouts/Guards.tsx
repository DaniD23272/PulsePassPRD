import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../features/auth/AuthContext'
import type { Rol } from '../features/auth/api'
import { RUTAS } from '../lib/rutas'

function CargandoSesion() {
    return (
        <p className="w-full py-12 text-center" role="status" aria-live="polite">
            Cargando sesión…
        </p>
    )
}

export function RutaProtegida() {
    const { sesion } = useAuth()
    const location = useLocation()

    if (sesion.estado === 'cargando') return <CargandoSesion />
    if (sesion.estado === 'anonimo') {
        return (
            <Navigate
                to={RUTAS.login}
                replace
                state={{ desde: `${location.pathname}${location.search}${location.hash}` }}
            />
        )
    }

    return <Outlet />
}

export function RutaPorRol({ roles }: { roles: readonly Rol[] }) {
    const { sesion } = useAuth()

    if (sesion.estado === 'cargando') return <CargandoSesion />
    if (sesion.estado === 'anonimo') return <Navigate to={RUTAS.login} replace />
    if (!roles.some((rol) => sesion.usuario.roles.includes(rol))) {
        return <Navigate to={RUTAS.sinPermisos} replace />
    }

    return <Outlet />
}

export function SoloAnonimo() {
    const { sesion } = useAuth()

    if (sesion.estado === 'cargando') return <CargandoSesion />
    if (sesion.estado === 'autenticado') return <Navigate to={RUTAS.inicio} replace />

    return <Outlet />
}
