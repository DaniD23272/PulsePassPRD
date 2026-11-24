import { z } from 'zod'
import { getJson } from '../../lib/http'
import { VenueSchema, type Venue } from '../eventos/api'

const ListaSedesSchema = z.array(VenueSchema)

export async function obtenerSedesActivas(): Promise<Venue[]> {
    return ListaSedesSchema.parse(await getJson('/api/venues/active'))
}

export async function obtenerSede(code: string): Promise<Venue> {
    return VenueSchema.parse(await getJson(`/api/venues/${encodeURIComponent(code)}`))
}
