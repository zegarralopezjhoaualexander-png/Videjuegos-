import { Link } from "react-router-dom";
import { PANEL, PRIMARY_BUTTON } from "./carritoStyles.js";

function CarritoVacio() {
  return (
    <section className={`${PANEL} hud-corners mt-6 p-10 text-center`}>
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
          className="size-7 text-indigo-200"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6"
          />
          <circle cx="10" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">
        Tu carrito está vacío
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        Explora el catálogo y agrega tus próximos videojuegos favoritos.
      </p>
      <Link to="/catalogo" className={`${PRIMARY_BUTTON} mt-6`}>
        Ir al catálogo
      </Link>
    </section>
  );
}

export default CarritoVacio;
