import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  actualizarJuego,
  crearJuego,
  eliminarJuego,
} from '../api/adminJuegos.js'
import { fetchJuegoById, fetchJuegos } from '../api/juegos.js'
import { useAuth } from '../auth/useAuth.js'
import AdminJuegoForm from './AdminJuegoForm.jsx'
import { inputClasses } from './formStyles.js'

const PRICE_FORMATTER = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const STOCK_FORMATTER = new Intl.NumberFormat('es-MX')

function getInitials(title) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

function formatPrice(precio) {
  return Number.isFinite(precio)
    ? `$${PRICE_FORMATTER.format(precio)}`
    : '—'
}

function formatStock(stock) {
  return Number.isFinite(stock) ? STOCK_FORMATTER.format(stock) : '—'
}

function JuegoThumb({ juego, className = 'h-12 w-16' }) {
  const [imageError, setImageError] = useState(false)
  const showImage = Boolean(juego.imagen) && !imageError

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-white/10 bg-linear-to-br from-indigo-500/30 via-slate-900 to-fuchsia-500/30 ${className}`}
    >
      {showImage ? (
        <img
          src={juego.imagen}
          alt={`Portada de ${juego.titulo}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] font-black tracking-widest text-white/70">
          {getInitials(juego.titulo)}
        </span>
      )}
    </div>
  )
}

function NoPermission() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-bold text-white">
          No tienes permiso para ver esta página
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tu cuenta no tiene el rol de administrador.
        </p>
        <Link
          to="/catalogo"
          className="mt-6 inline-block rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Volver al catálogo
        </Link>
      </section>
    </main>
  )
}

function AdminPanel() {
  const { user, token, signOut } = useAuth()
  const navigate = useNavigate()
  const [juegos, setJuegos] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [listError, setListError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [formMode, setFormMode] = useState(null)
  const [juegoEditando, setJuegoEditando] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleUnauthorized = useCallback(async () => {
    await signOut()
    navigate('/login', {
      replace: true,
      state: { from: '/admin' },
    })
  }, [signOut, navigate])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const controller = new AbortController()
    let active = true

    fetchJuegos({ signal: controller.signal, token })
      .then((data) => {
        if (!active) {
          return
        }

        setJuegos(data)
        setListStatus('ready')
      })
      .catch(async (requestError) => {
        if (!active || requestError.name === 'AbortError') {
          return
        }

        if (requestError.status === 401) {
          await handleUnauthorized()
          return
        }

        setListError(
          requestError.status === 403
            ? 'No tienes permiso para ver esta página.'
            : requestError.message ||
                'No se pudo cargar la lista de videojuegos.',
        )
        setListStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [token, reloadKey, handleUnauthorized])

  const filteredJuegos = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return juegos
    }

    return juegos.filter((juego) =>
      juego.titulo.toLowerCase().includes(term),
    )
  }, [juegos, search])

  const handleRetryList = () => {
    setListStatus('loading')
    setListError('')
    setReloadKey((current) => current + 1)
  }

  const handleNuevo = () => {
    setFormMode('create')
    setJuegoEditando(null)
    setActionError('')
    setNotice('')
  }

  const handleCancelar = () => {
    setFormMode(null)
    setJuegoEditando(null)
    setActionError('')
  }

  const handleEditar = async (juego) => {
    setEditandoId(juego.id)
    setActionError('')
    setNotice('')

    try {
      const detalle = await fetchJuegoById(juego.id, { token })
      setJuegoEditando(detalle)
      setFormMode('edit')
    } catch (requestError) {
      if (requestError?.status === 401) {
        await handleUnauthorized()
        return
      }

      setActionError(
        requestError?.status === 403
          ? 'No tienes permiso para hacer esto.'
          : requestError?.message ||
              'No se pudo cargar la información del juego para editar.',
      )
    } finally {
      setEditandoId(null)
    }
  }

  const handleGuardar = async (datos) => {
    if (formMode === 'edit' && juegoEditando) {
      await actualizarJuego(juegoEditando.id, datos, { token })
      setNotice(`Se actualizó "${datos.nombre}" correctamente.`)
    } else {
      await crearJuego(datos, { token })
      setNotice(`Se creó "${datos.nombre}" correctamente.`)
    }

    setFormMode(null)
    setJuegoEditando(null)
    setActionError('')
    setReloadKey((current) => current + 1)
  }

  const handleEliminar = async (juego) => {
    const confirmado = window.confirm(
      `¿Eliminar "${juego.titulo}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmado) {
      return
    }

    setEliminandoId(juego.id)
    setActionError('')
    setNotice('')

    try {
      await eliminarJuego(juego.id, { token })
      setNotice(`Se eliminó "${juego.titulo}" correctamente.`)
      setReloadKey((current) => current + 1)

      if (juegoEditando?.id === juego.id) {
        setFormMode(null)
        setJuegoEditando(null)
      }
    } catch (requestError) {
      if (requestError?.status === 401) {
        await handleUnauthorized()
        return
      }

      setActionError(
        requestError?.status === 403
          ? 'No tienes permiso para hacer esto.'
          : requestError?.message ||
              'No se pudo eliminar el juego. Inténtalo de nuevo.',
      )
    } finally {
      setEliminandoId(null)
    }
  }

  const ocupado = (juego) =>
    editandoId === juego.id || eliminandoId === juego.id

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
              <p className="text-xs text-slate-400">Administración</p>
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
            <Link
              to="/catalogo"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Catálogo
            </Link>
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
              Panel de administración
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Administración de videojuegos
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Crea, edita y elimina los juegos del catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNuevo}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Nuevo juego
          </button>
        </div>

        <section
          aria-label="Buscador de videojuegos"
          className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <div>
            <label
              htmlFor="admin-search"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Buscar por nombre
            </label>
            <input
              id="admin-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre del juego..."
              className={inputClasses(false)}
            />
          </div>

          {listStatus === 'ready' && (
            <p className="text-sm text-slate-400">
              {filteredJuegos.length} de {juegos.length} juegos
            </p>
          )}
        </section>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {notice}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {actionError}
          </div>
        )}

        {formMode && (
          <div className="mt-6">
            <AdminJuegoForm
              key={formMode === 'edit' ? juegoEditando?.id : 'nuevo'}
              juego={juegoEditando}
              esEdicion={formMode === 'edit'}
              onGuardar={handleGuardar}
              onCancelar={handleCancelar}
              onUnauthorized={handleUnauthorized}
            />
          </div>
        )}

        {listStatus === 'loading' && (
          <div className="mt-6 animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 border-b border-white/5 p-4 last:border-b-0"
              >
                <div className="h-12 w-16 rounded-lg bg-white/10" />
                <div className="h-4 flex-1 rounded bg-white/10" />
                <div className="hidden h-4 w-24 rounded bg-white/10 sm:block" />
              </div>
            ))}
          </div>
        )}

        {listStatus === 'error' && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center"
          >
            <h2 className="text-lg font-semibold text-rose-100">
              No pudimos cargar los videojuegos
            </h2>
            <p className="mt-2 text-sm text-rose-200">{listError}</p>
            <button
              type="button"
              onClick={handleRetryList}
              className="mt-5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Reintentar
            </button>
          </div>
        )}

        {listStatus === 'ready' && filteredJuegos.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">
              No encontramos videojuegos
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {juegos.length === 0
                ? 'Aún no hay juegos registrados. Crea el primero con el botón “Nuevo juego”.'
                : 'Prueba con otro nombre o limpia el buscador.'}
            </p>
          </div>
        )}

        {listStatus === 'ready' && filteredJuegos.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Listado de videojuegos
                </caption>
                <thead className="border-b border-white/10 bg-slate-950/60 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Imagen
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Nombre
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Género
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Plataforma
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Precio
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Stock
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredJuegos.map((juego) => (
                    <tr key={juego.id || juego.titulo}>
                      <td className="px-4 py-3">
                        <JuegoThumb juego={juego} />
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {juego.titulo}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {juego.genero || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {juego.plataforma || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatPrice(juego.precio)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatStock(juego.stock)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditar(juego)}
                            disabled={ocupado(juego)}
                            className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {editandoId === juego.id
                              ? 'Cargando...'
                              : 'Editar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminar(juego)}
                            disabled={ocupado(juego)}
                            className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {eliminandoId === juego.id
                              ? 'Eliminando...'
                              : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/5 md:hidden">
              {filteredJuegos.map((juego) => (
                <article key={juego.id || juego.titulo} className="p-4">
                  <div className="flex items-start gap-3">
                    <JuegoThumb
                      juego={juego}
                      className="h-14 w-20"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">
                        {juego.titulo}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {juego.genero || 'Sin género'} ·{' '}
                        {juego.plataforma || 'Sin plataforma'}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-slate-500">Precio</dt>
                      <dd className="mt-0.5 text-slate-200">
                        {formatPrice(juego.precio)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Stock</dt>
                      <dd className="mt-0.5 text-slate-200">
                        {formatStock(juego.stock)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditar(juego)}
                      disabled={ocupado(juego)}
                      className="flex-1 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {editandoId === juego.id
                        ? 'Cargando...'
                        : 'Editar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(juego)}
                      disabled={ocupado(juego)}
                      className="flex-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {eliminandoId === juego.id
                        ? 'Eliminando...'
                        : 'Eliminar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Admin() {
  const { user } = useAuth()

  if (!user?.token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: '/admin' }}
      />
    )
  }

  if (user.rol !== 'ADMIN') {
    return <NoPermission />
  }

  return <AdminPanel />
}

export default Admin
