import { Link } from "react-router-dom";
import { useCarrito } from "../../auth/useCarrito.js";

function UserSummary({ user }) {
  return (
    <div className="hidden text-right sm:block">
      <p className="text-xs text-slate-500">Sesión iniciada</p>
      <p className="max-w-[220px] truncate text-sm text-slate-300">
        {user?.nombre || "Jugador"}
      </p>
      {user?.rol && (
        <p className="text-[10px] font-semibold tracking-wide text-indigo-300 uppercase">
          {user.rol}
        </p>
      )}
    </div>
  );
}

function CartLink() {
  const { cantidadItems } = useCarrito();
  const contador = cantidadItems > 99 ? "99+" : cantidadItems;

  return (
    <Link
      to="/carrito"
      aria-label={`Carrito de compras, ${cantidadItems} ${
        cantidadItems === 1 ? "artículo" : "artículos"
      }`}
      className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 motion-reduce:transition-none"
    >
      <span className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 7H6"
          />
          <circle cx="10" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
        </svg>
        {cantidadItems > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-2 -right-2 grid min-w-4 place-items-center rounded-full bg-fuchsia-500 px-1 text-[10px] leading-4 font-bold text-white"
          >
            {contador}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">Carrito</span>
    </Link>
  );
}

function AppHeader({ subtitle, user, children }) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          to="/catalogo"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-xs font-black text-white">
            VJ
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Videojuegos
            </p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <UserSummary user={user} />
          <CartLink />
          {children}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
