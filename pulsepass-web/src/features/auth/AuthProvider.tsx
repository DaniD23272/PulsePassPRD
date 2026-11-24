import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import {
    iniciarSesion as solicitarLogin,
    obtenerPerfilActual,
    type PerfilAutenticado,
    type Rol,
} from './api'
import { AuthContext } from './AuthContext'
import { registrarManejadorSesionExpirada } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { z } from 'zod'
import { reloj } from '../../lib/reloj'

const CLAVE_TOKEN = 'pulsepass.accessToken'
const CLAVE_EXPIRACION = 'pulsepass.accessTokenExpiresAt'

type EstadoSesion = {
    usuario: PerfilAutenticado | null
    token: string | null
    expiraEn: number | null
    cargando: boolean
}

const CredencialesGuardadasSchema = z.object({
    token: z.string().min(1),
    expiraEn: z.number().int().positive(),
})

function leerSesionInicial(): EstadoSesion {
    const credenciales = CredencialesGuardadasSchema.safeParse({
        token: window.sessionStorage.getItem(CLAVE_TOKEN),
        expiraEn: Number(window.sessionStorage.getItem(CLAVE_EXPIRACION)),
    })

    if (!credenciales.success || credenciales.data.expiraEn <= reloj.ahora()) {
        window.sessionStorage.removeItem(CLAVE_TOKEN)
        window.sessionStorage.removeItem(CLAVE_EXPIRACION)
        return { usuario: null, token: null, expiraEn: null, cargando: false }
    }

    return {
        usuario: null,
        token: credenciales.data.token,
        expiraEn: credenciales.data.expiraEn,
        cargando: true,
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [sesion, setSesion] = useState<EstadoSesion>(leerSesionInicial)
    const tokenInicial = useRef(sesion.token)
    const { usuario, token, cargando } = sesion

    const limpiarSesionLocal = useCallback(() => {
        window.sessionStorage.removeItem(CLAVE_TOKEN)
        window.sessionStorage.removeItem(CLAVE_EXPIRACION)
        queryClient.clear()
        setSesion({ usuario: null, token: null, expiraEn: null, cargando: false })
    }, [queryClient])

    const cerrarSesion = useCallback(() => {
        limpiarSesionLocal()
        navigate(RUTAS.inicio, { replace: true })
    }, [limpiarSesionLocal, navigate])

    const expirarSesion = useCallback(() => {
        limpiarSesionLocal()
        navigate(RUTAS.login, { replace: true, state: { motivo: 'expirada' } })
    }, [limpiarSesionLocal, navigate])

    useEffect(
        () => registrarManejadorSesionExpirada(expirarSesion),
        [expirarSesion],
    )

    useEffect(() => {
        // Solo restaura la sesión que existía al abrir la aplicación. El login
        // actualiza el perfil directamente y no necesita una segunda consulta.
        if (!token || token !== tokenInicial.current) return

        let activo = true
        void obtenerPerfilActual(token)
            .then((perfil) => {
                if (activo) {
                    setSesion((actual) => ({ ...actual, usuario: perfil }))
                }
            })
            .catch(() => {
                if (activo) expirarSesion()
            })
            .finally(() => {
                if (activo) {
                    setSesion((actual) => ({ ...actual, cargando: false }))
                }
            })

        return () => {
            activo = false
        }
    }, [token, expirarSesion])

    useEffect(() => {
        if (!token) return

        const temporizador = window.setTimeout(
            expirarSesion,
            Math.max(0, (sesion.expiraEn ?? reloj.ahora()) - reloj.ahora()),
        )

        return () => window.clearTimeout(temporizador)
    }, [token, sesion.expiraEn, expirarSesion])

    const iniciarSesion = useCallback(async (identifier: string, password: string) => {
        const respuesta = await solicitarLogin({ identifier, password })
        const expiracion = reloj.ahora() + respuesta.expiresIn * 1000
        window.sessionStorage.setItem(CLAVE_TOKEN, respuesta.accessToken)
        window.sessionStorage.setItem(CLAVE_EXPIRACION, String(expiracion))
        setSesion({ usuario: null, token: respuesta.accessToken, expiraEn: expiracion, cargando: true })

        try {
            const perfil = await obtenerPerfilActual(respuesta.accessToken)
            setSesion({ usuario: perfil, token: respuesta.accessToken, expiraEn: expiracion, cargando: false })
        } catch (error) {
            limpiarSesionLocal()
            throw error
        }
    }, [limpiarSesionLocal])

    const sesionPublica = useMemo(() => {
        if (cargando) return { estado: 'cargando' } as const
        if (usuario && token && sesion.expiraEn) {
            return { estado: 'autenticado', token, expiraEn: sesion.expiraEn, usuario } as const
        }
        return { estado: 'anonimo' } as const
    }, [cargando, usuario, token, sesion.expiraEn])

    const valor = useMemo(
        () => ({
            sesion: sesionPublica,
            usuario,
            token,
            cargando,
            iniciarSesion,
            cerrarSesion,
            tieneRol: (...roles: Rol[]) => Boolean(usuario?.roles.some((rol) => roles.includes(rol))),
        }),
        [sesionPublica, usuario, token, cargando, iniciarSesion, cerrarSesion],
    )

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
