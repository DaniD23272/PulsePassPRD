import { z } from 'zod'
import { getJson } from '../../lib/http'

const CategoriaEventoSchema = z.enum([
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

const EventoResumenSchema = z.object({
    id: z.number().int(),
    eventCode: z.string().min(1),
    name: z.string().min(1),
    category: CategoriaEventoSchema,
    status: EstadoEventoSchema,
    eventDate: z.string().min(1),
})

const ListaEventosSchema = z.array(EventoResumenSchema)

export type EventoResumen = z.infer<typeof EventoResumenSchema>
export type CategoriaEvento = z.infer<typeof CategoriaEventoSchema>
export type EstadoEvento = z.infer<typeof EstadoEventoSchema>

export async function obtenerEventosPublicados(): Promise<EventoResumen[]> {
    const payload = await getJson('/api/events/published')
    return ListaEventosSchema.parse(payload)
}