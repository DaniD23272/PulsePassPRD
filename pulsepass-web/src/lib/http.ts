import { z } from 'zod'

const ErrorResponseSchema = z.object({
    timestamp: z.string().optional(),
    status: z.number().int(),
    error: z.string().optional(),
    message: z.string(),
    details: z.record(z.string(), z.string()).default({}),
})

let manejadorSesionExpirada: (() => void) | undefined

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? ''

function resolverUrlApi(path: string): string {
    if (!API_BASE_URL) return path
    if (API_BASE_URL === '/api' && path.startsWith('/api/')) return path
    if (API_BASE_URL.endsWith('/api') && path.startsWith('/api/')) {
        return `${API_BASE_URL.slice(0, -4)}${path}`
    }
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function registrarManejadorSesionExpirada(manejador: () => void): () => void {
    manejadorSesionExpirada = manejador
    return () => {
        if (manejadorSesionExpirada === manejador) manejadorSesionExpirada = undefined
    }
}

export class ApiError extends Error {
    readonly details: Record<string, string>
    readonly status: number

    constructor(status: number, message: string, details: Record<string, string> = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status
        this.details = details;
    }
}

async function requestJson(
    path: string,
    init: RequestInit,
    accessToken?: string,
): Promise<unknown> {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (init.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
    }

    let response: Response
    try {
        response = await fetch(resolverUrlApi(path), { ...init, headers })
    } catch {
        throw new ApiError(0, 'No pudimos conectar con el servidor.')
    }

    let payload: unknown = null;

    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const error = ErrorResponseSchema.safeParse(payload)
        const mensaje = error.success
            ? error.data.message
            : 'No fue posible completar la solicitud.'

        if (response.status === 401 && accessToken) manejadorSesionExpirada?.()

        throw new ApiError(response.status, mensaje, error.success ? error.data.details : {})
    }

    return payload;
}

export function getJson(path: string, accessToken?: string): Promise<unknown> {
    return requestJson(path, { method: 'GET' }, accessToken)
}

export function postJson(
    path: string,
    body: unknown,
    accessToken?: string,
): Promise<unknown> {
    return requestJson(
        path,
        { method: 'POST', body: JSON.stringify(body) },
        accessToken,
    )
}

export function postEmpty(path: string, accessToken?: string): Promise<unknown> {
    return requestJson(path, { method: 'POST' }, accessToken)
}

export function patchJson(
    path: string,
    accessToken?: string,
): Promise<unknown> {
    return requestJson(path, { method: 'PATCH' }, accessToken)
}
