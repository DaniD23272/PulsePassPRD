export const RUTAS = {
    inicio: '/',
    eventos: '/eventos',
    evento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
    artistas: '/artistas',
    artista: (id: number | string) => `/artistas/${encodeURIComponent(String(id))}`,
    sedes: '/sedes',
    sede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
    login: '/login',
    registro: '/registro',
    cuenta: '/cuenta',
    misTickets: '/mis-tickets',
    ticket: (ticketCode: string) => `/mis-tickets/${encodeURIComponent(ticketCode)}`,
    confirmacionCompra: (ticketCode: string) =>
        `/compra/confirmacion/${encodeURIComponent(ticketCode)}`,
    staffValidacion: '/staff/validacion',
    staffTickets: (eventCode: string) =>
        `/staff/eventos/${encodeURIComponent(eventCode)}/tickets`,
    adminEventos: '/admin/eventos',
    adminNuevoEvento: '/admin/eventos/nuevo',
    adminEvento: (eventCode: string) =>
        `/admin/eventos/${encodeURIComponent(eventCode)}`,
    sinPermisos: '/403',
} as const
