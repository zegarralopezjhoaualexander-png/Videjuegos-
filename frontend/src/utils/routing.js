export function esRutaInterna(destino) {
  if (typeof destino !== "string") {
    return false;
  }

  if (!destino.startsWith("/")) {
    return false;
  }

  const segundoCaracter = destino.charAt(1);
  return segundoCaracter !== "/" && segundoCaracter !== "\\";
}
