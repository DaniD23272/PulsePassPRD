import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import Layout from './components/Layout'
import InicioPage from './pages/InicioPage'
import { RUTAS } from './lib/rutas'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
    },
  },
})

function ErrorDeRuta() {
  return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
        <section role="alert" className="max-w-lg text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-marca-600">
            PulsePass
          </p>
          <h1 className="mt-3 font-titulo text-3xl font-bold">
            No pudimos cargar esta página
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Intenta volver al inicio.
          </p>
          <a
              href={RUTAS.inicio}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-marca-600 px-5 py-2 font-bold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Ir al inicio
          </a>
        </section>
      </main>
  )
}

function PaginaNoEncontrada() {
  return (
      <section className="grid w-full place-items-center py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-marca-600">
          Error 404
        </p>
        <h1 className="mt-3 font-titulo text-3xl font-bold">
          Esta página no existe
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Revisa la dirección o vuelve al inicio.
        </p>
      </section>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorDeRuta />,
    children: [
      {
        index: true,
        element: <InicioPage />,
      },
      {
        path: RUTAS.eventos.slice(1),
        lazy: async () => ({
          Component: (await import('./pages/EventosPage')).default,
        }),
      },
      {
        path: '*',
        element: <PaginaNoEncontrada />,
      },
    ],
  },
])

export default function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
  )
}