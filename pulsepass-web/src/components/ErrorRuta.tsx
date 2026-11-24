import { isRouteErrorResponse, Link, useRevalidator, useRouteError } from 'react-router'
import { RUTAS } from '../lib/rutas'

export default function ErrorRuta() {
    const error = useRouteError()
    const revalidator = useRevalidator()
    const noEncontrada = isRouteErrorResponse(error) && error.status === 404

    return (
        <main className="mx-auto grid min-h-[60vh] w-full max-w-3xl place-items-center px-4 py-12">
            <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900" role="alert">
                <h1 className="font-titulo text-3xl font-bold">{noEncontrada ? 'No encontramos esta página' : '¡Ups! Algo salió mal.'}</h1>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                    {noEncontrada ? 'Revisa la dirección o vuelve al inicio.' : 'Ocurrió un error inesperado. Inténtalo más tarde.'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        disabled={revalidator.state === 'loading'}
                        onClick={() => revalidator.revalidate()}
                        className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 font-bold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                        {revalidator.state === 'loading' ? 'Reintentando…' : 'Reintentar'}
                    </button>
                    <Link to={RUTAS.inicio} className="inline-flex min-h-11 items-center rounded-lg bg-marca-600 px-5 font-bold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2">
                        Volver al inicio
                    </Link>
                </div>
            </section>
        </main>
    )
}
