import { reloj } from './reloj'

export const EDAD_MINIMA_PULSEPASS = 16

export function cumpleEdadMinima(
    fechaNacimiento: string,
    edadMinima = EDAD_MINIMA_PULSEPASS,
    fechaReferencia = reloj.fechaHoyISO(),
): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento) || fechaNacimiento > fechaReferencia) return false

    const nacimiento = new Date(`${fechaNacimiento}T00:00:00.000Z`)
    if (Number.isNaN(nacimiento.getTime()) || nacimiento.toISOString().slice(0, 10) !== fechaNacimiento) return false

    const [anio, mes, dia] = fechaNacimiento.split('-').map(Number)
    const [anioRef, mesRef, diaRef] = fechaReferencia.split('-').map(Number)
    const edad = anioRef - anio - Number(mesRef < mes || (mesRef === mes && diaRef < dia))
    return edad >= edadMinima
}
