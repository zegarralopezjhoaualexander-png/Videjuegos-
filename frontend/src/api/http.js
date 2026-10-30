export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/$/,
  ""
);

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {}, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    if (cause) {
      this.cause = cause;
    }
  }
}

const FIELD_ALIASES = {
  identificador: "identificador",
  email: "correo",
  correo: "correo",
  username: "identificador",
  usuario: "identificador",
  password: "contrasena",
  contrasena: "contrasena",
  confirmacion: "confirmacion",
  confirmpassword: "confirmacion",
  nombre: "nombre",
  apellido: "apellido",
  fechanacimiento: "fechaNacimiento",
  genero: "genero",
  plataforma: "plataforma",
  anio: "anio",
  ano: "anio",
  puntuacion: "puntuacion",
  imagen: "imagen",
  descripcion: "descripcion",
  precio: "precio",
  stock: "stock",
  desarrollador: "desarrollador",
  fechalanzamiento: "fechaLanzamiento",
  trailerurl: "trailerUrl",
  requisitosminimos: "requisitosMinimos",
  requisitosrecomendados: "requisitosRecomendados",
  galeria: "galeria",
};

const FIELD_CONTAINERS = ["errors", "campos", "fieldErrors", "errores"];

function toText(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function normalizeKey(key) {
  return String(key)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "");
}

function fieldFromKey(key) {
  return FIELD_ALIASES[normalizeKey(key)] ?? null;
}

function messageFromItem(item) {
  if (!item) {
    return "";
  }

  if (typeof item !== "object") {
    return toText(item);
  }

  return (
    toText(item.defaultMessage) ||
    toText(item.message) ||
    toText(item.mensaje) ||
    toText(item.error) ||
    toText(item.detalle)
  );
}

function pickMessage(payload) {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    return payload.map(messageFromItem).filter(Boolean).join(". ");
  }

  if (typeof payload !== "object") {
    return "";
  }

  return (
    toText(payload.message) ||
    toText(payload.mensaje) ||
    toText(payload.detail) ||
    toText(payload.detalle) ||
    toText(payload.error) ||
    toText(payload.title)
  );
}

export function extractFieldErrors(payload) {
  const result = {};

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return result;
  }

  for (const container of FIELD_CONTAINERS) {
    const source = payload[container];

    if (!source) {
      continue;
    }

    if (Array.isArray(source)) {
      for (const item of source) {
        if (!item || typeof item !== "object") {
          continue;
        }

        const field = fieldFromKey(
          item.field ?? item.campo ?? item.name ?? item.property ?? ""
        );
        const message = messageFromItem(item);

        if (field && message && !result[field]) {
          result[field] = message;
        }
      }

      continue;
    }

    if (typeof source === "object") {
      for (const [key, value] of Object.entries(source)) {
        const field = fieldFromKey(key);
        const message = messageFromItem(value);

        if (field && message && !result[field]) {
          result[field] = message;
        }
      }
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_CONTAINERS.includes(key)) {
      continue;
    }

    const field = fieldFromKey(key);
    const message = toText(value);

    if (field && message && !result[field]) {
      result[field] = message;
    }
  }

  return result;
}

function fallbackMessage(status) {
  if (status === 400) {
    return "Revisa los datos ingresados e inténtalo de nuevo.";
  }

  if (status === 401) {
    return "Credenciales incorrectas. Verifica tus datos e inténtalo de nuevo.";
  }

  if (status === 409) {
    return "Ya existe una cuenta con esos datos.";
  }

  return "Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.";
}

async function readResponseText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

export async function parseErrorResponse(response, { fallback } = {}) {
  const raw = await readResponseText(response);
  let payload = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  const fieldErrors = extractFieldErrors(payload);
  const fallbackText =
    typeof fallback === "function"
      ? fallback(response.status)
      : fallback || fallbackMessage(response.status);
  const message =
    pickMessage(payload) || Object.values(fieldErrors)[0] || fallbackText;

  return new ApiError(message, {
    status: response.status,
    fieldErrors,
  });
}

export async function requestJson(
  url,
  {
    token,
    method = "GET",
    body,
    signal,
    networkMessage = "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
    parseError = parseErrorResponse,
  } = {}
) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(networkMessage, { cause: error });
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return null;
  }

  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
