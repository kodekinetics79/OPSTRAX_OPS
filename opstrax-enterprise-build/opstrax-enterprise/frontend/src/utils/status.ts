export function statusClass(status = '') {
  const normalized = status.toLowerCase();
  if (normalized.includes('critical') || normalized.includes('delayed') || normalized.includes('open')) return 'bg-red-500/15 text-red-200 border-red-400/40';
  if (normalized.includes('warning') || normalized.includes('due') || normalized.includes('review')) return 'bg-amber-500/15 text-amber-100 border-amber-400/40';
  if (normalized.includes('ai') || normalized.includes('predictive') || normalized.includes('coaching')) return 'bg-purple-500/15 text-purple-100 border-purple-400/40';
  if (normalized.includes('risk') || normalized.includes('watch') || normalized.includes('idle') || normalized.includes('soon') || normalized.includes('audit')) return 'bg-amber-500/15 text-amber-100 border-amber-400/40';
  if (normalized.includes('completed') || normalized.includes('active') || normalized.includes('healthy') || normalized.includes('paid')) return 'bg-emerald-500/15 text-emerald-100 border-emerald-400/40';
  return 'bg-sky-500/15 text-sky-100 border-sky-400/40';
}
