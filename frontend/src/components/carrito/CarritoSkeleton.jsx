function CarritoSkeleton() {
  return (
    <div
      className="mt-6 grid animate-pulse gap-6 motion-reduce:animate-none lg:grid-cols-[minmax(0,1fr)_360px]"
      role="status"
      aria-label="Cargando carrito"
    >
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-32 rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-white/10 bg-white/5" />
      <span className="sr-only">Cargando tu carrito...</span>
    </div>
  );
}

export default CarritoSkeleton;
