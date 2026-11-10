import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import AppHeader from "../../components/layout/AppHeader.jsx";
import {
  PANEL,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../../components/carrito/carritoStyles.js";

function PagoError() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get("codigo");
  const motivo = searchParams.get("motivo");

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <AppHeader subtitle="Pago fallido" user={user} />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section className={`${PANEL} hud-corners text-center`}>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="size-7 text-rose-200"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.3 4.6 2.8 17.5A1.5 1.5 0 0 0 4.1 20h15.8a1.5 1.5 0 0 0 1.3-2.5L13.7 4.6a1.5 1.5 0 0 0-2.6 0Z"
              />
            </svg>
          </div>

          <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-rose-300 uppercase">
            Pago no completado
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            No pudimos procesar tu pago
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            {motivo ||
              "Stripe rechazó el pago o se canceló el proceso. Puedes revisar tus datos e intentarlo de nuevo."}
          </p>

          {codigo && (
            <p className="mt-4 text-sm text-slate-300">
              Orden{" "}
              <span className="font-semibold text-indigo-200">{codigo}</span>
            </p>
          )}

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to="/checkout" className={PRIMARY_BUTTON}>
              Reintentar pago
            </Link>
            <Link to="/carrito" className={SECONDARY_BUTTON}>
              Volver al carrito
            </Link>
            <Link to="/catalogo" className={SECONDARY_BUTTON}>
              Ir al catálogo
            </Link>
          </div>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            Si el problema continúa, verifica los datos de tu tarjeta o usa otro
            método de pago. No se realizó ningún cobro si el pago fue rechazado.
          </p>
        </section>
      </div>
    </main>
  );
}

export default PagoError;
