import { useQuery } from '@tanstack/react-query'
import { obtenerSede, obtenerSedesActivas } from './api'

export function useSedesActivas() {
    return useQuery({
        queryKey: ['sedes', 'activas'],
        queryFn: obtenerSedesActivas,
        staleTime: 5 * 60_000,
    })
}

export function useSede(code: string) {
    return useQuery({
        queryKey: ['sede', code],
        queryFn: () => obtenerSede(code),
        enabled: Boolean(code),
        staleTime: 5 * 60_000,
    })
}
