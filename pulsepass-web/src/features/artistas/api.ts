import { z } from 'zod'
import { getJson } from '../../lib/http'
import {
    ArtistaSchema,
    EventoResumenSchema,
    type Artista,
    type EventoResumen,
} from '../eventos/api'

const ListaArtistasSchema = z.array(ArtistaSchema)
const ListaEventosSchema = z.array(EventoResumenSchema)

export async function obtenerArtistasActivos(): Promise<Artista[]> {
    return ListaArtistasSchema.parse(await getJson('/api/artists/active'))
}

export async function obtenerArtista(id: number): Promise<Artista> {
    return ArtistaSchema.parse(await getJson(`/api/artists/${id}`))
}

export async function obtenerArtistaPorNombre(stageName: string): Promise<Artista> {
    const query = new URLSearchParams({ stageName })
    return ArtistaSchema.parse(
        await getJson(`/api/artists/by-stage-name?${query.toString()}`),
    )
}

export async function obtenerEventosPorArtista(stageName: string): Promise<EventoResumen[]> {
    const query = new URLSearchParams({ stageName })
    return ListaEventosSchema.parse(
        await getJson(`/api/events/by-artist?${query.toString()}`),
    )
}
