const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(
  /\/+$/,
  ""
);

export const API_BASE = BASE;

const NETWORK_MESSAGE = "No se pudo conectar con el servidor";

function readToken() {
  if (typeof window === "undefined" || !window.localStorage) {
    return "";
  }

  try {
    const direct = window.localStorage.getItem("token");
    if (direct) {
      return direct;
    }

    const raw = window.localStorage.getItem("vj-session");
    if (!raw) {
      return "";
    }

    const session = JSON.parse(raw);
    return typeof session?.token === "string" ? session.token : "";
  } catch {
    return "";
  }
}

async function readJson(response) {
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

async function buildError(response) {
  const raw = await response.text().catch(() => "");
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  const message =
    data && typeof data === "object"
      ? data.mensaje || data.message
      : undefined;

  if (message) {
    return new Error(String(message));
  }

  return new Error(`Error del servidor (${response.status})`);
}

export async function api(path, options = {}) {
  const {
    method = "GET",
    body,
    token,
    signal,
    headers: customHeaders,
    networkMessage = NETWORK_MESSAGE,
    parseError,
    ...rest
  } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const authToken = token ?? readToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const url = /^https?:\/\//i.test(path) ? path : `${BASE}${path}`;
  const init = { method, headers, signal, ...rest };

  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new Error(networkMessage, { cause: error });
  }

  if (!response.ok) {
    if (typeof parseError === "function") {
      throw await parseError(response);
    }

    throw await buildError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return readJson(response);
}
