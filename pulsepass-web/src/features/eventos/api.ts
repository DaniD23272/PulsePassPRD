import { z } from 'zod'
import { getJson, patchJson, postEmpty, postJson } from '../../lib/http'

export const CategoriaEventoSchema = z.enum([
    'MUSIC',
    'SPORTS',
    'TECHNOLOGY',
    'EDUCATION',
    'CULTURE',
    'ENTERTAINMENT',
])

const EstadoEventoSchema = z.enum([
    'DRAFT',
    'PUBLISHED',
    'SOLD_OUT',
    'CANCELLED',
    'FINISHED',
])

export const EventoResumenSchema = z.object({
    id: z.number().int(),
    eventCode: z.string().min(1),
    name: z.string().min(1),
    category: CategoriaEventoSchema,
    status: EstadoEventoSchema,
    eventDate: z.string().min(1),
})

export const ArtistaSchema = z.object({
    id: z.number().int(),
    stageName: z.string(),
    country: z.string(),
    genre: z.string(),
    active: z.boolean(),
})

export const VenueSchema = z.object({
    id: z.number().int(),
    code: z.string().min(1),
    name: z.string().min(1),
    city: z.string(),
    address: z.string(),
    capacity: z.number().int(),
    active: z.boolean(),
})

const EventoSchema = EventoResumenSchema.extend({
    description: z.string().nullable(),
    minimumAge: z.number().int().nullable(),
    venueCode: z.string(),
    venueName: z.string(),
    artists: z.array(ArtistaSchema),
})

const ListaEventosSchema = z.array(EventoResumenSchema)

export type EventoResumen = z.infer<typeof EventoResumenSchema>
export type Evento = z.infer<typeof EventoSchema>
export type CategoriaEvento = z.infer<typeof CategoriaEventoSchema>
export type EstadoEvento = z.infer<typeof EstadoEventoSchema>
export type Artista = z.infer<typeof ArtistaSchema>
export type Venue = z.infer<typeof VenueSchema>

export const CATEGORIAS_EVENTO = CategoriaEventoSchema.options

export async function obtenerEventosPublicados(): Promise<EventoResumen[]> {
    const payload = await getJson('/api/events/published')
    return ListaEventosSchema.parse(payload)
}

export async function obtenerEventosPorArtista(stageName: string): Promise<EventoResumen[]> {
    const params = new URLSearchParams({ stageName })
    const payload = await getJson(`/api/events/by-artist?${params.toString()}`)
    return ListaEventosSchema.parse(payload)
}

export async function obtenerEvento(eventCode: string, token?: string): Promise<Evento> {
    const payload = await getJson(`/api/events/${encodeURIComponent(eventCode)}`, token)
    return EventoSchema.parse(payload)
}

export async function obtenerArtistasActivos(): Promise<Artista[]> {
    const payload = await getJson('/api/artists/active')
    return z.array(ArtistaSchema).parse(payload)
}

export async function obtenerVenuesActivos(): Promise<Venue[]> {
    const payload = await getJson('/api/venues/active')
    return z.array(VenueSchema).parse(payload)
}

export type DatosCrearEvento = {
    eventCode: string
    name: string
    description: string | null
    category: CategoriaEvento
    eventDate: string
    minimumAge: number
    venueCode: string
}

export async function crearEvento(datos: DatosCrearEvento, token: string): Promise<Evento> {
    const payload = await postJson('/api/events', datos, token)
    return EventoSchema.parse(payload)
}

export async function asociarArtista(
    eventCode: string,
    artistId: number,
    token: string,
): Promise<Evento> {
    const payload = await postEmpty(
        `/api/events/${encodeURIComponent(eventCode)}/artists/${artistId}`,
        token,
    )
    return EventoSchema.parse(payload)
}

export async function publicarEvento(eventCode: string, token: string): Promise<Evento> {
    const payload = await patchJson(
        `/api/events/${encodeURIComponent(eventCode)}/publish`,
        token,
    )
    return EventoSchema.parse(payload)
}
