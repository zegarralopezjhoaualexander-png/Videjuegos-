export const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Nintendo"];

export function normalizarTexto(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function listaPlataformas(value) {
  if (Array.isArray(value)) {
    return value.flatMap(listaPlataformas);
  }

  return String(value ?? "").split(",");
}

export function filtrarJuegos(
  juegos,
  { search = "", genero = "todos", plataforma = "todas" } = {}
) {
  const termino = normalizarTexto(search);
  const plataformaBuscada = normalizarTexto(plataforma);

  return juegos.filter((juego) => {
    if (genero !== "todos" && juego.genero !== genero) {
      return false;
    }

    if (plataformaBuscada && plataformaBuscada !== "todas") {
      const coincide = listaPlataformas(juego.plataforma).some((valor) => {
        const normalizada = normalizarTexto(valor);
        return (
          normalizada === plataformaBuscada ||
          normalizada.includes(plataformaBuscada)
        );
      });

      if (!coincide) {
        return false;
      }
    }

    if (!termino) {
      return true;
    }

    return normalizarTexto(juego.titulo).includes(termino);
  });
}
