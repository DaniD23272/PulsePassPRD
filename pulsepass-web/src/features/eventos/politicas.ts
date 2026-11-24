import type { Rol } from '../auth/api'
import type { Artista, EstadoEvento } from './api'

export function rolPuedeComprarEntrada(roles: readonly Rol[] | undefined): boolean {
    return Boolean(roles?.includes('USER') && !roles.includes('STAFF') && !roles.includes('ADMIN'))
}

export function eventoAceptaCompras(estado: EstadoEvento): boolean {
    return estado === 'PUBLISHED'
}

export function eventoPermiteAsociarArtistas(estado: EstadoEvento): boolean {
    return estado !== 'CANCELLED' && estado !== 'FINISHED'
}

export function artistasNoAsociados(activos: readonly Artista[], asociados: readonly Artista[]): Artista[] {
    const idsAsociados = new Set(asociados.map((artista) => artista.id))
    return activos.filter((artista) => !idsAsociados.has(artista.id))
}
