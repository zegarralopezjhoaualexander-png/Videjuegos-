import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { esRutaInterna } from "../utils/routing.js";
import { useAuth } from "./useAuth.js";
import { useCarrito } from "./useCarrito.js";

const MENSAJE_POSEIDO =
  "Ya posees este videojuego. Revísalo en tu biblioteca.";
const MENSAJE_FALLO = "No se pudo agregar el videojuego al carrito.";

function mensajeAviso(mensaje) {
  if (/posees/i.test(mensaje)) {
    return MENSAJE_POSEIDO;
  }

  return mensaje || MENSAJE_FALLO;
}

export function useAgregarAlCarrito(juegoId) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, signOut } = useAuth();
  const { agregar, estaEnCarrito, accion, cargando, limpiarError } =
    useCarrito();
  const [aviso, setAviso] = useState("");
  const [exito, setExito] = useState(false);

  const enCarrito = estaEnCarrito(juegoId);
  const agregando = accion === `agregar:${juegoId}`;
  const deshabilitado = enCarrito || agregando || cargando;

  const volverAlLogin = useCallback(async () => {
    const desde = `${location.pathname}${location.search}`;

    await signOut();
    navigate("/login", {
      state: { from: esRutaInterna(desde) ? desde : "/catalogo" },
    });
  }, [signOut, navigate, location.pathname, location.search]);

  const agregarAlCarrito = useCallback(async () => {
    setAviso("");
    setExito(false);

    if (!token) {
      await volverAlLogin();
      return;
    }

    try {
      await agregar(juegoId);
      setExito(true);
    } catch (requestError) {
      if (requestError?.status === 401) {
        return;
      }

      limpiarError();
      setAviso(mensajeAviso(requestError?.message));
    }
  }, [token, volverAlLogin, agregar, juegoId, limpiarError]);

  return {
    enCarrito,
    agregando,
    cargando,
    deshabilitado,
    aviso,
    exito,
    agregarAlCarrito,
  };
}
