import { API_BASE, ApiError, requestJson } from "./http.js";

function post(path, body, { token } = {}) {
  return requestJson(`${API_BASE}${path}`, {
    token,
    method: "POST",
    body,
  });
}

function toSession(payload) {
  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.token !== "string" ||
    !payload.token
  ) {
    throw new ApiError("El servidor devolvió una respuesta inesperada.");
  }

  return {
    token: payload.token,
    nombre: typeof payload.nombre === "string" ? payload.nombre : "",
    rol: typeof payload.rol === "string" ? payload.rol : "",
  };
}

export async function login({ identificador, contrasena }) {
  const payload = await post("/api/auth/login", { identificador, contrasena });
  return toSession(payload);
}

export async function registro(datos) {
  const payload = await post("/api/auth/registro", datos);
  return toSession(payload);
}

export async function logout(token) {
  if (!token) {
    return;
  }

  await post("/api/auth/logout", undefined, { token });
}
