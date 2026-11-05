import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  agregarItem,
  aplicarCodigoCupon,
  obtenerCarrito,
  quitarCuponDelCarrito,
  quitarItem,
  vaciarCarrito,
} from "../api/carrito.js";
import { useAuth } from "./useAuth.js";
import { CarritoContext } from "./CarritoContext.js";

const RESUMEN_VACIO = {
  items: [],
  cantidadItems: 0,
  subtotal: 0,
  descuento: 0,
  cuponCodigo: null,
  impuesto: 0,
  total: 0,
};

function resumenVacio() {
  return { ...RESUMEN_VACIO };
}

function CarritoProvider({ children }) {
  const { token, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const ubicacionRef = useRef({
    pathname: location.pathname,
    search: location.search,
  });
  ubicacionRef.current = {
    pathname: location.pathname,
    search: location.search,
  };
  const [estado, setEstado] = useState(() => ({
    token: null,
    resumen: resumenVacio(),
    cargando: Boolean(token),
    accion: null,
    error: "",
  }));

  const manejarSesionExpirada = useCallback(async () => {
    const { pathname, search } = ubicacionRef.current;

    await signOut();

    if (pathname !== "/login") {
      navigate("/login", {
        replace: true,
        state: { from: `${pathname}${search}` },
      });
    }
  }, [signOut, navigate]);

  const resumen =
    token && estado.token === token ? estado.resumen : RESUMEN_VACIO;
  const cargando =
    Boolean(token) && (estado.token !== token || estado.cargando);
  const error = token && estado.token === token ? estado.error : "";
  const accion = token && estado.token === token ? estado.accion : null;

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    obtenerCarrito({ token, signal: controller.signal })
      .then((data) => {
        if (!active) {
          return;
        }

        setEstado((current) => ({
          ...current,
          token,
          resumen: data,
          cargando: false,
          error: "",
        }));
      })
      .catch(async (requestError) => {
        if (!active || requestError.name === "AbortError") {
          return;
        }

        if (requestError.status === 401) {
          await manejarSesionExpirada();
          return;
        }

        setEstado((current) => ({
          ...current,
          token,
          cargando: false,
          error:
            requestError.message ||
            "No se pudo cargar el carrito. Inténtalo de nuevo.",
        }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, manejarSesionExpirada]);

  const ejecutar = useCallback(
    async (nombreAccion, peticion) => {
      if (!token) {
        throw new Error("Debes iniciar sesión para usar el carrito.");
      }

      setEstado((current) => ({
        ...current,
        accion: nombreAccion,
        error: "",
      }));

      try {
        const data = await peticion(token);
        setEstado((current) => ({
          ...current,
          token,
          resumen: data,
          cargando: false,
          accion: null,
          error: "",
        }));
        return data;
      } catch (requestError) {
        if (requestError.status === 401) {
          setEstado((current) => ({ ...current, accion: null }));
          await manejarSesionExpirada();
        } else {
          setEstado((current) => ({
            ...current,
            accion: null,
            error:
              requestError.message ||
              "No se pudo completar la operación del carrito.",
          }));
        }
        throw requestError;
      }
    },
    [token, manejarSesionExpirada]
  );

  const agregar = useCallback(
    (juegoId) =>
      ejecutar(`agregar:${juegoId}`, (tokenActual) =>
        agregarItem(juegoId, { token: tokenActual })
      ),
    [ejecutar]
  );

  const quitar = useCallback(
    (juegoId) =>
      ejecutar(`quitar:${juegoId}`, (tokenActual) =>
        quitarItem(juegoId, { token: tokenActual })
      ),
    [ejecutar]
  );

  const aplicarCupon = useCallback(
    (codigo) =>
      ejecutar("cupon", (tokenActual) =>
        aplicarCodigoCupon(codigo, { token: tokenActual })
      ),
    [ejecutar]
  );

  const quitarCupon = useCallback(
    () =>
      ejecutar("quitar-cupon", (tokenActual) =>
        quitarCuponDelCarrito({ token: tokenActual })
      ),
    [ejecutar]
  );

  const vaciar = useCallback(
    () =>
      ejecutar("vaciar", (tokenActual) =>
        vaciarCarrito({ token: tokenActual })
      ),
    [ejecutar]
  );

  const recargar = useCallback(async () => {
    if (!token) {
      return;
    }

    setEstado((current) => ({ ...current, cargando: true, error: "" }));

    try {
      const data = await obtenerCarrito({ token });
      setEstado((current) => ({
        ...current,
        token,
        resumen: data,
        cargando: false,
        error: "",
      }));
    } catch (requestError) {
      if (requestError.status === 401) {
        setEstado((current) => ({ ...current, cargando: false }));
        await manejarSesionExpirada();
        return;
      }

      setEstado((current) => ({
        ...current,
        cargando: false,
        error:
          requestError.message ||
          "No se pudo cargar el carrito. Inténtalo de nuevo.",
      }));
    }
  }, [token, manejarSesionExpirada]);

  const estaEnCarrito = useCallback(
    (juegoId) =>
      resumen.items.some(
        (item) => String(item.juegoId) === String(juegoId)
      ),
    [resumen.items]
  );

  const limpiarError = useCallback(
    () =>
      setEstado((current) => ({
        ...current,
        error: "",
      })),
    []
  );

  const value = useMemo(
    () => ({
      resumen,
      items: resumen.items,
      cantidadItems: resumen.cantidadItems,
      cargando,
      accion,
      error,
      agregar,
      quitar,
      aplicarCupon,
      quitarCupon,
      vaciar,
      estaEnCarrito,
      recargar,
      limpiarError,
    }),
    [
      resumen,
      cargando,
      accion,
      error,
      agregar,
      quitar,
      aplicarCupon,
      quitarCupon,
      vaciar,
      estaEnCarrito,
      recargar,
      limpiarError,
    ]
  );

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

export default CarritoProvider;
