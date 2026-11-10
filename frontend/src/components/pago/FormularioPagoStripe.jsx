import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { formatMoney } from "../../utils/format.js";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../carrito/carritoStyles.js";

function FormularioPagoStripe({ codigoOrden, total, onVolver }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [pagando, setPagando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");
  const [errorElemento, setErrorElemento] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || pagando) {
      return;
    }

    setPagando(true);
    setError("");
    setErrorElemento("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Revisa los datos de tu tarjeta.");
        setPagando(false);
        return;
      }

      const returnUrl = `${window.location.origin}/pago-exitoso?codigo=${encodeURIComponent(
        codigoOrden
      )}`;

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: returnUrl },
          redirect: "if_required",
        });

      if (confirmError) {
        const mensaje =
          confirmError.message || "No se pudo completar el pago.";
        if (confirmError.type === "validation_error") {
          setError(mensaje);
          setPagando(false);
          return;
        }

        navigate(
          `/pago-error?codigo=${encodeURIComponent(
            codigoOrden
          )}&motivo=${encodeURIComponent(mensaje)}`
        );
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing")
      ) {
        navigate(`/pago-exitoso?codigo=${encodeURIComponent(codigoOrden)}`);
        return;
      }

      navigate(
        `/pago-error?codigo=${encodeURIComponent(
          codigoOrden
        )}&motivo=${encodeURIComponent(
          "El pago requiere una acción adicional. Inténtalo de nuevo."
        )}`
      );
    } catch {
      setError("Ocurrió un error inesperado al procesar el pago.");
      setPagando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement
        options={{ layout: "tabs" }}
        onReady={() => setListo(true)}
        onChange={(event) => setErrorElemento(event.error?.message || "")}
      />

      {errorElemento && (
        <p role="alert" className="text-sm text-rose-300">
          {errorElemento}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}

      <p className="text-xs leading-5 text-slate-500">
        Los datos de tu tarjeta son procesados directamente por Stripe y nunca
        pasan por nuestro servidor.
      </p>

      <button
        type="submit"
        disabled={!stripe || !elements || !listo || pagando}
        aria-busy={pagando}
        className={`${PRIMARY_BUTTON} w-full py-3 text-base`}
      >
        {pagando ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent motion-reduce:animate-none"
            />
            Procesando pago...
          </span>
        ) : (
          `Pagar ${formatMoney(total)}`
        )}
      </button>

      <button
        type="button"
        onClick={onVolver}
        disabled={pagando}
        className={`${SECONDARY_BUTTON} w-full`}
      >
        Cambiar método o tarjeta de regalo
      </button>
    </form>
  );
}

export default FormularioPagoStripe;
