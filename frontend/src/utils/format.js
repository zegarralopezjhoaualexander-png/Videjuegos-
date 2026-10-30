export function getInitials(title) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function formatScore(score, fallback = "") {
  if (!Number.isFinite(score)) {
    return fallback;
  }

  return `${Number.isInteger(score) ? score : score.toFixed(1)}/10`;
}

export function formatPrice(precio, fallback = "") {
  if (!Number.isFinite(precio)) {
    return fallback;
  }

  return `$${new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(precio)}`;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return "";
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return DATE_FORMATTER.format(date);
}

export function formatAvailability(stock) {
  if (!Number.isFinite(stock)) {
    return "Disponibilidad no disponible";
  }

  if (stock <= 0) {
    return "Agotado";
  }

  return stock === 1 ? "1 unidad disponible" : `${stock} unidades disponibles`;
}

export function getStockClasses(stock) {
  if (!Number.isFinite(stock)) {
    return "border-white/10 bg-slate-900/60 text-slate-400";
  }

  if (stock <= 0) {
    return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  }

  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
}
