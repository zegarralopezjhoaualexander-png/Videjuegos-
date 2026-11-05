import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as carritoApi from "../../api/carrito.js";
import AuthProvider from "../../auth/AuthProvider.jsx";
import CarritoProvider from "../../auth/CarritoProvider.jsx";
import { useCarrito } from "../../auth/useCarrito.js";
import AppHeader from "../layout/AppHeader.jsx";
import BotonAgregarCarrito from "./BotonAgregarCarrito.jsx";

vi.mock("../../api/carrito.js", () => ({
  obtenerCarrito: vi.fn(),
  agregarItem: vi.fn(),
  quitarItem: vi.fn(),
  aplicarCodigoCupon: vi.fn(),
  quitarCuponDelCarrito: vi.fn(),
  vaciarCarrito: vi.fn(),
}));

vi.mock("../../api/auth.js", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

const JUEGO = { id: 10, titulo: "Mario" };

const RESUMEN_VACIO = {
  items: [],
  cantidadItems: 0,
  subtotal: 0,
  descuento: 0,
  cuponCodigo: null,
  impuesto: 0,
  total: 0,
};

const RESUMEN_CON_JUEGO = {
  items: [
    { juegoId: "10", titulo: "Mario", imagen: "", precio: 100 },
  ],
  cantidadItems: 1,
  subtotal: 100,
  descuento: 0,
  cuponCodigo: null,
  impuesto: 16,
  total: 116,
};

function LoginProbe() {
  const location = useLocation();
  return <div>login {location.state?.from}</div>;
}

function ResumenProbe() {
  const { resumen } = useCarrito();
  return <p>total {resumen.total}</p>;
}

function renderBoton({ conSesion = true } = {}) {
  if (conSesion) {
    localStorage.setItem(
      "vj-session",
      JSON.stringify({ token: "token-1", nombre: "Ana", rol: "USER" })
    );
  }

  return render(
    <MemoryRouter initialEntries={["/juego/10"]}>
      <AuthProvider>
        <CarritoProvider>
          <AppHeader subtitle="Detalle" user={null} />
          <Routes>
            <Route path="/login" element={<LoginProbe />} />
            <Route
              path="/juego/:id"
              element={<BotonAgregarCarrito juego={JUEGO} />}
            />
          </Routes>
          <ResumenProbe />
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_VACIO);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("BotonAgregarCarrito", () => {
  it("agrega un videojuego y actualiza el contador y el resumen", async () => {
    carritoApi.agregarItem.mockResolvedValue(RESUMEN_CON_JUEGO);

    renderBoton();

    const boton = await screen.findByRole("button", {
      name: "Agregar Mario al carrito",
    });
    fireEvent.click(boton);

    expect(await screen.findByText("En el carrito")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Carrito de compras, 1 artículo")
    ).toBeInTheDocument();
    expect(screen.getByText("total 116")).toBeInTheDocument();
  });

  it("muestra el aviso cuando el backend responde 409", async () => {
    carritoApi.agregarItem.mockRejectedValue({
      status: 409,
      message: "Ya posees este videojuego",
    });

    renderBoton();

    const boton = await screen.findByRole("button", {
      name: "Agregar Mario al carrito",
    });
    fireEvent.click(boton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya posees este videojuego"
    );
  });

  it("cierra la sesión y redirige a /login cuando el backend responde 401", async () => {
    carritoApi.agregarItem.mockRejectedValue({
      status: 401,
      message: "No autorizado",
    });

    renderBoton();

    const boton = await screen.findByRole("button", {
      name: "Agregar Mario al carrito",
    });
    fireEvent.click(boton);

    expect(await screen.findByText("login /juego/10")).toBeInTheDocument();
    expect(localStorage.getItem("vj-session")).toBeNull();
  });

  it("redirige a /login sin sesión conservando la ruta de retorno", async () => {
    renderBoton({ conSesion: false });

    const boton = await screen.findByRole("button", {
      name: "Agregar Mario al carrito",
    });
    fireEvent.click(boton);

    expect(await screen.findByText("login /juego/10")).toBeInTheDocument();
    expect(carritoApi.agregarItem).not.toHaveBeenCalled();
  });
});
