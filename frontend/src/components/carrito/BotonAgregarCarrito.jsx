import { useAgregarAlCarrito } from "../../auth/useAgregarAlCarrito.js";

const BASE_BUTTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 font-semibold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function etiquetaBoton(enCarrito, agregando, cargando) {
  if (enCarrito) {
    return "En el carrito";
  }

  if (agregando) {
    return "Agregando...";
  }

  if (cargando) {
    return "Cargando carrito...";
  }

  return "Agregar al carrito";
}

function ariaBoton(titulo, enCarrito, agregando, cargando) {
  if (enCarrito) {
    return `${titulo} ya está en el carrito`;
  }

  if (agregando) {
    return `Agregando ${titulo} al carrito`;
  }

  if (cargando) {
    return "Cargando el carrito";
  }

  return `Agregar ${titulo} al carrito`;
}

function clasesBoton(compacto, enCarrito) {
  const tamano = compacto ? "py-2 text-xs" : "py-2.5 text-sm";
  const estado = enCarrito
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
    : "border-indigo-400/40 bg-indigo-500/15 text-indigo-100 hover:border-indigo-300 hover:bg-indigo-500/25";

  return `${BASE_BUTTON} ${tamano} ${estado}`;
}

function IconoCarrito() {
  return (
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
  );
}

function BotonAgregarCarrito({ juego, compacto = false, className = "" }) {
  const {
    enCarrito,
    agregando,
    cargando,
    deshabilitado,
    aviso,
    agregarAlCarrito,
  } = useAgregarAlCarrito(juego.id);
  const titulo = juego.titulo || "videojuego";

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={agregarAlCarrito}
        disabled={deshabilitado}
        aria-label={ariaBoton(titulo, enCarrito, agregando, cargando)}
        className={clasesBoton(compacto, enCarrito)}
      >
        <IconoCarrito />
        {etiquetaBoton(enCarrito, agregando, cargando)}
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
