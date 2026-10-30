import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  actualizarJuego,
  crearJuego,
  eliminarJuego,
} from "../api/adminJuegos.js";
import { fetchJuegoById, fetchJuegos } from "../api/juegos.js";
import { useAuth } from "../auth/useAuth.js";
import AppHeader from "../components/AppHeader.jsx";
import AdminJuegoForm from "./AdminJuegoForm.jsx";
import AdminJuegosList from "./AdminJuegosList.jsx";
import { inputClasses } from "./formStyles.js";

function NoPermission() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-bold text-white">
          No tienes permiso para ver esta página
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tu cuenta no tiene el rol de administrador.
        </p>
        <Link
          to="/catalogo"
          className="mt-6 inline-block rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Volver al catálogo
        </Link>
      </section>
    </main>
  );
}

function AdminPanel() {
  const { user, token, signOut } = useAuth();
  const navigate = useNavigate();
  const [juegos, setJuegos] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [listError, setListError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [formMode, setFormMode] = useState(null);
  const [juegoEditando, setJuegoEditando] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleUnauthorized = useCallback(async () => {
    await signOut();
    navigate("/login", {
      replace: true,
      state: { from: "/admin" },
    });
  }, [signOut, navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    fetchJuegos({ signal: controller.signal, token })
      .then((data) => {
        if (!active) {
          return;
        }

        setJuegos(data);
        setListStatus("ready");
      })
      .catch(async (requestError) => {
        if (!active || requestError.name === "AbortError") {
          return;
        }

        if (requestError.status === 401) {
          await handleUnauthorized();
          return;
        }

        setListError(
          requestError.status === 403
            ? "No tienes permiso para ver esta página."
            : requestError.message ||
                "No se pudo cargar la lista de videojuegos."
        );
        setListStatus("error");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, reloadKey, handleUnauthorized]);

  const filteredJuegos = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return juegos;
    }

    return juegos.filter((juego) => juego.titulo.toLowerCase().includes(term));
  }, [juegos, search]);

  const handleRetryList = () => {
    setListStatus("loading");
    setListError("");
    setReloadKey((current) => current + 1);
  };

  const handleNuevo = () => {
    setFormMode("create");
    setJuegoEditando(null);
    setActionError("");
    setNotice("");
  };

  const handleCancelar = () => {
    setFormMode(null);
    setJuegoEditando(null);
    setActionError("");
  };

  const handleEditar = async (juego) => {
    setEditandoId(juego.id);
    setActionError("");
    setNotice("");

    try {
      const detalle = await fetchJuegoById(juego.id, { token });
      setJuegoEditando(detalle);
      setFormMode("edit");
    } catch (requestError) {
      if (requestError?.status === 401) {
        await handleUnauthorized();
        return;
      }

      setActionError(
        requestError?.status === 403
          ? "No tienes permiso para hacer esto."
          : requestError?.message ||
              "No se pudo cargar la información del juego para editar."
      );
    } finally {
      setEditandoId(null);
    }
  };

  const handleGuardar = async (datos) => {
    if (formMode === "edit" && juegoEditando) {
      await actualizarJuego(juegoEditando.id, datos, { token });
      setNotice(`Se actualizó "${datos.nombre}" correctamente.`);
    } else {
      await crearJuego(datos, { token });
      setNotice(`Se creó "${datos.nombre}" correctamente.`);
    }

    setFormMode(null);
    setJuegoEditando(null);
    setActionError("");
    setReloadKey((current) => current + 1);
  };

  const handleEliminar = async (juego) => {
    const confirmado = window.confirm(
      `¿Eliminar "${juego.titulo}"? Esta acción no se puede deshacer.`
    );

    if (!confirmado) {
      return;
    }

    setEliminandoId(juego.id);
    setActionError("");
    setNotice("");

    try {
      await eliminarJuego(juego.id, { token });
      setNotice(`Se eliminó "${juego.titulo}" correctamente.`);
      setReloadKey((current) => current + 1);

      if (juegoEditando?.id === juego.id) {
        setFormMode(null);
        setJuegoEditando(null);
      }
    } catch (requestError) {
      if (requestError?.status === 401) {
        await handleUnauthorized();
        return;
      }

      setActionError(
        requestError?.status === 403
          ? "No tienes permiso para hacer esto."
          : requestError?.message ||
              "No se pudo eliminar el juego. Inténtalo de nuevo."
      );
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <AppHeader subtitle="Administración" user={user}>
        <Link
          to="/catalogo"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Catálogo
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </AppHeader>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Panel de administración
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Administración de videojuegos
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Crea, edita y elimina los juegos del catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNuevo}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            Nuevo juego
          </button>
        </div>

        <section
          aria-label="Buscador de videojuegos"
          className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <div>
            <label
              htmlFor="admin-search"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Buscar por nombre
            </label>
            <input
              id="admin-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre del juego..."
              className={inputClasses(false)}
            />
          </div>

          {listStatus === "ready" && (
            <p className="text-sm text-slate-400">
              {filteredJuegos.length} de {juegos.length} juegos
            </p>
          )}
        </section>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {notice}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {actionError}
          </div>
        )}

        {formMode && (
          <div className="mt-6">
            <AdminJuegoForm
              key={formMode === "edit" ? juegoEditando?.id : "nuevo"}
              juego={juegoEditando}
              esEdicion={formMode === "edit"}
              onGuardar={handleGuardar}
              onCancelar={handleCancelar}
              onUnauthorized={handleUnauthorized}
            />
          </div>
        )}

        {listStatus === "loading" && (
          <div className="mt-6 animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 border-b border-white/5 p-4 last:border-b-0"
              >
                <div className="h-12 w-16 rounded-lg bg-white/10" />
                <div className="h-4 flex-1 rounded bg-white/10" />
                <div className="hidden h-4 w-24 rounded bg-white/10 sm:block" />
              </div>
            ))}
          </div>
        )}

        {listStatus === "error" && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center"
          >
            <h2 className="text-lg font-semibold text-rose-100">
              No pudimos cargar los videojuegos
            </h2>
            <p className="mt-2 text-sm text-rose-200">{listError}</p>
            <button
              type="button"
              onClick={handleRetryList}
              className="mt-5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Reintentar
            </button>
          </div>
        )}

        {listStatus === "ready" && filteredJuegos.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">
              No encontramos videojuegos
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {juegos.length === 0
                ? "Aún no hay juegos registrados. Crea el primero con el botón “Nuevo juego”."
                : "Prueba con otro nombre o limpia el buscador."}
            </p>
          </div>
        )}

        {listStatus === "ready" && filteredJuegos.length > 0 && (
          <AdminJuegosList
            juegos={filteredJuegos}
            editandoId={editandoId}
            eliminandoId={eliminandoId}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>
    </main>
  );
}

function Admin() {
  const { user } = useAuth();

  if (!user?.token) {
    return <Navigate to="/login" replace state={{ from: "/admin" }} />;
  }

  if (user.rol !== "ADMIN") {
    return <NoPermission />;
  }

  return <AdminPanel />;
}

export default Admin;
