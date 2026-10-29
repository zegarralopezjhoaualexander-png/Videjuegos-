import { API_BASE, ApiError, parseErrorResponse } from './http.js'

async function post(path, body, { token } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
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

function toSession(payload) {
  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof payload.token !== 'string' ||
    !payload.token
  ) {
    throw new ApiError('El servidor devolvió una respuesta inesperada.')
  }

  return {
    token: payload.token,
    nombre: typeof payload.nombre === 'string' ? payload.nombre : '',
    rol: typeof payload.rol === 'string' ? payload.rol : '',
  }
}

export async function login({ identificador, contrasena }) {
  const payload = await post('/api/auth/login', { identificador, contrasena })
  return toSession(payload)
}

export async function registro(datos) {
  const payload = await post('/api/auth/registro', datos)
  return toSession(payload)
}

export async function logout(token) {
  if (!token) {
    return
  }

  await post('/api/auth/logout', undefined, { token })
}
