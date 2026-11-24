export const reloj = {
    ahora: () => Date.now(),
    fechaHoyISO: () => {
        const partes = new Intl.DateTimeFormat('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(new Date(reloj.ahora()))
        const valor = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((parte) => parte.type === tipo)?.value ?? ''
        return `${valor('year')}-${valor('month')}-${valor('day')}`
    },
}
