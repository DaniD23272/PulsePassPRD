import type { Evento } from './api'

const eventosCreados: Evento[] = []

export function agregarEventoCreado(evento: Evento): void {
    const indice = eventosCreados.findIndex((item) => item.eventCode === evento.eventCode)
    if (indice >= 0) eventosCreados[indice] = evento
    else eventosCreados.unshift(evento)
}

export function leerEventosCreados(): readonly Evento[] {
    return eventosCreados
}
