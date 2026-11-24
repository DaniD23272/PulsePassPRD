import { useQuery } from '@tanstack/react-query'
import { obtenerUsuarioPorEmail, obtenerUsuarioPorUsername } from './api'

export function useUsuarioPorEmail(email: string | undefined, token: string | null) {
    return useQuery({
        queryKey: ['usuario', email],
        queryFn: () => obtenerUsuarioPorEmail(email ?? '', token ?? ''),
        enabled: Boolean(email && token),
        staleTime: 60_000,
    })
}

export function useUsuarioPorUsername(username: string | undefined, token: string | null) {
    return useQuery({
        queryKey: ['usuario', 'username', username],
        queryFn: () => obtenerUsuarioPorUsername(username ?? '', token ?? ''),
        enabled: Boolean(username && token),
        staleTime: 60_000,
    })
}
