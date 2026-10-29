import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  fetchCalificaciones,
  guardarMiCalificacion,
} from '../api/calificaciones.js'
import { fetchJuegoById } from '../api/juegos.js'
import { useAuth } from '../auth/useAuth.js'

const SECTION_CLASSES =
  'rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur sm:p-8'

const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const TOTAL_FORMATTER = new Intl.NumberFormat('es-MX')

const PRICE_FORMATTER = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatScore(score) {
  if (!Number.isFinite(score)) {
    return ''
  }

  const value = Number.isInteger(score) ? String(score) : score.toFixed(1)
  return `${value}/10`
}

function formatPrice(precio) {
  if (!Number.isFinite(precio)) {
    return ''
  }

  return `$${PRICE_FORMATTER.format(precio)}`
}

function formatDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return ''
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return DATE_FORMATTER.format(date)
}

function formatStock(stock) {
  if (!Number.isFinite(stock)) {
    return 'Disponibilidad no disponible'
  }

  if (stock <= 0) {
    return 'Agotado'
  }

  return stock === 1 ? '1 unidad disponible' : `${stock} unidades disponibles`
}

function getStockClasses(stock) {
  if (!Number.isFinite(stock)) {
    return 'border-white/10 bg-slate-900/60 text-slate-400'
  }

  if (stock <= 0) {
    return 'border-rose-400/30 bg-rose-500/10 text-rose-200'
  }

  return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
}

function getInitials(title) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

function getYouTubeTrailer(value) {
  const input = typeof value === 'string' ? value.trim() : ''

  if (!input) {
    return null
  }

  const withProtocol = /^https?:\/\//i.test(input)
    ? input
    : input.startsWith('//')
      ? `https:${input}`
      : `https://${input}`

  let url

  try {
    url = new URL(withProtocol)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./i, '').toLowerCase()
  const segments = url.pathname.split('/').filter(Boolean)
  const isYouTube =
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtu.be' ||
    host === 'youtube-nocookie.com'

  if (!isYouTube) {
    return null
  }

  if (url.pathname.startsWith('/results')) {
    return { type: 'search', url: url.toString() }
  }

  let id = ''

  if (host === 'youtu.be') {
    id = segments[0] || ''
  } else if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com'
  ) {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v') || ''
    } else if (['embed', 'shorts', 'live', 'v'].includes(segments[0])) {
      id = segments[1] || ''
    }
  } else if (host === 'youtube-nocookie.com') {
    if (segments[0] === 'embed') {
      id = segments[1] || ''
    }
  }

  if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) {
    return null
  }

  return {
    type: 'embed',
    url: `https://www.youtube.com/embed/${id}`,
  }
}

function MissingInfo({ className = '' }) {
  return <p className={`text-sm text-slate-500 ${className}`}>Información no disponible</p>
}

function MetaItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-slate-200">
        {value || <span className="text-slate-500">Información no disponible</span>}
      </dd>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <section className={SECTION_CLASSES}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  )
}

function RequirementBlock({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
      <h3 className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
        {title}
      </h3>
      {text ? (
        <p className="mt-3 text-sm leading-6 whitespace-pre-line text-slate-300">
          {text}
        </p>
      ) : (
        <MissingInfo className="mt-3" />
      )}
    </div>
  )
}

function StarIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="m12 2.5 2.9 6.05 6.68.97-4.83 4.71 1.14 6.65L12 17.74l-5.89 3.14 1.14-6.65-4.83-4.71 6.68-.97L12 2.5Z" />
    </svg>
  )
}

function CalificacionEstrellas({ valor, onSeleccionar, deshabilitado }) {
  const [resaltado, setResaltado] = useState(0)
  const botonesRef = useRef([])
  const activo = resaltado || valor || 0

  const manejarTeclado = (event, index) => {
    let siguiente = null

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      siguiente = Math.min(index + 1, 4)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      siguiente = Math.max(index - 1, 0)
    } else if (event.key === 'Home') {
      siguiente = 0
    } else if (event.key === 'End') {
      siguiente = 4
    }

    if (siguiente === null) {
      return
    }

    event.preventDefault()
    botonesRef.current[siguiente]?.focus()
  }

  return (
    <div
      role="group"
      aria-label="Selecciona tu calificación de 1 a 5 estrellas"
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((puntaje) => (
        <button
          key={puntaje}
          ref={(element) => {
            botonesRef.current[puntaje - 1] = element
          }}
          type="button"
          disabled={deshabilitado}
          onClick={() => onSeleccionar(puntaje)}
          onMouseEnter={() => setResaltado(puntaje)}
          onMouseLeave={() => setResaltado(0)}
          onFocus={() => setResaltado(puntaje)}
          onBlur={() => setResaltado(0)}
          onKeyDown={(event) => manejarTeclado(event, puntaje - 1)}
          aria-label={`Calificar con ${puntaje} de 5 estrellas`}
          aria-pressed={valor === puntaje}
          className="rounded-lg p-1 transition duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-wait disabled:opacity-60"
        >
          <StarIcon
            className={`size-8 transition-colors ${
              puntaje <= activo ? 'text-amber-300' : 'text-slate-700'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function JuegoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, signOut } = useAuth()
  const [requestState, setRequestState] = useState({
    id: null,
    status: 'loading',
    juego: null,
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [mainImageFailed, setMainImageFailed] = useState(false)
  const [failedGalleryImages, setFailedGalleryImages] = useState([])
  const [calificaciones, setCalificaciones] = useState({
    status: 'loading',
    promedio: null,
    total: 0,
    miPuntaje: null,
    error: '',
  })
  const [calificacionesReloadKey, setCalificacionesReloadKey] = useState(0)
  const [guardandoCalificacion, setGuardandoCalificacion] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchJuegoById(id, { signal: controller.signal })
      .then((data) => {
        if (!active) {
          return
        }

        setSelectedImage(null)
        setMainImageFailed(false)
        setFailedGalleryImages([])
        setRequestState({ id, status: 'ready', juego: data, error: '' })
      })
      .catch((requestError) => {
        if (!active || requestError.name === 'AbortError') {
          return
        }

        if (requestError.status === 404) {
          setSelectedImage(null)
          setRequestState({
            id,
            status: 'notFound',
            juego: null,
            error: '',
          })
          return
        }

        setSelectedImage(null)
        setRequestState({
          id,
          status: 'error',
          juego: null,
          error:
            requestError.message ||
            'No se pudo cargar la información del juego.',
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [id, reloadKey])

  const handleUnauthorized = useCallback(async () => {
    await signOut()
    navigate('/login', {
      replace: true,
      state: { from: `/juego/${id}` },
    })
  }, [signOut, navigate, id])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setCalificaciones({
      status: 'loading',
      promedio: null,
      total: 0,
      miPuntaje: null,
      error: '',
    })

    fetchCalificaciones(id, { token, signal: controller.signal })
      .then((resumen) => {
        if (!active) {
          return
        }

        setCalificaciones({ status: 'ready', ...resumen, error: '' })
      })
      .catch(async (requestError) => {
        if (!active || requestError.name === 'AbortError') {
          return
        }

        if (requestError.status === 401) {
          await handleUnauthorized()
          return
        }

        setCalificaciones({
          status: 'error',
          promedio: null,
          total: 0,
          miPuntaje: null,
          error:
            requestError.message ||
            'No se pudieron cargar las calificaciones de los usuarios.',
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [id, token, calificacionesReloadKey, handleUnauthorized])

  useEffect(() => {
    if (!selectedImage) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage])

  const status =
    requestState.id === id ? requestState.status : 'loading'
  const juego =
    requestState.id === id && requestState.status === 'ready'
      ? requestState.juego
      : null
  const error = requestState.id === id ? requestState.error : ''

  const handleRetry = () => {
    setRequestState((current) => ({
      ...current,
      status: 'loading',
      error: '',
    }))
    setReloadKey((current) => current + 1)
  }

  const handleGalleryImageError = (url) => {
    setFailedGalleryImages((current) =>
      current.includes(url) ? current : [...current, url],
    )
  }

  const handleCalificar = async (puntaje) => {
    if (!token || guardandoCalificacion) {
      return
    }

    setGuardandoCalificacion(true)
    setCalificaciones((current) => ({ ...current, error: '' }))

    try {
      const resumen = await guardarMiCalificacion(id, puntaje, { token })
      setCalificaciones({ status: 'ready', ...resumen, error: '' })
    } catch (requestError) {
      if (requestError?.status === 401) {
        await handleUnauthorized()
        return
      }

      setCalificaciones((current) => ({
        ...current,
        error:
          requestError?.message ||
          'No se pudo guardar tu calificación. Inténtalo de nuevo.',
      }))
    } finally {
      setGuardandoCalificacion(false)
    }
  }

  const showMainImage = Boolean(juego?.imagen) && !mainImageFailed
  const gallery = juego
    ? juego.galeria.filter((url) => !failedGalleryImages.includes(url))
    : []
  const trailer = getYouTubeTrailer(juego?.trailerUrl)

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          <span aria-hidden="true">&larr;</span>
          Volver al catálogo
        </Link>

        {status === 'loading' && (
          <div className="mt-6 animate-pulse space-y-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="grid lg:grid-cols-2">
                <div className="aspect-video bg-white/10 lg:aspect-auto lg:min-h-[380px]" />
                <div className="space-y-4 p-6 sm:p-8">
                  <div className="h-8 w-3/4 rounded bg-white/10" />
                  <div className="h-4 w-1/2 rounded bg-white/10" />
                  <div className="h-24 w-full rounded bg-white/10" />
                  <div className="h-20 w-full rounded bg-white/10" />
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-48 rounded-2xl border border-white/10 bg-white/5" />
              <div className="h-48 rounded-2xl border border-white/10 bg-white/5" />
            </div>
          </div>
        )}

        {status === 'notFound' && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-8 text-center"
          >
            <h1 className="text-xl font-semibold text-amber-100">
              Juego no encontrado
            </h1>
            <p className="mt-2 text-sm text-amber-200">
              No existe un juego con el identificador solicitado.
            </p>
            <Link
              to="/catalogo"
              className="mt-5 inline-block rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Volver al catálogo
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center"
          >
            <h1 className="text-xl font-semibold text-rose-100">
              No pudimos cargar este juego
            </h1>
            <p className="mt-2 text-sm text-rose-200">{error}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Reintentar
              </button>
              <Link
                to="/catalogo"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Volver al catálogo
              </Link>
            </div>
          </div>
        )}

        {status === 'ready' && juego && (
          <div className="mt-6 space-y-6">
            <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
              <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative aspect-video overflow-hidden bg-linear-to-br from-indigo-500/30 via-slate-900 to-fuchsia-500/30 lg:aspect-auto lg:min-h-[380px]">
                  {showMainImage ? (
                    <img
                      src={juego.imagen}
                      alt={`Portada de ${juego.titulo}`}
                      onError={() => setMainImageFailed(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                      <span className="text-4xl font-black tracking-widest text-white/70">
                        {getInitials(juego.titulo)}
                      </span>
                      <span className="text-xs text-white/50">
                        Imagen no disponible
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h1 className="text-3xl font-bold text-white">
                      {juego.titulo}
                    </h1>
                    {Number.isFinite(juego.puntuacion) && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-200">
                        {formatScore(juego.puntuacion)}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {juego.genero && (
                      <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">
                        {juego.genero}
                      </span>
                    )}
                    {juego.plataforma && (
                      <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-sm text-slate-300">
                        {juego.plataforma}
                      </span>
                    )}
                    {juego.anio && (
                      <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-sm text-slate-300">
                        {juego.anio}
                      </span>
                    )}
                  </div>

                  <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                    <MetaItem
                      label="Desarrollador"
                      value={juego.desarrollador}
                    />
                    <MetaItem
                      label="Fecha de lanzamiento"
                      value={formatDate(juego.fechaLanzamiento)}
                    />
                  </dl>

                  <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Precio
                        </p>
                        {Number.isFinite(juego.precio) ? (
                          <p className="mt-1 text-2xl font-bold text-white">
                            {formatPrice(juego.precio)}
                          </p>
                        ) : (
                          <MissingInfo className="mt-1" />
                        )}
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStockClasses(juego.stock)}`}
                      >
                        {formatStock(juego.stock)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <SectionCard title="Sinopsis">
              {juego.descripcion ? (
                <p className="mt-3 text-sm leading-7 whitespace-pre-line text-slate-300">
                  {juego.descripcion}
                </p>
              ) : (
                <MissingInfo className="mt-3" />
              )}
            </SectionCard>

            <SectionCard title="Galería">
              {gallery.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {gallery.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(url)}
                      className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 transition hover:border-indigo-400/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                      aria-label={`Ampliar imagen ${index + 1} de ${gallery.length} de ${juego.titulo}`}
                    >
                      <img
                        src={url}
                        alt={`Imagen ${index + 1} de ${juego.titulo}`}
                        loading="lazy"
                        onError={() => handleGalleryImageError(url)}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-slate-950/40 group-hover:opacity-100">
                        Ampliar
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <MissingInfo className="mt-3" />
              )}
            </SectionCard>

            <SectionCard title="Tráiler">
              {trailer?.type === 'embed' ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
                  <div className="aspect-video w-full">
                    <iframe
                      src={trailer.url}
                      title={`Tráiler de ${juego.titulo}`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="h-full w-full"
                    />
                  </div>
                </div>
              ) : trailer?.type === 'search' ? (
                <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Búsqueda de tráiler en YouTube
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Este enlace es una búsqueda y no se puede incrustar.
                    </p>
                  </div>
                  <a
                    href={trailer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  >
                    Ver tráiler en YouTube
                    <span aria-hidden="true">&#8599;</span>
                  </a>
                </div>
              ) : (
                <MissingInfo className="mt-3" />
              )}
            </SectionCard>

            <SectionCard title="Requisitos del sistema">
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <RequirementBlock
                  title="Mínimos"
                  text={juego.requisitosMinimos}
                />
                <RequirementBlock
                  title="Recomendados"
                  text={juego.requisitosRecomendados}
                />
              </div>
            </SectionCard>

            <SectionCard title="Calificación">
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
                  <h3 className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
                    Valoración editorial
                  </h3>
                  {Number.isFinite(juego.puntuacion) ? (
                    <>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-black text-amber-300">
                          {Number.isInteger(juego.puntuacion)
                            ? juego.puntuacion
                            : juego.puntuacion.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-400">/ 10</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{
                            width: `${Math.min(Math.max(juego.puntuacion, 0), 10) * 10}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <MissingInfo className="mt-3" />
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
                  <h3 className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
                    Calificación de los usuarios
                  </h3>

                  {calificaciones.status === 'loading' && (
                    <p
                      className="mt-3 text-sm text-slate-400"
                      aria-live="polite"
                    >
                      Cargando calificaciones...
                    </p>
                  )}

                  {calificaciones.status === 'error' && (
                    <div className="mt-3 space-y-3">
                      <p role="alert" className="text-sm text-rose-300">
                        {calificaciones.error}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setCalificacionesReloadKey((current) => current + 1)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {calificaciones.status === 'ready' && (
                    <div className="mt-3 space-y-4">
                      {calificaciones.total > 0 &&
                      Number.isFinite(calificaciones.promedio) ? (
                        <div className="flex items-center gap-2">
                          <StarIcon className="size-5 shrink-0 text-amber-300" />
                          <p className="text-sm text-slate-300">
                            <span className="font-semibold text-white">
                              {calificaciones.promedio.toFixed(1)}
                            </span>
                            <span className="text-slate-500"> · </span>
                            {calificaciones.total === 1
                              ? '1 calificación'
                              : `${TOTAL_FORMATTER.format(calificaciones.total)} calificaciones`}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Aún sin calificaciones
                        </p>
                      )}

                      {token ? (
                        <div>
                          <CalificacionEstrellas
                            valor={calificaciones.miPuntaje}
                            onSeleccionar={handleCalificar}
                            deshabilitado={guardandoCalificacion}
                          />
                          <p
                            className="mt-2 text-sm text-slate-300"
                            aria-live="polite"
                          >
                            {guardandoCalificacion
                              ? 'Guardando tu calificación...'
                              : Number.isFinite(calificaciones.miPuntaje)
                                ? `Tu calificación: ${calificaciones.miPuntaje} de 5`
                                : 'Selecciona de 1 a 5 estrellas'}
                          </p>
                          {calificaciones.error && (
                            <p
                              role="alert"
                              className="mt-2 text-sm text-rose-300"
                            >
                              {calificaciones.error}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">
                          <Link
                            to="/login"
                            className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                          >
                            Inicia sesión
                          </Link>{' '}
                          para calificar
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 rounded-full border border-white/20 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Cerrar
            </button>
            <img
              src={selectedImage}
              alt={`Imagen ampliada de ${juego?.titulo ?? 'el juego'}`}
              className="max-h-[85vh] w-full rounded-2xl border border-white/10 object-contain"
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default JuegoDetalle
