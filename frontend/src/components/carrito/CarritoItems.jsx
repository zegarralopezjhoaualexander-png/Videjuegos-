import { useState } from "react";
import { resolvePublicImage } from "../../api/juegos.js";
import { formatMoney, getInitials } from "../../utils/format.js";
import { SECONDARY_BUTTON } from "./carritoStyles.js";

function CarritoItemImage({ item }) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(item.imagen) && !imageError;

  return (
    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-indigo-500/30 via-slate-900 to-fuchsia-500/30 sm:w-40">
      {showImage ? (
        <img
          src={resolvePublicImage(item.imagen)}
          alt={`Portada de ${item.titulo}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xl font-black tracking-widest text-white/70">
          {getInitials(item.titulo || "Juego")}
        </div>
      )}
    </div>
  );
}

function CarritoItemRow({ item, quitando, onQuitar }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
      <CarritoItemImage item={item} />

      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-base font-semibold text-white">
          {item.titulo || "Juego sin título"}
        </h2>
        <p className="mt-2 text-sm font-semibold text-indigo-200">
          {formatMoney(item.precio)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onQuitar(item.juegoId)}
        disabled={quitando}
        aria-label={`Quitar ${item.titulo || "videojuego"} del carrito`}
        className={`${SECONDARY_BUTTON} border-rose-400/20 text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-100 sm:shrink-0`}
      >
        {quitando ? "Quitando..." : "Quitar"}
      </button>
    </li>
  );
}

function CarritoItems({ items, accion, vaciando, onQuitar, onVaciar }) {
  return (
    <section aria-labelledby="items-carrito">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="items-carrito" className="text-lg font-semibold text-white">
          Videojuegos
        </h2>
        <button
          type="button"
          onClick={onVaciar}
          disabled={vaciando}
          aria-label="Vaciar carrito de compras"
          className={`${SECONDARY_BUTTON} border-rose-400/20 text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-100`}
        >
          {vaciando ? "Vaciando..." : "Vaciar carrito"}
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <CarritoItemRow
            key={item.juegoId}
            item={item}
            quitando={accion === `quitar:${item.juegoId}`}
            onQuitar={onQuitar}
          />
        ))}
      </ul>
    </section>
  );
}

export default CarritoItems;
