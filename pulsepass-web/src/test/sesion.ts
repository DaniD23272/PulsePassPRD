import { http, HttpResponse } from 'msw'
import { perfil, tokenPrueba } from './fixtures'
import { server } from './server'
import { reloj } from '../lib/reloj'

export function prepararSesion(roles: string[] = ['USER']) {
    window.sessionStorage.setItem('pulsepass.accessToken', tokenPrueba)
    window.sessionStorage.setItem('pulsepass.accessTokenExpiresAt', String(reloj.ahora() + 600_000))
    server.use(
        http.get('http://localhost/api/auth/me', () =>
            HttpResponse.json({ ...perfil, roles }),
        ),
    )
}
