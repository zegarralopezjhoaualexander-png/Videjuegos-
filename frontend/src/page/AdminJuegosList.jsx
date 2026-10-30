import JuegoThumb from "../components/JuegoThumb.jsx";
import { formatPrice } from "../utils/format.js";

const STOCK_FORMATTER = new Intl.NumberFormat("es-MX");

function formatStock(stock) {
  return Number.isFinite(stock) ? STOCK_FORMATTER.format(stock) : "—";
}

function AdminJuegoRow({ juego, ocupado, cargandoEdicion, eliminando, onEditar, onEliminar }) {
  return (
    <tr>
      <td className="px-4 py-3">
        <JuegoThumb juego={juego} />
      </td>
      <td className="px-4 py-3 font-medium text-white">{juego.titulo}</td>
      <td className="px-4 py-3 text-slate-300">{juego.genero || "—"}</td>
      <td className="px-4 py-3 text-slate-300">{juego.plataforma || "—"}</td>
      <td className="px-4 py-3 text-slate-300">
        {formatPrice(juego.precio, "—")}
      </td>
      <td className="px-4 py-3 text-slate-300">{formatStock(juego.stock)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEditar(juego)}
            disabled={ocupado}
            className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cargandoEdicion ? "Cargando..." : "Editar"}
          </button>
          <button
            type="button"
            onClick={() => onEliminar(juego)}
            disabled={ocupado}
            className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function AdminJuegoCard({ juego, ocupado, cargandoEdicion, eliminando, onEditar, onEliminar }) {
  return (
    <article className="p-4">
      <div className="flex items-start gap-3">
        <JuegoThumb juego={juego} className="h-14 w-20" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">{juego.titulo}</h3>
          <p className="mt-1 text-xs text-slate-400">
            {juego.genero || "Sin género"} ·{" "}
            {juego.plataforma || "Sin plataforma"}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-slate-500">Precio</dt>
          <dd className="mt-0.5 text-slate-200">
            {formatPrice(juego.precio, "—")}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Stock</dt>
          <dd className="mt-0.5 text-slate-200">{formatStock(juego.stock)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEditar(juego)}
          disabled={ocupado}
          className="flex-1 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargandoEdicion ? "Cargando..." : "Editar"}
        </button>
        <button
          type="button"
          onClick={() => onEliminar(juego)}
          disabled={ocupado}
          className="flex-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {eliminando ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </article>
  );
}

function AdminJuegosList({
  juegos,
  editandoId,
  eliminandoId,
  onEditar,
  onEliminar,
}) {
  const isOcupado = (juego) =>
    editandoId === juego.id || eliminandoId === juego.id;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Listado de videojuegos</caption>
          <thead className="border-b border-white/10 bg-slate-950/60 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                Imagen
              </th>
              <th scope="col" className="px-4 py-3">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3">
                Género
              </th>
              <th scope="col" className="px-4 py-3">
                Plataforma
              </th>
              <th scope="col" className="px-4 py-3">
                Precio
              </th>
              <th scope="col" className="px-4 py-3">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {juegos.map((juego) => (
              <AdminJuegoRow
                key={juego.id || juego.titulo}
                juego={juego}
                ocupado={isOcupado(juego)}
                cargandoEdicion={editandoId === juego.id}
                eliminando={eliminandoId === juego.id}
                onEditar={onEditar}
                onEliminar={onEliminar}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-white/5 md:hidden">
        {juegos.map((juego) => (
          <AdminJuegoCard
            key={juego.id || juego.titulo}
            juego={juego}
            ocupado={isOcupado(juego)}
            cargandoEdicion={editandoId === juego.id}
            eliminando={eliminandoId === juego.id}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}
      </div>
    </div>
  );
}

export default AdminJuegosList;
