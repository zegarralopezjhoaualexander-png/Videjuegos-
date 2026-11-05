import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { useCarrito } from "../../auth/useCarrito.js";

const BASE_BUTTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 font-semibold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function BotonAgregarCarrito({ juego, compacto = false, className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { agregar, estaEnCarrito, accion, cargando, limpiarError } =
    useCarrito();
  const [aviso, setAviso] = useState("");

  const enCarrito = estaEnCarrito(juego.id);
  const agregando = accion === `agregar:${juego.id}`;
  const deshabilitado = enCarrito || agregando || cargando;

  const volverAlLogin = () => {
    navigate("/login", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const handleAgregar = async () => {
    setAviso("");

    if (!token) {
      volverAlLogin();
      return;
    }

    try {
      await agregar(juego.id);
    } catch (requestError) {
      if (requestError?.status === 401) {
        volverAlLogin();
        return;
      }

      limpiarError();
      const mensaje =
        requestError?.message ||
        "No se pudo agregar el videojuego al carrito.";

      setAviso(
        /posees/i.test(mensaje)
          ? "Ya posees este videojuego. Revísalo en tu biblioteca."
          : mensaje
      );
    }
  };

  const etiqueta = enCarrito
    ? "En el carrito"
    : agregando
      ? "Agregando..."
      : cargando
        ? "Cargando carrito..."
        : "Agregar al carrito";

  const ariaLabel = enCarrito
    ? `${juego.titulo} ya está en el carrito`
    : agregando
      ? `Agregando ${juego.titulo} al carrito`
      : cargando
        ? "Cargando el carrito"
        : `Agregar ${juego.titulo} al carrito`;

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleAgregar}
        disabled={deshabilitado}
        aria-label={ariaLabel}
        className={`${BASE_BUTTON} ${
          compacto ? "py-2 text-xs" : "py-2.5 text-sm"
        } ${
          enCarrito
            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
            : "border-indigo-400/40 bg-indigo-500/15 text-indigo-100 hover:border-indigo-300 hover:bg-indigo-500/25"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="size-4 shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6"
          />
          <circle cx="10" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
        </svg>
        {etiqueta}
      </button>

      {aviso && (
        <p role="alert" className="text-xs leading-5 text-amber-200">
          {aviso}
        </p>
      )}
    </div>
  );
}

export default BotonAgregarCarrito;
