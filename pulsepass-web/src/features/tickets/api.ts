import { z } from 'zod'
import { getJson, patchJson, postJson } from '../../lib/http'

export const TipoTicketSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
const EstadoTicketSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])

const TicketSchema = z.object({
    id: z.number().int(),
    ticketCode: z.string().min(1),
    type: TipoTicketSchema,
    price: z.number(),
    status: EstadoTicketSchema,
    purchaseDate: z.string(),
    userEmail: z.string().email(),
    eventCode: z.string(),
    eventName: z.string(),
})

const ListaTicketsSchema = z.array(TicketSchema)

export type Ticket = z.infer<typeof TicketSchema>
export type TipoTicket = z.infer<typeof TipoTicketSchema>
export type EstadoTicket = z.infer<typeof EstadoTicketSchema>

export async function comprarTicket(datos: {
    userEmail: string
    eventCode: string
    type: TipoTicket
}, token: string): Promise<Ticket> {
    const payload = await postJson('/api/tickets', datos, token)
    return TicketSchema.parse(payload)
}

export async function obtenerMisTickets(email: string, token: string): Promise<Ticket[]> {
    const params = new URLSearchParams({ email })
    const payload = await getJson(`/api/tickets/by-user?${params.toString()}`, token)
    return ListaTicketsSchema.parse(payload)
}

export async function obtenerTicket(ticketCode: string, token: string): Promise<Ticket> {
    const payload = await getJson(`/api/tickets/${encodeURIComponent(ticketCode)}`, token)
    return TicketSchema.parse(payload)
}

export async function cancelarTicket(ticketCode: string, token: string): Promise<Ticket> {
    const payload = await patchJson(`/api/tickets/${encodeURIComponent(ticketCode)}/cancel`, token)
    return TicketSchema.parse(payload)
}

export async function obtenerTicketsPagadosDeEvento(eventCode: string, token: string): Promise<Ticket[]> {
    const payload = await getJson(`/api/events/${encodeURIComponent(eventCode)}/tickets/paid`, token)
    return ListaTicketsSchema.parse(payload)
}

export async function marcarTicketComoUsado(ticketCode: string, token: string): Promise<Ticket> {
    const payload = await patchJson(`/api/tickets/${encodeURIComponent(ticketCode)}/use`, token)
    return TicketSchema.parse(payload)
}

export function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(precio)
}

