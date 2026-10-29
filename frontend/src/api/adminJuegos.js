import { API_BASE, ApiError, extractFieldErrors } from './http.js'

const ADMIN_JUEGOS_URL = `${API_BASE}/api/admin/juegos`

function toText(value) {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return ''
}

function messageFromItem(item) {
  if (!item) {
    return ''
  }

  if (typeof item !== 'object') {
    return toText(item)
  }

  return (
    toText(item.defaultMessage) ||
    toText(item.message) ||
    toText(item.mensaje) ||
    toText(item.error) ||
    toText(item.detalle)
  )
}

function pickMessage(payload) {
  if (!payload) {
    return ''
  }

  if (typeof payload === 'string') {
    return payload.trim()
  }

  if (Array.isArray(payload)) {
    return payload.map(messageFromItem).filter(Boolean).join('. ')
  }

  if (typeof payload !== 'object') {
    return ''
  }

  return (
    toText(payload.message) ||
    toText(payload.mensaje) ||
    toText(payload.error) ||
    toText(payload.detalle) ||
    toText(payload.detail) ||
    toText(payload.title)
  )
}

function defaultErrorMessage(status) {
  if (status === 403) {
    return 'No tienes permiso para hacer esto.'
  }

  if (status === 400 || status === 409) {
    return 'No se pudo completar la operación. Revisa los datos e inténtalo de nuevo.'
  }

  return 'Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.'
}

async function parseAdminError(response) {
  let raw

  try {
    raw = await response.text()
  } catch {
    raw = ''
  }

  let payload = null

  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = raw
    }
  }

  const fieldErrors = extractFieldErrors(payload)
  const message =
    pickMessage(payload) ||
    Object.values(fieldErrors)[0] ||
    defaultErrorMessage(response.status)

  return new ApiError(message, {
    status: response.status,
    fieldErrors,
  })
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
      'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
      { cause: error },
    )
  }

  if (!response.ok) {
    throw await parseAdminError(response)
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

export async function crearJuego(datos, { token, signal } = {}) {
  return request(ADMIN_JUEGOS_URL, {
    token,
    method: 'POST',
    body: datos,
    signal,
  })
}

export async function actualizarJuego(id, datos, { token, signal } = {}) {
  return request(`${ADMIN_JUEGOS_URL}/${encodeURIComponent(id)}`, {
    token,
    method: 'PUT',
    body: datos,
    signal,
  })
}

export async function eliminarJuego(id, { token, signal } = {}) {
  return request(`${ADMIN_JUEGOS_URL}/${encodeURIComponent(id)}`, {
    token,
    method: 'DELETE',
    signal,
  })
}
