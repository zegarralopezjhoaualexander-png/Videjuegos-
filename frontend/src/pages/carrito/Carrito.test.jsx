import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as carritoApi from "../../api/carrito.js";
import AuthProvider from "../../auth/AuthProvider.jsx";
import CarritoProvider from "../../auth/CarritoProvider.jsx";
import { formatMoney } from "../../utils/format.js";
import Carrito from "./Carrito.jsx";

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

const ITEM = {
  juegoId: "1",
  titulo: "Zelda",
  imagen: "",
  precio: 100,
};

const RESUMEN_VACIO = {
  items: [],
  cantidadItems: 0,
  subtotal: 0,
  descuento: 0,
  cuponCodigo: null,
  impuesto: 0,
  total: 0,
};

const RESUMEN_CON_ITEM = {
  items: [ITEM],
  cantidadItems: 1,
  subtotal: 100,
  descuento: 0,
  cuponCodigo: null,
  impuesto: 16,
  total: 116,
};

const RESUMEN_CON_CUPON = {
  ...RESUMEN_CON_ITEM,
  descuento: 10,
  cuponCodigo: "BIENVENIDO10",
  impuesto: 14.4,
  total: 104.4,
};

function LoginProbe() {
  const location = useLocation();
  return <div>login {location.state?.from}</div>;
}

function renderCarrito() {
  return render(
    <MemoryRouter initialEntries={["/carrito"]}>
      <AuthProvider>
        <CarritoProvider>
          <Routes>
            <Route path="/login" element={<LoginProbe />} />
            <Route path="/carrito" element={null} />
          </Routes>
          <Carrito />
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.setItem(
    "vj-session",
    JSON.stringify({ token: "token-1", nombre: "Ana", rol: "USER" })
  );
  carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_VACIO);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("Carrito", () => {
  it("muestra subtotal, descuento, impuesto y total recibidos", async () => {
    carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_CON_CUPON);

    renderCarrito();

    const resumen = await screen.findByRole("complementary");

    expect(within(resumen).getByText("Subtotal")).toBeInTheDocument();
    expect(within(resumen).getByText(formatMoney(100))).toBeInTheDocument();
    expect(
      within(resumen).getByText("Descuento (BIENVENIDO10)")
    ).toBeInTheDocument();
    expect(
      within(resumen).getByText(`-${formatMoney(10)}`)
    ).toBeInTheDocument();
    expect(within(resumen).getByText("Impuesto")).toBeInTheDocument();
    expect(within(resumen).getByText(formatMoney(14.4))).toBeInTheDocument();
    expect(within(resumen).getByText("Total")).toBeInTheDocument();
    expect(within(resumen).getByText(formatMoney(104.4))).toBeInTheDocument();
  });

  it("quita un videojuego del carrito", async () => {
    carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_CON_ITEM);
    carritoApi.quitarItem.mockResolvedValue(RESUMEN_VACIO);

    renderCarrito();

    await screen.findByRole("heading", { name: "Zelda" });
    fireEvent.click(
      screen.getByRole("button", { name: "Quitar Zelda del carrito" })
    );

    expect(await screen.findByText("Tu carrito está vacío")).toBeInTheDocument();
    expect(carritoApi.quitarItem).toHaveBeenCalledWith("1", {
      token: "token-1",
    });
  });

  it("vacía el carrito completo", async () => {
    carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_CON_ITEM);
    carritoApi.vaciarCarrito.mockResolvedValue(RESUMEN_VACIO);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderCarrito();

    await screen.findByRole("heading", { name: "Zelda" });
    fireEvent.click(
      screen.getByRole("button", { name: "Vaciar carrito de compras" })
    );

    expect(await screen.findByText("Tu carrito está vacío")).toBeInTheDocument();
    expect(carritoApi.vaciarCarrito).toHaveBeenCalledWith({
      token: "token-1",
    });
  });

  it("aplica un cupón válido", async () => {
    carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_CON_ITEM);
    carritoApi.aplicarCodigoCupon.mockResolvedValue(RESUMEN_CON_CUPON);

    renderCarrito();

    await screen.findByRole("heading", { name: "Zelda" });
    fireEvent.change(screen.getByLabelText("Código de descuento"), {
      target: { value: "BIENVENIDO10" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar cupón de descuento" })
    );

    expect(
      await screen.findByText("Cupón aplicado correctamente.")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Descuento (BIENVENIDO10)")
    ).toBeInTheDocument();
    expect(carritoApi.aplicarCodigoCupon).toHaveBeenCalledWith(
      "BIENVENIDO10",
      { token: "token-1" }
    );
  });

  it("muestra el error de un cupón inválido", async () => {
    carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_CON_ITEM);
    carritoApi.aplicarCodigoCupon.mockRejectedValue({
      status: 400,
      message: "El cupón no es válido.",
    });

    renderCarrito();

    await screen.findByRole("heading", { name: "Zelda" });
    fireEvent.change(screen.getByLabelText("Código de descuento"), {
      target: { value: "MALO" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar cupón de descuento" })
    );

    expect(
      await screen.findByText("El cupón no es válido.")
    ).toBeInTheDocument();
  });

  it("muestra el error de un cupón expirado", async () => {
    carritoApi.obtenerCarrito.mockResolvedValue(RESUMEN_CON_ITEM);
    carritoApi.aplicarCodigoCupon.mockRejectedValue({
      status: 400,
      message: "El cupón ha expirado.",
    });

    renderCarrito();

    await screen.findByRole("heading", { name: "Zelda" });
    fireEvent.change(screen.getByLabelText("Código de descuento"), {
      target: { value: "VIEJO" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar cupón de descuento" })
    );

    expect(await screen.findByText("El cupón ha expirado.")).toBeInTheDocument();
  });
});
