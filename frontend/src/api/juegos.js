import { API_BASE, ApiError, parseErrorResponse } from './http.js'

const JUEGOS_URL = `${API_BASE}/api/tienda/juegos`

function pick(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== '',
  )
}

function toLabel(value) {
  if (value === undefined || value === null) {
    return ''
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(toLabel).filter(Boolean).join(', ')
  }

  if (typeof value === 'object') {
    return toLabel(
      pick(
        value.nombre,
        value.name,
        value.titulo,
        value.title,
        value.descripcion,
        value.id,
      ),
    )
  }

  return ''
}

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function toMultilineText(value) {
  return typeof value === 'string'
    ? value.replace(/\r\n/g, '\n').trim()
    : ''
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function resolveImageUrl(value) {
  const image = typeof value === 'string' ? value.trim() : ''

  if (!image) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:')) {
    return image
  }

  if (image.startsWith('/')) {
    return `${API_BASE}${image}`
  }

  return image
}

function toImageList(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(resolveImageUrl).filter(Boolean)
}

export function normalizeJuego(raw = {}) {
  const id = pick(raw.id, raw.juegoId, raw.juego_id, raw.codigo, raw.slug)
  const fechaLanzamiento = toText(
    pick(
      raw.fechaLanzamiento,
      raw.fecha_lanzamiento,
      raw.releaseDate,
      raw.fecha,
    ),
  )

  return {
    id: id === undefined ? '' : String(id),
    titulo:
      toLabel(pick(raw.titulo, raw.nombre, raw.title)) || 'Juego sin título',
    genero: toLabel(
      pick(
        raw.genero,
        raw.generoNombre,
        raw.nombreGenero,
        raw.generos,
        raw.genre,
      ),
    ),
    plataforma: toLabel(
      pick(
        raw.plataforma,
        raw.plataformaNombre,
        raw.nombrePlataforma,
        raw.plataformas,
        raw.platform,
      ),
    ),
    puntuacion: toNumber(
      pick(
        raw.puntuacion,
        raw.calificacion,
        raw.rating,
        raw.score,
        raw.nota,
      ),
    ),
    imagen: resolveImageUrl(
      pick(
        raw.imagen,
        raw.imagenUrl,
        raw.urlImagen,
        raw.imagenPortada,
        raw.portada,
        raw.image,
        raw.cover,
      ),
    ),
    descripcion: toMultilineText(
      pick(
        raw.descripcion,
        raw.descripcionCorta,
        raw.sinopsis,
        raw.description,
        raw.resumen,
      ),
    ),
    anio:
      toLabel(pick(raw.anio, raw['año'], raw.year)) ||
      fechaLanzamiento.slice(0, 4),
    desarrollador: toLabel(
      pick(
        raw.desarrollador,
        raw.desarrolladorNombre,
        raw.desarrollo,
        raw.developer,
      ),
    ),
    fechaLanzamiento,
    precio: toNumber(pick(raw.precio, raw.price, raw.precioVenta)),
    stock: toNumber(
      pick(raw.stock, raw.existencias, raw.inventario, raw.unidades),
    ),
    galeria: toImageList(
      pick(raw.galeria, raw.galeriaImagenes, raw.imagenes, raw.gallery),
    ),
    trailerUrl: toText(
      pick(raw.trailerUrl, raw.trailer_url, raw.trailer, raw.videoUrl),
    ),
    requisitosMinimos: toMultilineText(
      pick(
        raw.requisitosMinimos,
        raw.requisitos_minimos,
        raw.minimumRequirements,
      ),
    ),
    requisitosRecomendados: toMultilineText(
      pick(
        raw.requisitosRecomendados,
        raw.requisitos_recomendados,
        raw.recommendedRequirements,
      ),
    ),
    promedioCalificacion: toNumber(
      pick(
        raw.promedioCalificacion,
        raw.calificacionPromedio,
        raw.promedio,
        raw.averageRating,
      ),
    ),
    totalCalificaciones: toNumber(
      pick(
        raw.totalCalificaciones,
        raw.cantidadCalificaciones,
        raw.totalReviews,
        raw.reviews,
      ),
    ),
  }
}

function extractList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.content)) {
    return payload.content
  }

  if (Array.isArray(payload.juegos)) {
    return payload.juegos
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  if (Array.isArray(payload.data?.content)) {
    return payload.data.content
  }

  return []
}

async function request(url, { signal, token } = {}) {
  const headers = { Accept: 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(url, {
      signal,
      headers,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(
      `No se pudo conectar con el servidor (${API_BASE}). Verifica que el backend esté en ejecución.`,
      { cause: error },
    )
  }

  if (!response.ok) {
    throw await parseErrorResponse(response)
  }

  return response.json()
}

export async function fetchJuegos({ signal, token } = {}) {
  const payload = await request(JUEGOS_URL, { signal, token })
  return extractList(payload).map(normalizeJuego)
}

export async function fetchJuegoById(id, { signal, token } = {}) {
  const payload = await request(
    `${JUEGOS_URL}/${encodeURIComponent(id)}`,
    { signal, token },
  )
  const raw = payload?.data ?? payload?.juego ?? payload

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ApiError('El servidor devolvió una respuesta inesperada.')
  }

  return normalizeJuego(raw)
}
