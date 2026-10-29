export function inputClasses(hasError) {
  return [
    'w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2',
    hasError
      ? 'border-rose-400/70 focus:border-rose-400 focus:ring-rose-400/30'
      : 'border-white/10 focus:border-indigo-400 focus:ring-indigo-400/30',
  ].join(' ')
}
