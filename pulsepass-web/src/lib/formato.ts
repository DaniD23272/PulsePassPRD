export function formatearFechaEvento(fecha: string, incluirHora = false): string {
    const valor = new Date(fecha)
    if (Number.isNaN(valor.getTime())) return fecha
    return new Intl.DateTimeFormat('es-CO', incluirHora
        ? { dateStyle: 'medium', timeStyle: 'short' }
        : { dateStyle: 'medium' },
    ).format(valor)
}
