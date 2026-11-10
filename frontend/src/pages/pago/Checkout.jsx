import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  crearPagoIntent,
  obtenerConfiguracionPago,
  pagarConYape,
  verificarTarjetaRegalo,
} from "../../api/pagos.js";
import { useAuth } from "../../auth/useAuth.js";
import { useCarrito } from "../../auth/useCarrito.js";
import AppHeader from "../../components/layout/AppHeader.jsx";
import CarritoError from "../../components/carrito/CarritoError.jsx";
import CarritoSkeleton from "../../components/carrito/CarritoSkeleton.jsx";
import CarritoVacio from "../../components/carrito/CarritoVacio.jsx";
import {
  PANEL,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../../components/carrito/carritoStyles.js";
import FormularioPagoStripe from "../../components/pago/FormularioPagoStripe.jsx";
import FormularioYape from "../../components/pago/FormularioYape.jsx";
import MetodoPagoSelector from "../../components/pago/MetodoPagoSelector.jsx";
import ResumenPago from "../../components/pago/ResumenPago.jsx";
import { inputClasses } from "../../styles/formStyles.js";
import { formatMoney } from "../../utils/format.js";
import {
  METODO_BILLETERA,
  METODO_REGALO,
  METODO_TARJETA,
  METODO_YAPE,
} from "../../utils/pago.js";

const STRIPE_KEY = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "").trim();
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

const APARIENCIA = {
  theme: "night",
  variables: {
    colorPrimary: "#818cf8",
    colorBackground: "#0f172a",
    colorText: "#e2e8f0",
    colorDanger: "#fb7185",
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    borderRadius: "12px",
  },
};

const PATRON_REGALO = /^[A-Za-z0-9-]{4,50}$/;

function Encabezado() {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
        Pago seguro
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white">Finalizar compra</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">
        Elige cómo quieres pagar. Puedes usar Yape, tarjeta o el saldo de una
        tarjeta de regalo. El total se calcula siempre en el servidor.
      </p>
    </div>
  );
}

function BloqueCodigo({
  codigo,
  onCodigoChange,
  onSubmit,
  aplicando,
  error,
  aviso,
  tarjetaRegalo,
  disabled,
}) {
  return (
    <section className={`${PANEL} mt-4`} aria-labelledby="codigo-titulo">
      <h2 id="codigo-titulo" className="text-lg font-semibold text-white">
        Código de regalo o cupón
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Aplica un cupón o el saldo de una tarjeta de regalo antes de pagar.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="codigo-regalo" className="sr-only">
          Código de regalo o cupón
        </label>
        <input
          id="codigo-regalo"
          type="text"
          value={codigo}
          onChange={(event) => onCodigoChange(event.target.value)}
          placeholder="Ej. REGALO50 o BIENVENIDO10"
          autoComplete="off"
          disabled={disabled || aplicando}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "codigo-regalo-error" : "codigo-regalo-ayuda"}
          className={`${inputClasses(Boolean(error))} motion-reduce:transition-none`}
        />
        <button
          type="submit"
          disabled={disabled || aplicando}
          aria-label="Aplicar código de regalo o cupón"
          className={`${PRIMARY_BUTTON} sm:shrink-0`}
        >
          {aplicando ? (
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent motion-reduce:animate-none"
              />
              Aplicando...
            </span>
          ) : (
            "Aplicar"
          )}
        </button>
      </form>

      <p id="codigo-regalo-ayuda" className="mt-2 text-xs text-slate-500">
        El cupón se descuenta del carrito. El saldo de la tarjeta de regalo se
        aplica al total del pago.
      </p>

      {tarjetaRegalo && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-sm text-emerald-200"
        >
          Tarjeta de regalo{" "}
          <span className="font-semibold">{tarjetaRegalo.codigo}</span> aplicada
          con saldo de {formatMoney(tarjetaRegalo.saldo)}.
        </p>
      )}

      {aviso && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-sm text-emerald-200"
        >
          {aviso}
        </p>
      )}

      {error && (
        <p id="codigo-regalo-error" role="alert" className="mt-2 text-sm text-rose-300">
          {error}
        </p>
      )}
    </section>
  );
}

function BotonProcesando({ texto = "Preparando pago..." }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent motion-reduce:animate-none"
      />
      {texto}
    </span>
  );
}

function ContinuarPago({ total, onContinuar, preparando, error }) {
  return (
    <section className={`${PANEL} mt-4`} aria-labelledby="tarjeta-titulo">
      <h2 id="tarjeta-titulo" className="text-lg font-semibold text-white">
        Pago con tarjeta o billetera
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        El formulario seguro de Stripe se mostrará en el siguiente paso. Tus
        datos de tarjeta nunca pasan por nuestro servidor.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onContinuar}
        disabled={preparando}
        aria-busy={preparando}
        className={`${PRIMARY_BUTTON} mt-4 w-full py-3 text-base`}
      >
        {preparando ? (
          <BotonProcesando />
        ) : (
          `Continuar al pago · ${formatMoney(total)}`
        )}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        ¿Quieres revisar tu carrito?{" "}
        <Link
          to="/carrito"
          className="font-semibold text-indigo-300 hover:text-indigo-200"
        >
          Volver al carrito
        </Link>
      </p>
    </section>
  );
}

function PagoConSaldo({ total, saldo, onPagar, preparando, error }) {
  return (
    <section className={`${PANEL} mt-4`} aria-labelledby="saldo-titulo">
      <h2 id="saldo-titulo" className="text-lg font-semibold text-white">
        Paga con el saldo de tu tarjeta de regalo
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        El saldo disponible cubre el total de la compra. No se realizará ningún
        cobro adicional.
      </p>

      <dl className="mt-4 grid gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Saldo disponible
          </dt>
          <dd className="mt-1 text-lg font-bold text-emerald-200">
            {formatMoney(saldo)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Total a pagar
          </dt>
          <dd className="mt-1 text-lg font-bold text-white">
            {formatMoney(total)}
          </dd>
        </div>
      </dl>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onPagar}
        disabled={preparando}
        aria-busy={preparando}
        className={`${PRIMARY_BUTTON} mt-4 w-full py-3 text-base`}
      >
        {preparando ? (
          <BotonProcesando texto="Canjeando saldo..." />
        ) : (
          `Pagar ${formatMoney(total)} con saldo`
        )}
      </button>
    </section>
  );
}

function PasoStripe({ intento, onVolver }) {
  const opciones = useMemo(
    () => ({
      clientSecret: intento.clientSecret,
      appearance: APARIENCIA,
    }),
    [intento.clientSecret]
  );

  return (
    <section className={`${PANEL} mt-4`} aria-labelledby="stripe-pago-titulo">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="stripe-pago-titulo" className="text-lg font-semibold text-white">
            Confirma tu pago
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Orden{" "}
            <span className="font-semibold text-indigo-200">
              {intento.codigoOrden}
            </span>
          </p>
        </div>
        <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
          Pago pendiente
        </span>
      </div>

      {stripePromise ? (
        <Elements key={intento.clientSecret} stripe={stripePromise} options={opciones}>
          <FormularioPagoStripe
            codigoOrden={intento.codigoOrden}
            total={intento.total}
            onVolver={onVolver}
          />
        </Elements>
      ) : (
        <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p className="font-semibold">Falta configurar Stripe en el frontend.</p>
          <p className="mt-1">
            Define <code>VITE_STRIPE_PUBLISHABLE_KEY</code> con tu clave pública
            de prueba y reinicia el servidor de Vite.
          </p>
          <button type="button" onClick={onVolver} className={`${SECONDARY_BUTTON} mt-3`}>
            Volver a los datos de pago
          </button>
        </div>
      )}
    </section>
  );
}

function CheckoutContenido() {
  const { token } = useAuth();
  const {
    resumen,
    items,
    cargando,
    error: carritoError,
    recargar,
    limpiarError,
    aplicarCupon,
  } = useCarrito();
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState(METODO_TARJETA);
  const [codigo, setCodigo] = useState("");
  const [tarjetaRegalo, setTarjetaRegalo] = useState(null);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [avisoCodigo, setAvisoCodigo] = useState("");
  const [aplicandoCodigo, setAplicandoCodigo] = useState(false);
  const [error, setError] = useState("");
  const [preparando, setPreparando] = useState(false);
  const [intento, setIntento] = useState(null);
  const [tipoCambio, setTipoCambio] = useState(3.75);
  const [yapeEstado, setYapeEstado] = useState("idle");
  const [yapeError, setYapeError] = useState("");
  const [yapeResultado, setYapeResultado] = useState(null);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let activo = true;
    obtenerConfiguracionPago({ token })
      .then((data) => {
        if (activo && data.tipoCambioPen > 0) {
          setTipoCambio(data.tipoCambioPen);
        }
      })
      .catch(() => {
        // Se mantiene el tipo de cambio por defecto mostrado en pantalla.
      });

    return () => {
      activo = false;
    };
  }, [token]);

  const saldoRegalo = tarjetaRegalo?.saldo ?? 0;
  const descuentoRegaloLocal = Math.min(saldoRegalo, resumen.total);
  const totalConRegalo = Math.max(0, resumen.total - descuentoRegaloLocal);
  const totalMostrado =
    intento?.total ?? yapeResultado?.total ?? totalConRegalo;
  const descuentoMostrado =
    intento?.descuentoRegalo ??
    yapeResultado?.descuentoRegalo ??
    descuentoRegaloLocal;

  const bloqueado =
    preparando ||
    aplicandoCodigo ||
    yapeEstado === "procesando" ||
    yapeEstado === "aprobado";

  const handleMetodoChange = (nuevoMetodo) => {
    setMetodo(nuevoMetodo);
    setError("");
    setIntento(null);
    setYapeEstado("idle");
    setYapeError("");
    setYapeResultado(null);
  };

  const handleCodigoChange = (valor) => {
    setCodigo(valor);
    setErrorCodigo("");
    setAvisoCodigo("");

    if (
      tarjetaRegalo &&
      valor.trim().toUpperCase() !== tarjetaRegalo.codigo.toUpperCase()
    ) {
      setTarjetaRegalo(null);
      if (metodo === METODO_REGALO) {
        setMetodo(METODO_TARJETA);
        setIntento(null);
      }
    }
  };

  const handleAplicarCodigo = async (event) => {
    event.preventDefault();
    const valor = codigo.trim();

    if (!valor) {
      setErrorCodigo("Ingresa un código de regalo o cupón.");
      return;
    }

    if (!PATRON_REGALO.test(valor)) {
      setErrorCodigo(
        "El código debe tener entre 4 y 50 caracteres (letras, números o guiones)."
      );
      return;
    }

    setAplicandoCodigo(true);
    setErrorCodigo("");
    setAvisoCodigo("");
    setError("");

    try {
      const tarjeta = await verificarTarjetaRegalo(valor, { token });
      setTarjetaRegalo(tarjeta);
      setAvisoCodigo(
        tarjeta.saldo >= resumen.total
          ? "El saldo de la tarjeta cubre el total de la compra."
          : "El saldo de la tarjeta se descontará del total."
      );
      if (metodo === METODO_REGALO && tarjeta.saldo < resumen.total) {
        setMetodo(METODO_TARJETA);
        setIntento(null);
      }
    } catch (giftError) {
      if (giftError.status === 404) {
        try {
          await aplicarCupon(valor);
          setTarjetaRegalo(null);
          setAvisoCodigo("Cupón aplicado correctamente.");
          if (metodo === METODO_REGALO) {
            setMetodo(METODO_TARJETA);
            setIntento(null);
          }
        } catch (couponError) {
          setErrorCodigo(
            couponError?.message ||
              "No encontramos ese código de regalo o cupón."
          );
        }
      } else {
        setErrorCodigo(
          giftError?.message || "No se pudo validar el código de regalo."
        );
      }
    } finally {
      setAplicandoCodigo(false);
    }
  };

  const handleContinuar = async () => {
    if (preparando) {
      return;
    }

    setError("");
    setErrorCodigo("");
    setPreparando(true);

    try {
      const data = await crearPagoIntent(
        {
          metodo,
          codigoTarjetaRegalo: tarjetaRegalo?.codigo ?? null,
        },
        { token }
      );

      if (!data.requierePago || !data.clientSecret) {
        recargar();
        navigate(`/pago-exitoso?codigo=${encodeURIComponent(data.codigoOrden)}`);
        return;
      }

      setIntento(data);
    } catch (requestError) {
      const mensaje =
        requestError?.message ||
        "No se pudo preparar el pago. Inténtalo de nuevo.";
      if (metodo !== METODO_REGALO && /regalo/i.test(mensaje)) {
        setErrorCodigo(mensaje);
      } else {
        setError(mensaje);
      }
    } finally {
      setPreparando(false);
    }
  };

  const handlePagarYape = async ({ celular, codigoAprobacion }) => {
    if (yapeEstado === "procesando") {
      return;
    }

    setYapeEstado("procesando");
    setYapeError("");

    try {
      const data = await pagarConYape(
        {
          celular,
          codigoAprobacion,
          codigoTarjetaRegalo: tarjetaRegalo?.codigo ?? null,
        },
        { token }
      );

      setYapeResultado(data);
      setYapeEstado("aprobado");
    } catch (requestError) {
      setYapeEstado("rechazado");
      setYapeError(
        requestError?.message ||
          "No se pudo completar el pago con Yape. Inténtalo de nuevo."
      );
    }
  };

  const handleVolver = () => {
    setIntento(null);
    setError("");
    setErrorCodigo("");
  };

  const handleVerComprobante = () => {
    if (!yapeResultado?.codigoOrden) {
      return;
    }
    navigate(
      `/pago-exitoso?codigo=${encodeURIComponent(yapeResultado.codigoOrden)}`
    );
  };

  if (cargando) {
    return <CarritoSkeleton />;
  }

  if (carritoError && items.length === 0) {
    return (
      <CarritoError
        error={carritoError}
        mostrarReintentar
        onReintentar={recargar}
        onCerrar={limpiarError}
      />
    );
  }

  if (items.length === 0) {
    return <CarritoVacio />;
  }

  return (
    <>
      <Encabezado />

      {carritoError && (
        <CarritoError
          error={carritoError}
          mostrarReintentar={false}
          onCerrar={limpiarError}
        />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <section className={PANEL} aria-labelledby="metodo-pago-titulo">
            <h2
              id="metodo-pago-titulo"
              className="text-lg font-semibold text-white"
            >
              Datos de pago
            </h2>
            <MetodoPagoSelector
              valor={metodo}
              onChange={handleMetodoChange}
              disabled={bloqueado}
              saldoRegalo={saldoRegalo}
              total={resumen.total}
            />
          </section>

          <BloqueCodigo
            codigo={codigo}
            onCodigoChange={handleCodigoChange}
            onSubmit={handleAplicarCodigo}
            aplicando={aplicandoCodigo}
            error={errorCodigo}
            aviso={avisoCodigo}
            tarjetaRegalo={tarjetaRegalo}
            disabled={bloqueado}
          />

          <div key={`${metodo}-${intento ? "stripe" : "inicio"}`} className="pago-aparecer">
            {metodo === METODO_YAPE && (
              <FormularioYape
                total={totalMostrado}
                tipoCambio={tipoCambio}
                estado={yapeEstado}
                error={yapeError}
                resultado={yapeResultado}
                onPagar={handlePagarYape}
                onVerComprobante={handleVerComprobante}
                onVolver={handleVolver}
              />
            )}

            {metodo === METODO_REGALO && (
              <PagoConSaldo
                total={totalMostrado}
                saldo={saldoRegalo}
                onPagar={handleContinuar}
                preparando={preparando}
                error={error}
              />
            )}

            {(metodo === METODO_TARJETA || metodo === METODO_BILLETERA) &&
              (intento ? (
                <PasoStripe intento={intento} onVolver={handleVolver} />
              ) : (
                <ContinuarPago
                  total={totalMostrado}
                  onContinuar={handleContinuar}
                  preparando={preparando}
                  error={error}
                />
              ))}
          </div>
        </div>

        <ResumenPago
          items={items}
          resumen={resumen}
          descuentoRegalo={descuentoMostrado}
          total={totalMostrado}
          totalPen={
            metodo === METODO_YAPE || yapeResultado
              ? totalMostrado * tipoCambio
              : null
          }
          tipoCambio={tipoCambio}
        />
      </div>
    </>
  );
}

function Checkout() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <AppHeader subtitle="Checkout" user={user} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CheckoutContenido />
      </div>
    </main>
  );
}

export default Checkout;
