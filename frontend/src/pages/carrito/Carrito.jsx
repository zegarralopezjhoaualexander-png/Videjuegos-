import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resolvePublicImage } from "../../api/juegos.js";
import { useAuth } from "../../auth/useAuth.js";
import { useCarrito } from "../../auth/useCarrito.js";
import AppHeader from "../../components/layout/AppHeader.jsx";
import { inputClasses } from "../../styles/formStyles.js";
import { formatMoney, getInitials } from "../../utils/format.js";

const PANEL = "neon-panel p-5 sm:p-6";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";
const PRIMARY_BUTTON =
  "inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

function CarritoItemRow({ item, quitando, onQuitar }) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(item.imagen) && !imageError;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-indigo-500/30 via-slate-900 to-fuchsia-500/30 sm:w-40">
        {showImage ? (
          <img
            src={resolvePublicImage(item.imagen)}
            alt={`Portada de ${item.titulo}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-black tracking-widest text-white/70">
            {getInitials(item.titulo || "Juego")}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-base font-semibold text-white">
          {item.titulo || "Juego sin título"}
        </h2>
        <p className="mt-2 text-sm font-semibold text-indigo-200">
          {formatMoney(item.precio)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onQuitar(item.juegoId)}
        disabled={quitando}
        aria-label={`Quitar ${item.titulo || "videojuego"} del carrito`}
        className={`${SECONDARY_BUTTON} border-rose-400/20 text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-100 sm:shrink-0`}
      >
        {quitando ? "Quitando..." : "Quitar"}
      </button>
    </li>
  );
}

function ResumenCarrito({ resumen, quitandoCupon, onQuitarCupon }) {
  return (
    <aside
      className={`${PANEL} hud-corners lg:sticky lg:top-24`}
      aria-labelledby="resumen-carrito"
    >
      <h2 id="resumen-carrito" className="text-lg font-semibold text-white">
        Resumen
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Subtotal</dt>
          <dd className="font-semibold text-slate-100">
            {formatMoney(resumen.subtotal)}
          </dd>
        </div>

        {resumen.cuponCodigo && (
          <div className="flex items-start justify-between gap-3">
            <dt className="text-emerald-200">
              Descuento ({resumen.cuponCodigo})
            </dt>
            <dd className="text-right">
              <span className="block font-semibold text-emerald-200">
                -{formatMoney(resumen.descuento)}
              </span>
              <button
                type="button"
                onClick={onQuitarCupon}
                disabled={quitandoCupon}
                aria-label={`Quitar cupón ${resumen.cuponCodigo}`}
                className="mt-1 text-xs font-semibold text-rose-200 underline-offset-2 hover:text-rose-100 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {quitandoCupon ? "Quitando..." : "Quitar cupón"}
              </button>
            </dd>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Impuesto</dt>
          <dd className="font-semibold text-slate-100">
            {formatMoney(resumen.impuesto)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <dt className="text-base font-semibold text-white">Total</dt>
          <dd className="text-xl font-bold text-fuchsia-200">
            {formatMoney(resumen.total)}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        disabled
        aria-label="Continuar al pago, próximamente"
        className={`${PRIMARY_BUTTON} mt-5 w-full`}
      >
        <span className="flex flex-col items-center gap-0.5">
          <span>Continuar al pago</span>
          <span className="text-xs font-normal tracking-normal">
            Próximamente
          </span>
        </span>
      </button>
    </aside>
  );
}

function CarritoSkeleton() {
  return (
    <div
      className="mt-6 grid animate-pulse gap-6 motion-reduce:animate-none lg:grid-cols-[minmax(0,1fr)_360px]"
      role="status"
      aria-label="Cargando carrito"
    >
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-32 rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-white/10 bg-white/5" />
      <span className="sr-only">Cargando tu carrito...</span>
    </div>
  );
}

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

function Carrito() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    resumen,
    items,
    cantidadItems,
    cargando,
    accion,
    error,
    quitar,
    aplicarCupon,
    quitarCupon,
    vaciar,
    recargar,
    limpiarError,
  } = useCarrito();

  const [codigo, setCodigo] = useState("");
  const [errorCupon, setErrorCupon] = useState("");
  const [avisoCupon, setAvisoCupon] = useState("");
  const [cerrando, setCerrando] = useState(false);

  const aplicandoCupon = accion === "cupon";
  const quitandoCupon = accion === "quitar-cupon";
  const vaciando = accion === "vaciar";

  const handleAplicarCupon = async (event) => {
    event.preventDefault();
    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
      return;
    }

    setErrorCupon("");
    setAvisoCupon("");

    try {
      await aplicarCupon(codigoLimpio);
      setCodigo("");
      setAvisoCupon("Cupón aplicado correctamente.");
    } catch (requestError) {
      limpiarError();
      setErrorCupon(
        requestError?.status === 401
          ? "Tu sesión expiró. Inicia sesión de nuevo."
          : requestError?.message ||
              "No se pudo aplicar el cupón. Inténtalo de nuevo."
      );
    }
  };

  const handleQuitarCupon = async () => {
    setErrorCupon("");
    setAvisoCupon("");

    try {
      await quitarCupon();
      setAvisoCupon("Cupón quitado correctamente.");
    } catch (requestError) {
      limpiarError();
      setErrorCupon(
        requestError?.status === 401
          ? "Tu sesión expiró. Inicia sesión de nuevo."
          : requestError?.message ||
              "No se pudo quitar el cupón. Inténtalo de nuevo."
      );
    }
  };

  const handleVaciar = async () => {
    const confirmado = window.confirm(
      "¿Vaciar el carrito? Se quitarán todos los videojuegos y el cupón aplicado."
    );

    if (!confirmado) {
      return;
    }

    try {
      await vaciar();
      setErrorCupon("");
      setAvisoCupon("");
      setCodigo("");
    } catch {
      // El proveedor conserva el mensaje de error para mostrarlo arriba.
    }
  };

  const handleLogout = async () => {
    setCerrando(true);
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <AppHeader subtitle="Carrito" user={user}>
        <Link to="/catalogo" className={SECONDARY_BUTTON}>
          Catálogo
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={cerrando}
          className={SECONDARY_BUTTON}
        >
          {cerrando ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </AppHeader>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
              Tu compra
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Carrito de compras
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Revisa tus videojuegos, aplica un cupón y confirma el monto antes
              de pagar.
            </p>
          </div>

          {!cargando && cantidadItems > 0 && (
            <p className="text-sm text-slate-400" aria-live="polite">
              {cantidadItems === 1
                ? "1 artículo en el carrito"
                : `${cantidadItems} artículos en el carrito`}
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-col gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>
            <div className="flex shrink-0 gap-2">
              {items.length === 0 && (
                <button
                  type="button"
                  onClick={recargar}
                  className={SECONDARY_BUTTON}
                >
                  Reintentar
                </button>
              )}
              <button
                type="button"
                onClick={limpiarError}
                aria-label="Cerrar mensaje de error"
                className={SECONDARY_BUTTON}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {cargando && <CarritoSkeleton />}

        {!cargando && !error && items.length === 0 && <CarritoVacio />}

        {!cargando && items.length > 0 && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section aria-labelledby="items-carrito">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="items-carrito" className="text-lg font-semibold text-white">
                  Videojuegos
                </h2>
                <button
                  type="button"
                  onClick={handleVaciar}
                  disabled={vaciando}
                  aria-label="Vaciar carrito de compras"
                  className={`${SECONDARY_BUTTON} border-rose-400/20 text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-100`}
                >
                  {vaciando ? "Vaciando..." : "Vaciar carrito"}
                </button>
              </div>

              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <CarritoItemRow
                    key={item.juegoId}
                    item={item}
                    quitando={accion === `quitar:${item.juegoId}`}
                    onQuitar={quitar}
                  />
                ))}
              </ul>

              <section className={`${PANEL} mt-6`} aria-labelledby="cupon-titulo">
                <h2 id="cupon-titulo" className="text-lg font-semibold text-white">
                  Cupón de descuento
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Ingresa un código promocional para aplicarlo al total.
                </p>

                <form
                  onSubmit={handleAplicarCupon}
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                  <label htmlFor="codigo-cupon" className="sr-only">
                    Código de descuento
                  </label>
                  <input
                    id="codigo-cupon"
                    type="text"
                    value={codigo}
                    onChange={(event) => {
                      setCodigo(event.target.value);
                      setErrorCupon("");
                      setAvisoCupon("");
                    }}
                    placeholder="Ej. BIENVENIDO10"
                    autoComplete="off"
                    aria-invalid={Boolean(errorCupon)}
                    aria-describedby={
                      errorCupon ? "cupon-error" : undefined
                    }
                    className={`${inputClasses(Boolean(errorCupon))} motion-reduce:transition-none`}
                  />
                  <button
                    type="submit"
                    disabled={!codigo.trim() || aplicandoCupon}
                    aria-label="Aplicar cupón de descuento"
                    className={`${PRIMARY_BUTTON} sm:shrink-0`}
                  >
                    {aplicandoCupon ? "Aplicando..." : "Aplicar"}
                  </button>
                </form>

                {errorCupon && (
                  <p
                    id="cupon-error"
                    role="alert"
                    className="mt-2 text-sm text-rose-300"
                  >
                    {errorCupon}
                  </p>
                )}
                {avisoCupon && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-2 text-sm text-emerald-200"
                  >
                    {avisoCupon}
                  </p>
                )}
              </section>
            </section>

            <ResumenCarrito
              resumen={resumen}
              quitandoCupon={quitandoCupon}
              onQuitarCupon={handleQuitarCupon}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default Carrito;
