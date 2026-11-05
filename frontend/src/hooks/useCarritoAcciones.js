import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import { useCarrito } from "../auth/useCarrito.js";

const MENSAJE_SESION = "Tu sesión expiró. Inicia sesión de nuevo.";

function mensajeError(requestError, fallback) {
  if (requestError?.status === 401) {
    return MENSAJE_SESION;
  }

  return requestError?.message || fallback;
}

export function useCarritoAcciones() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { aplicarCupon, quitarCupon, vaciar, limpiarError } = useCarrito();
  const [codigo, setCodigo] = useState("");
  const [errorCupon, setErrorCupon] = useState("");
  const [avisoCupon, setAvisoCupon] = useState("");
  const [cerrando, setCerrando] = useState(false);

  const handleCodigoChange = (event) => {
    setCodigo(event.target.value);
    setErrorCupon("");
    setAvisoCupon("");
  };

  const ejecutarCupon = useCallback(
    async (accion, mensajeExito, mensajeFallo) => {
      setErrorCupon("");
      setAvisoCupon("");

      try {
        await accion();
        setAvisoCupon(mensajeExito);
        return true;
      } catch (requestError) {
        limpiarError();
        setErrorCupon(mensajeError(requestError, mensajeFallo));
        return false;
      }
    },
    [limpiarError]
  );

  const handleAplicarCupon = async (event) => {
    event.preventDefault();
    const codigoLimpio = codigo.trim();

    if (!codigoLimpio) {
      return;
    }

    const aplicado = await ejecutarCupon(
      () => aplicarCupon(codigoLimpio),
      "Cupón aplicado correctamente.",
      "No se pudo aplicar el cupón. Inténtalo de nuevo."
    );

    if (aplicado) {
      setCodigo("");
    }
  };

  const handleQuitarCupon = () =>
    ejecutarCupon(
      () => quitarCupon(),
      "Cupón quitado correctamente.",
      "No se pudo quitar el cupón. Inténtalo de nuevo."
    );

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
      return;
    }
  };

  const handleLogout = async () => {
    setCerrando(true);
    await signOut();
    navigate("/login", { replace: true });
  };

  return {
    codigo,
    errorCupon,
    avisoCupon,
    cerrando,
    handleCodigoChange,
    handleAplicarCupon,
    handleQuitarCupon,
    handleVaciar,
    handleLogout,
  };
}
