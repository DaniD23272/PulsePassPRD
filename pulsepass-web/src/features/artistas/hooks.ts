import { useQuery } from '@tanstack/react-query'
import {
    obtenerArtista,
    obtenerArtistaPorNombre,
    obtenerArtistasActivos,
    obtenerEventosPorArtista,
} from './api'

export function useArtistasActivos(enabled = true) {
    return useQuery({
        queryKey: ['artistas', 'activos'],
        queryFn: obtenerArtistasActivos,
        enabled,
        staleTime: 5 * 60_000,
    })
}

export function useArtista(id: number, enabled = true) {
    return useQuery({
        queryKey: ['artista', id],
        queryFn: () => obtenerArtista(id),
        enabled,
        staleTime: 5 * 60_000,
    })
}

export function useArtistaPorNombre(stageName: string | undefined) {
    return useQuery({
        queryKey: ['artista', 'nombre', stageName],
        queryFn: () => obtenerArtistaPorNombre(stageName ?? ''),
        enabled: Boolean(stageName),
        staleTime: 5 * 60_000,
    })
}

export function useEventosDeArtista(stageName: string | undefined) {
    return useQuery({
        queryKey: ['eventos', 'artista', stageName],
        queryFn: () => obtenerEventosPorArtista(stageName ?? ''),
        enabled: Boolean(stageName),
        staleTime: 60_000,
    })
}
