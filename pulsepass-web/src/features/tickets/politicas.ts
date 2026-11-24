import type { EstadoTicket } from './api'

export function ticketPuedeCancelarse(estado: EstadoTicket): boolean {
    return estado === 'PAID'
}

export function ticketPuedeValidarse(estado: EstadoTicket): boolean {
    return estado === 'PAID'
}
