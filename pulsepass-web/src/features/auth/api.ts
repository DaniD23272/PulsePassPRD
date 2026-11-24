import { z } from 'zod'
import { getJson, postJson } from '../../lib/http'
import { UsuarioSchema, type Usuario } from '../usuarios/api'
import { reloj } from '../../lib/reloj'

const RespuestaLoginSchema = z.object({
    accessToken: z.string().min(1),
    tokenType: z.literal('Bearer'),
    expiresIn: z.number().int().positive(),
})

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])

const PerfilSchema = z.object({
    id: z.number().int(),
    username: z.string(),
    email: z.string().email(),
    roles: z.array(RolSchema),
})

export const RegistroSchema = z.object({
    username: z.string().trim().min(1, 'Escribe un nombre de usuario.'),
    email: z.string().trim().email('Escribe un correo válido.'),
    firstName: z.string().trim().min(1, 'Escribe tu nombre.'),
    lastName: z.string().trim().min(1, 'Escribe tu apellido.'),
    birthDate: z.string().date('Selecciona una fecha válida.').refine(
        (value) => value <= reloj.fechaHoyISO(),
        'La fecha de nacimiento no puede estar en el futuro.',
    ),
    password: z.string()
        .min(12, 'La contraseña debe tener al menos 12 caracteres.')
        .refine((value) => new TextEncoder().encode(value).length <= 72, 'La contraseña no puede superar 72 bytes UTF-8.'),
})

export type PerfilAutenticado = z.infer<typeof PerfilSchema>
export type Rol = z.infer<typeof RolSchema>
export type DatosRegistro = z.infer<typeof RegistroSchema>
export type DatosLogin = { identifier: string; password: string }

export async function iniciarSesion(datos: DatosLogin) {
    const payload = await postJson('/api/auth/login', datos)
    return RespuestaLoginSchema.parse(payload)
}

export async function obtenerPerfilActual(token: string): Promise<PerfilAutenticado> {
    const payload = await getJson('/api/auth/me', token)
    return PerfilSchema.parse(payload)
}

export async function registrarUsuario(datos: DatosRegistro): Promise<Usuario> {
    return UsuarioSchema.parse(await postJson('/api/users', datos))
}
