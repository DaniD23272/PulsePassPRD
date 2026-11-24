import { z } from 'zod'
import { getJson } from '../../lib/http'

export const UsuarioSchema = z.object({
    id: z.number().int(),
    username: z.string().min(1),
    email: z.string().email(),
    active: z.boolean(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().nullable(),
    city: z.string().nullable(),
    birthDate: z.string().date(),
})

export type Usuario = z.infer<typeof UsuarioSchema>

export async function obtenerUsuarioPorEmail(email: string, token: string): Promise<Usuario> {
    const query = new URLSearchParams({ email })
    return UsuarioSchema.parse(await getJson(`/api/users/by-email?${query.toString()}`, token))
}

export async function obtenerUsuarioPorUsername(username: string, token: string): Promise<Usuario> {
    const query = new URLSearchParams({ username })
    return UsuarioSchema.parse(await getJson(`/api/users/by-username?${query.toString()}`, token))
}
