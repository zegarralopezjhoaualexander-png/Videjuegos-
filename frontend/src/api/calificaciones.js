import { API_BASE, ApiError, parseErrorResponse } from './http.js'

function calificacionesUrl(id) {
  return `${API_BASE}/api/tienda/juegos/${encodeURIComponent(id)}/calificaciones`
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeResumen(payload) {
  const raw = payload?.data ?? payload

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ApiError('El servidor devolvió una respuesta inesperada.')
  }

  const total = toNumberOrNull(raw.total)

  return {
    promedio: toNumberOrNull(raw.promedio),
    total: total === null ? 0 : Math.max(total, 0),
    miPuntaje: toNumberOrNull(raw.miPuntaje),
  }
}

async function request(url, { token, method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(
      'No se pudieron cargar las calificaciones. Verifica tu conexión e inténtalo de nuevo.',
      { cause: error },
    )
  }

  if (!response.ok) {
    throw await parseErrorResponse(response)
  }

  if (response.status === 204) {
    return null
  }

  const raw = await response.text()

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function fetchCalificaciones(id, { token, signal } = {}) {
  const url = token
    ? `${calificacionesUrl(id)}/mia`
    : calificacionesUrl(id)

  const payload = await request(url, { token, signal })
  return normalizeResumen(payload)
}

export async function guardarMiCalificacion(id, puntaje, { token, signal } = {}) {
  const payload = await request(`${calificacionesUrl(id)}/mia`, {
    token,
    method: 'PUT',
    body: { puntaje },
    signal,
  })

  return normalizeResumen(payload)
}
