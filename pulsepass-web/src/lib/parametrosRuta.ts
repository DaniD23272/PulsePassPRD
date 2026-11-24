import { z } from 'zod'

const CodigoRutaSchema = z.string().trim().min(1).max(120)
const IdRutaSchema = z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive())

export function leerCodigoRuta(valor: string | undefined): string | undefined {
    const resultado = CodigoRutaSchema.safeParse(valor)
    return resultado.success ? resultado.data : undefined
}

export function leerIdRuta(valor: string | undefined): number | undefined {
    const resultado = IdRutaSchema.safeParse(valor)
    return resultado.success ? resultado.data : undefined
}
