import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { obtenerComprobante } from "../../api/pagos.js";
import { useAuth } from "../../auth/useAuth.js";
import { useCarrito } from "../../auth/useCarrito.js";
import AppHeader from "../../components/layout/AppHeader.jsx";
import {
  PANEL,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../../components/carrito/carritoStyles.js";
import ComprobanteOrden from "../../components/pago/ComprobanteOrden.jsx";

function CargandoComprobante() {
  return (
    <section className={`${PANEL} mt-6`} role="status" aria-live="polite">
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="h-5 w-48 rounded bg-white/10" />
        <div className="mt-4 h-24 rounded-xl bg-white/5" />
        <div className="mt-4 h-32 rounded-xl bg-white/5" />
      </div>
      <span className="sr-only">Cargando comprobante...</span>
    </section>
  );
}

function PagoEnProceso({ codigo, onRefrescar }) {
  return (
    <section className={`${PANEL} hud-corners mt-6 text-center`}>
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10">
        <span className="size-6 animate-spin rounded-full border-2 border-amber-200 border-t-transparent motion-reduce:animate-none" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">
        Estamos confirmando tu pago
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
        Stripe ya recibió tu pago. Estamos esperando la confirmación del webhook
        para generar tu comprobante digital.
      </p>
      <p className="mt-4 text-sm text-slate-300">
        Orden <span className="font-semibold text-indigo-200">{codigo}</span>
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <button type="button" onClick={onRefrescar} className={PRIMARY_BUTTON}>
          Actualizar estado
        </button>
        <Link to="/catalogo" className={SECONDARY_BUTTON}>
          Volver al catálogo
        </Link>
      </div>
    </section>
  );
}

function ErrorComprobante({ mensaje, onReintentar }) {
  return (
    <section
      className={`${PANEL} mt-6 border-rose-400/30 bg-rose-500/10`}
      role="alert"
    >
      <h2 className="text-xl font-semibold text-white">
        No pudimos cargar el comprobante
      </h2>
      <p className="mt-2 text-sm text-rose-200">{mensaje}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={onReintentar} className={PRIMARY_BUTTON}>
          Reintentar
        </button>
        <Link to="/catalogo" className={SECONDARY_BUTTON}>
          Volver al catálogo
        </Link>
      </div>
    </section>
  );
}

function PagoExitosoContenido() {
  const { token } = useAuth();
  const { recargar } = useCarrito();
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get("codigo") ?? "";
  const redirectStatus = searchParams.get("redirect_status");
  const [comprobante, setComprobante] = useState(null);
  const [cargando, setCargando] = useState(Boolean(codigo));
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    if (!codigo || !token) {
      return undefined;
    }

    let activo = true;
    let temporizador = null;
    let intentos = 0;

    const cargar = async () => {
      try {
        const data = await obtenerComprobante(codigo, { token });
        if (!activo) {
          return;
        }

        setComprobante(data);
        setCargando(false);
        setError("");

        if (data.estado === "PENDIENTE" && intentos < 15) {
          intentos += 1;
          temporizador = window.setTimeout(cargar, 2000);
        }
      } catch (requestError) {
        if (!activo) {
          return;
        }

        setError(
          requestError?.message ||
            "No se pudo cargar el comprobante. Inténtalo de nuevo."
        );
        setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
      if (temporizador) {
        window.clearTimeout(temporizador);
      }
    };
  }, [codigo, token, recarga]);

  useEffect(() => {
    if (comprobante?.estado === "PAGADA") {
      recargar();
    }
  }, [comprobante?.estado, recargar]);

  if (redirectStatus === "failed") {
    return (
      <Navigate
        to={`/pago-error?codigo=${encodeURIComponent(codigo)}`}
        replace
      />
    );
  }

  if (!codigo) {
    return (
      <ErrorComprobante
        mensaje="No encontramos el código de la orden en la dirección. Vuelve al carrito para intentarlo de nuevo."
        onReintentar={() => setRecarga((valor) => valor + 1)}
      />
    );
  }

  if (cargando) {
    return <CargandoComprobante />;
  }

  if (error) {
    return (
      <ErrorComprobante
        mensaje={error}
        onReintentar={() => {
          setError("");
          setCargando(true);
          setRecarga((valor) => valor + 1);
        }}
      />
    );
  }

  if (comprobante?.estado === "PENDIENTE") {
    return (
      <PagoEnProceso
        codigo={comprobante.codigoOrden}
        onRefrescar={() => {
          setCargando(true);
          setRecarga((valor) => valor + 1);
        }}
      />
    );
  }

  if (comprobante?.estado === "FALLIDA") {
    return (
      <section className={`${PANEL} mt-6 border-rose-400/30 bg-rose-500/10`}>
        <h2 className="text-xl font-semibold text-white">El pago no se completó</h2>
        <p className="mt-2 text-sm text-rose-200">
          La orden <span className="font-semibold">{comprobante.codigoOrden}</span>{" "}
          quedó registrada como fallida.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/pago-error?codigo=${encodeURIComponent(comprobante.codigoOrden)}`}
            className={PRIMARY_BUTTON}
          >
            Ver opciones de reintento
          </Link>
          <Link to="/catalogo" className={SECONDARY_BUTTON}>
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }

  if (!comprobante) {
    return (
      <ErrorComprobante
        mensaje="No encontramos el comprobante de esta orden."
        onReintentar={() => setRecarga((valor) => valor + 1)}
      />
    );
  }

  return (
    <>
      <div className="mt-2 print:hidden">
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300 uppercase">
          Compra completada
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">¡Gracias por tu compra!</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tu comprobante digital está listo. También enviamos la confirmación a
          tu correo.
        </p>
      </div>

      <div className="mt-6">
        <ComprobanteOrden comprobante={comprobante} />
      </div>

      <div className="mt-5 flex flex-col gap-2 print:hidden sm:flex-row">
        <Link to="/catalogo" className={PRIMARY_BUTTON}>
          Seguir comprando
        </Link>
        <Link to="/carrito" className={SECONDARY_BUTTON}>
          Ir al carrito
        </Link>
      </div>
    </>
  );
}

function PagoExitoso() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <AppHeader subtitle="Pago exitoso" user={user} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <PagoExitosoContenido />
      </div>
    </main>
  );
}

export default PagoExitoso;
