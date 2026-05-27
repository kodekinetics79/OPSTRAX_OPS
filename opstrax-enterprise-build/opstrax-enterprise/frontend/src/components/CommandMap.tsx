import StatusBadge from './StatusBadge';

type CommandMapProps = {
  vehicles?: any[];
  events?: { id: string | number; message?: string; title?: string; severity: string }[];
  compact?: boolean;
};

export default function CommandMap({ vehicles = [], events = [], compact = false }: CommandMapProps) {
  const pins = vehicles.length ? vehicles.slice(0, compact ? 8 : 12) : Array.from({ length: compact ? 8 : 12 }, (_, id) => ({ id, name: `Vehicle ${id + 101}`, status: id % 5 === 0 ? 'Delayed' : 'Active' }));
  return (
    <div className={`relative overflow-hidden rounded-lg border border-line bg-[#08111f] command-grid ${compact ? 'h-[360px]' : 'h-[640px]'}`}>
      <svg className="absolute inset-0 h-full w-full opacity-90" viewBox="0 0 1100 640" preserveAspectRatio="none">
        <path d="M60 472 C 180 250, 340 370, 475 190 S 745 230, 1040 96" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="10 10" />
        <path d="M95 158 C 245 318, 410 238, 625 422 S 856 440, 1015 520" fill="none" stroke="#14b8a6" strokeWidth="3" />
        <path d="M260 520 C 410 420, 560 510, 720 300 S 915 210, 1040 320" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 12" />
        <circle cx="248" cy="270" r="86" fill="#14b8a6" opacity=".08" stroke="#14b8a6" strokeOpacity=".32" />
        <circle cx="822" cy="252" r="118" fill="#38bdf8" opacity=".08" stroke="#38bdf8" strokeOpacity=".28" />
        <circle cx="610" cy="445" r="76" fill="#f59e0b" opacity=".08" stroke="#f59e0b" strokeOpacity=".30" />
      </svg>
      {pins.map((vehicle, index) => {
        const delayed = `${vehicle.status} ${vehicle.priority}`.toLowerCase().includes('delayed') || index % 7 === 0;
        return (
          <button
            key={vehicle.id ?? index}
            className={`live-pulse absolute z-10 rounded-full border px-2.5 py-1 text-xs font-bold shadow-lg transition hover:scale-110 ${delayed ? 'border-amber-200 bg-amberx text-navy shadow-amberx/20' : 'border-teal-100 bg-teal text-navy shadow-teal/20'}`}
            style={{ left: `${9 + (index * 8.2) % 78}%`, top: `${16 + (index * 11.7) % 64}%` }}
          >
            {String(vehicle.name ?? `V${index}`).replace('Vehicle ', 'V')}
          </button>
        );
      })}
      <div className="absolute left-4 top-4 rounded-lg border border-line bg-navy/85 p-4 backdrop-blur">
        <p className="text-xs uppercase tracking-wide text-slate-500">Fleet status legend</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['On Route', 'Delayed', 'Idle', 'Maintenance Risk', 'Safety Event'].map((item) => <StatusBadge key={item} status={item} />)}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 max-w-sm rounded-lg border border-line bg-navy/90 p-4 backdrop-blur">
        <h3 className="text-sm font-semibold text-white">ETA risk corridor</h3>
        <p className="mt-2 text-xs leading-5 text-slate-400">Route overlays combine delay, idling, safety, and SLA pressure into operational heat scoring.</p>
      </div>
      {!compact && (
        <aside className="absolute right-4 top-4 w-80 rounded-lg border border-line bg-navy/90 p-4 backdrop-blur">
          <h3 className="font-semibold text-white">Selected vehicle</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {[
              ['Driver', 'Luis Ortega'],
              ['Vehicle', 'Vehicle 105'],
              ['Current job', 'JOB-1006'],
              ['Speed', '58 mph'],
              ['ETA', '42 min risk'],
              ['Safety', 'Watch'],
              ['Fuel/idling', 'High idle'],
              ['Action', 'Notify dispatcher']
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-panel/70 p-3">
                <p className="text-slate-500">{label}</p>
                <p className="mt-1 font-medium text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
      <div className={`absolute ${compact ? 'right-4 top-4 w-72' : 'bottom-4 right-4 w-80'} rounded-lg border border-line bg-navy/90 p-4 backdrop-blur`}>
        <h3 className="text-sm font-semibold text-white">Mission control timeline</h3>
        <div className="mt-3 space-y-2">
          {(events.length ? events : [
            { id: '1', message: 'Vehicle 104 crossed Gary geofence.', severity: 'Healthy' },
            { id: '2', message: 'JOB-1006 ETA risk increased.', severity: 'High' },
            { id: '3', message: 'Customer ETA notification sent.', severity: 'Active' }
          ]).slice(0, 5).map((event) => (
            <div key={event.id} className="flex gap-2 text-xs text-slate-300">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-teal" />
              <span>{event.message ?? event.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
