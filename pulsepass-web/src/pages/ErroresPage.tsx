import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

function ErrorPage({ codigo, titulo, mensaje }: { codigo: string; titulo: string; mensaje: string }) {
    return (
        <section className="mx-auto grid w-full max-w-3xl place-items-center py-12">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-titulo text-5xl font-bold text-marca-600 dark:text-indigo-300">{codigo}</p>
                <h1 className="mt-3 font-titulo text-2xl font-bold">{titulo}</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{mensaje}</p>
                <Link to={RUTAS.inicio} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-marca-600 px-5 font-bold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600">
                    Volver al inicio
                </Link>
            </div>
        </section>
    )
}

export function SinPermisosPage() {
    return <ErrorPage codigo="403" titulo="Sin permisos" mensaje="No tienes permisos para acceder a esta sección." />
}

export function NoEncontradaPage() {
    return <ErrorPage codigo="404" titulo="No encontramos esta página" mensaje="Revisa la dirección o vuelve al inicio." />
}

