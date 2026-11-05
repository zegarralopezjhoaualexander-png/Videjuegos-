import { useContext } from "react";
import { CarritoContext } from "./CarritoContext.js";

export function useCarrito() {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error("useCarrito debe usarse dentro de un CarritoProvider.");
  }

  return context;
}
