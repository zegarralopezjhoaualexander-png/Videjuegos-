import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { useCarrito } from "../../auth/useCarrito.js";
import AppHeader from "../../components/layout/AppHeader.jsx";
import CarritoError from "../../components/carrito/CarritoError.jsx";
import CarritoItems from "../../components/carrito/CarritoItems.jsx";
import CarritoSkeleton from "../../components/carrito/CarritoSkeleton.jsx";
import CarritoVacio from "../../components/carrito/CarritoVacio.jsx";
import CuponForm from "../../components/carrito/CuponForm.jsx";
import ResumenCarrito from "../../components/carrito/ResumenCarrito.jsx";
import { SECONDARY_BUTTON } from "../../components/carrito/carritoStyles.js";
import { useCarritoAcciones } from "../../hooks/useCarritoAcciones.js";

function CarritoHeaderAcciones() {
  const { cerrando, handleLogout } = useCarritoAcciones();

  return (
    <>
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
    </>
  );
}

function CarritoEncabezado({ cargando, cantidadItems }) {
  const resumenTexto =
    cantidadItems === 1
      ? "1 artículo en el carrito"
      : `${cantidadItems} artículos en el carrito`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
          Tu compra
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Carrito de compras
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Revisa tus videojuegos, aplica un cupón y confirma el monto antes de
          pagar.
        </p>
      </div>

      {!cargando && cantidadItems > 0 && (
        <p className="text-sm text-slate-400" aria-live="polite">
          {resumenTexto}
        </p>
      )}
    </div>
  );
}

function CarritoDetalle({ resumen, items, accion, onQuitar }) {
  const {
    codigo,
    errorCupon,
    avisoCupon,
    handleCodigoChange,
    handleAplicarCupon,
    handleQuitarCupon,
    handleVaciar,
  } = useCarritoAcciones();

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <CarritoItems
          items={items}
          accion={accion}
          vaciando={accion === "vaciar"}
          onQuitar={onQuitar}
          onVaciar={handleVaciar}
        />
        <CuponForm
          codigo={codigo}
          onCodigoChange={handleCodigoChange}
          onSubmit={handleAplicarCupon}
          aplicando={accion === "cupon"}
          error={errorCupon}
          aviso={avisoCupon}
        />
      </div>

      <ResumenCarrito
        resumen={resumen}
        quitandoCupon={accion === "quitar-cupon"}
        onQuitarCupon={handleQuitarCupon}
      />
    </div>
  );
}

function CarritoContenido() {
  const {
    resumen,
    items,
    cantidadItems,
    cargando,
    accion,
    error,
    quitar,
    recargar,
    limpiarError,
  } = useCarrito();

  return (
    <>
      <CarritoEncabezado cargando={cargando} cantidadItems={cantidadItems} />

      {error && (
        <CarritoError
          error={error}
          mostrarReintentar={items.length === 0}
          onReintentar={recargar}
          onCerrar={limpiarError}
        />
      )}

      {cargando && <CarritoSkeleton />}

      {!cargando && !error && items.length === 0 && <CarritoVacio />}

      {!cargando && items.length > 0 && (
        <CarritoDetalle
          resumen={resumen}
          items={items}
          accion={accion}
          onQuitar={quitar}
        />
      )}
    </>
  );
}

function Carrito() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
      <AppHeader subtitle="Carrito" user={user}>
        <CarritoHeaderAcciones />
      </AppHeader>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CarritoContenido />
      </div>
    </main>
  );
}

export default Carrito;
