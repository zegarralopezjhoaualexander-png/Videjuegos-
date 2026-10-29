import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchJuegos } from '../api/juegos.js'
import { useAuth } from '../auth/useAuth.js'
import { inputClasses } from './formStyles.js'

const SKELETON_ITEMS = Array.from({ length: 6 }, (_, index) => index)

function formatScore(score) {
  if (score === null) {
    return 'Sin puntuar'
  }

  return `${Number.isInteger(score) ? score : score.toFixed(1)}/10`
}

function getInitials(title) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

function JuegoCard({ juego }) {
  const [imageError, setImageError] = useState(false)
  const showImage = Boolean(juego.imagen) && !imageError

  return (
    <Link
      to={`/juego/${encodeURIComponent(juego.id)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-linear-to-br from-indigo-500/30 via-slate-900 to-fuchsia-500/30">
        {showImage ? (
          <img
            src={juego.imagen}
            alt={`Portada de ${juego.titulo}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-black tracking-widest text-white/70">
            {getInitials(juego.titulo)}
          </div>
        )}

        <span className="absolute top-3 right-3 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
          {formatScore(juego.puntuacion)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="line-clamp-2 text-base font-semibold text-white">
          {juego.titulo}
        </h2>

        <div className="mt-auto flex flex-wrap gap-1.5">
          <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200">
            {juego.genero || 'Sin género'}
          </span>
          <span className="rounded-full border border-white/10 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300">
            {juego.plataforma || 'Sin plataforma'}
          </span>
        </div>
      </div>
    </Link>
  )
}

function Catalogo() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [juegos, setJuegos] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [genero, setGenero] = useState('todos')
  const [reloadKey, setReloadKey] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchJuegos({ signal: controller.signal })
      .then((data) => {
        if (!active) {
          return
        }

        setJuegos(data)
        setStatus('ready')
      })
      .catch((requestError) => {
        if (!active || requestError.name === 'AbortError') {
          return
        }

        setError(
          requestError.message ||
            'Ocurrió un error al cargar el catálogo de juegos.',
        )
        setStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [reloadKey])

  const generos = useMemo(() => {
    const unique = new Set(
      juegos
        .map((juego) => juego.genero)
        .filter((value) => value && value !== 'Sin género'),
    )

    return [...unique].sort((first, second) =>
      first.localeCompare(second, 'es'),
    )
  }, [juegos])

  const filteredJuegos = useMemo(() => {
    const term = search.trim().toLowerCase()

    return juegos.filter((juego) => {
      if (genero !== 'todos' && juego.genero !== genero) {
        return false
      }

      if (!term) {
        return true
      }

      return [juego.titulo, juego.genero, juego.plataforma].some((value) =>
        value.toLowerCase().includes(term),
      )
    })
  }, [juegos, search, genero])

  const handleRetry = () => {
    setStatus('loading')
    setError('')
    setReloadKey((current) => current + 1)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/catalogo"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-xs font-black text-white">
              VJ
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
                Videojuegos
              </p>
              <p className="text-xs text-slate-400">Catálogo</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">Sesión iniciada</p>
              <p className="max-w-[220px] truncate text-sm text-slate-300">
                {user?.nombre || 'Jugador'}
              </p>
              {user?.rol && (
                <p className="text-[10px] font-semibold tracking-wide text-indigo-300 uppercase">
                  {user.rol}
                </p>
              )}
            </div>
            {user?.rol === 'ADMIN' && (
              <Link
                to="/admin"
                className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:border-indigo-400/50 hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Administrar
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Catálogo
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Explora tu próximo juego
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Busca por título, género o plataforma y encuentra tu próxima
              aventura.
            </p>
          </div>

          {status === 'ready' && (
            <p className="text-sm text-slate-400">
              {filteredJuegos.length} de {juegos.length} juegos
            </p>
          )}
        </div>

        <section
          aria-label="Filtros del catálogo"
          className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:grid-cols-[1fr_240px]"
        >
          <div>
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Buscar
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Título, género o plataforma..."
              className={inputClasses(false)}
            />
          </div>

          <div>
            <label
              htmlFor="genero"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Género
            </label>
            <select
              id="genero"
              value={genero}
              onChange={(event) => setGenero(event.target.value)}
              className={inputClasses(false)}
            >
              <option value="todos">Todos los géneros</option>
              {generos.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        {status === 'loading' && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SKELETON_ITEMS.map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-video w-full bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center"
          >
            <h2 className="text-lg font-semibold text-rose-100">
              No pudimos cargar el catálogo
            </h2>
            <p className="mt-2 text-sm text-rose-200">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === 'ready' && filteredJuegos.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">
              No encontramos juegos
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Prueba con otro término de búsqueda o cambia el filtro de género.
            </p>
          </div>
        )}

        {status === 'ready' && filteredJuegos.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJuegos.map((juego, index) => (
              <JuegoCard
                key={juego.id || `${juego.titulo}-${index}`}
                juego={juego}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Catalogo
