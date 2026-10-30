import { useState } from "react";
import { resolvePublicImage } from "../api/juegos.js";
import { getInitials } from "../utils/format.js";

function JuegoThumb({ juego, className = "h-12 w-16" }) {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(juego.imagen) && !imageError;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-white/10 bg-linear-to-br from-indigo-500/30 via-slate-900 to-fuchsia-500/30 ${className}`}
    >
      {showImage ? (
        <img
          src={resolvePublicImage(juego.imagen)}
          alt={`Portada de ${juego.titulo}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] font-black tracking-widest text-white/70">
          {getInitials(juego.titulo)}
        </span>
      )}
    </div>
  );
}

export default JuegoThumb;
