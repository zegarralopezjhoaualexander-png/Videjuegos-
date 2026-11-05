import { afterEach, describe, expect, it, vi } from "vitest";
import { agregarItem } from "./carrito.js";

const CONFLICTO_GENERICO =
  "No se pudo agregar el videojuego: ya está en tu carrito o en tu biblioteca.";

function respuesta(status, body) {
  return {
    ok: false,
    status,
    text: async () => JSON.stringify(body),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("agregarItem con respuesta 409", () => {
  it("informa que el videojuego ya se posee", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respuesta(409, { message: "Ya posees este videojuego en tu biblioteca" })
      )
    );

    await expect(agregarItem(1, { token: "token" })).rejects.toMatchObject({
      status: 409,
      message: "Ya posees este videojuego",
    });
  });

  it("informa que el videojuego ya está en el carrito", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        respuesta(409, { message: "Este videojuego ya está en tu carrito" })
      )
    );

    await expect(agregarItem(1, { token: "token" })).rejects.toMatchObject({
      status: 409,
      message: "Este videojuego ya está en tu carrito",
    });
  });

  it("usa el mensaje genérico cuando no puede distinguir el conflicto", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respuesta(409, { detail: "Conflict" }))
    );

    await expect(agregarItem(1, { token: "token" })).rejects.toMatchObject({
      status: 409,
      message: CONFLICTO_GENERICO,
    });
  });

  it("conserva el estado 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respuesta(401, { message: "No autorizado" }))
    );

    await expect(agregarItem(1, { token: "token" })).rejects.toMatchObject({
      status: 401,
    });
  });
});
