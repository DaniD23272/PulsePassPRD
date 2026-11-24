import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    cancelarTicket,
    comprarTicket,
    marcarTicketComoUsado,
    obtenerMisTickets,
    obtenerTicket,
    obtenerTicketsPagadosDeEvento,
    type TipoTicket,
} from './api'

export const ticketKeys = {
    usuario: (email: string) => ['tickets', 'usuario', email] as const,
    detalle: (code: string) => ['ticket', code] as const,
    pagados: (eventCode: string) => ['tickets', 'pagados', eventCode] as const,
}

export function useMisTickets(email: string, token: string) {
    return useQuery({
        queryKey: ticketKeys.usuario(email),
        queryFn: () => obtenerMisTickets(email, token),
        enabled: Boolean(email && token),
        staleTime: 15_000,
    })
}

export function useTicket(ticketCode: string, token: string) {
    return useQuery({
        queryKey: ticketKeys.detalle(ticketCode),
        queryFn: () => obtenerTicket(ticketCode, token),
        enabled: Boolean(ticketCode && token),
        staleTime: 15_000,
    })
}

export function useTicketsPagadosPorEvento(eventCode: string, token: string) {
    return useQuery({
        queryKey: ticketKeys.pagados(eventCode),
        queryFn: () => obtenerTicketsPagadosDeEvento(eventCode, token),
        enabled: Boolean(eventCode && token),
        staleTime: 15_000,
    })
}

export function useComprarTicket(email: string, eventCode: string, token: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (type: TipoTicket) => comprarTicket({ userEmail: email, eventCode, type }, token),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ticketKeys.usuario(email) }),
                queryClient.invalidateQueries({ queryKey: ['evento', eventCode] }),
            ])
        },
    })
}

export function useCancelarTicket(email: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ ticketCode, token }: { ticketCode: string; token: string }) => cancelarTicket(ticketCode, token),
        onSuccess: async (ticket) => {
            await Promise.all([
                queryClient.setQueryData(ticketKeys.detalle(ticket.ticketCode), ticket),
                queryClient.invalidateQueries({ queryKey: ticketKeys.usuario(email) }),
                queryClient.invalidateQueries({ queryKey: ticketKeys.pagados(ticket.eventCode) }),
            ])
        },
    })
}

export function useUsarTicket() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ ticketCode, token }: { ticketCode: string; token: string }) => marcarTicketComoUsado(ticketCode, token),
        onSuccess: async (ticket) => {
            await Promise.all([
                queryClient.setQueryData(ticketKeys.detalle(ticket.ticketCode), ticket),
                queryClient.invalidateQueries({ queryKey: ticketKeys.pagados(ticket.eventCode) }),
            ])
        },
    })
}
