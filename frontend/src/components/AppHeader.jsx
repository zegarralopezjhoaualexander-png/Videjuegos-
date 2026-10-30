import { Link } from "react-router-dom";

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
          {children}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
