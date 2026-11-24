import { createContext, useContext } from 'react'
import type { PerfilAutenticado, Rol } from './api'

export type ContextoAutenticacion = {
    sesion: Sesion
    usuario: PerfilAutenticado | null
    token: string | null
    cargando: boolean
    iniciarSesion: (identifier: string, password: string) => Promise<void>
    cerrarSesion: () => void
    tieneRol: (...roles: Rol[]) => boolean
}

export type Sesion =
    | { estado: 'cargando' }
    | { estado: 'anonimo' }
    | { estado: 'autenticado'; token: string; expiraEn: number; usuario: PerfilAutenticado }

export const AuthContext = createContext<ContextoAutenticacion | null>(null)

export function useAuth(): ContextoAutenticacion {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de AuthProvider.')
    }
    return contexto
}
