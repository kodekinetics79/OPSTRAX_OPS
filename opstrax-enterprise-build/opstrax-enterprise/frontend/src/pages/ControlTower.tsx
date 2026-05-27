import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  CircleDot,
  ClipboardCheck,
  Clock,
  Gauge,
  History,
  MapPinned,
  Navigation,
  Package,
  RadioTower,
  RefreshCw,
  Route,
  Search,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Target,
  Truck,
  WifiOff,
  Wrench,
  X
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import {
  createDispatchReview,
  createMaintenanceReview,
  fetchControlTowerSummary,
  sendEtaUpdate,
  type ControlTowerEntity,
  type ControlTowerEvent,
  type ControlTowerRecommendation
} from '../services/controlTowerApi';
import { useControlTowerStream } from '../hooks/useControlTowerStream';

const iconMap = { RadioTower, Clock, Gauge, WifiOff, MapPinned, Navigation, ShieldAlert, Wrench };
const fallbackFilters = ['All', 'On Route', 'At Stop', 'Delayed', 'Idle', 'Offline', 'Maintenance Risk', 'Safety Event', 'Geofence Alert', 'Customer SLA Risk', 'Assets', 'Trailers'];

const statusColors: Record<string, string> = {
  green: 'bg-emerald-400 text-emerald-200 border-emerald-300/60',
  blue: 'bg-skyx text-sky-100 border-sky-300/60',
  amber: 'bg-amberx text-amber-100 border-amber-300/60',
  red: 'bg-red-500 text-red-100 border-red-300/60',
  purple: 'bg-purple-400 text-purple-100 border-purple-300/60',
  gray: 'bg-slate-500 text-slate-200 border-slate-300/50',
  teal: 'bg-teal text-teal-100 border-teal/70'
};

function toneFor(status = '', risk = '') {
  const text = `${status} ${risk}`.toLowerCase();
  if (text.includes('critical') || text.includes('incident') || text.includes('late')) return 'red';
  if (text.includes('maintenance') || text.includes('service')) return 'purple';
  if (text.includes('delayed') || text.includes('watch') || text.includes('risk')) return 'amber';
  if (text.includes('at stop')) return 'blue';
  if (text.includes('idle')) return 'teal';
  if (text.includes('offline')) return 'gray';
  return 'green';
}

function kpiTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes('critical')) return 'bad' as const;
  if (s.includes('watch') || s.includes('idle') || s.includes('service') || s.includes('review')) return 'warn' as const;
  if (s.includes('healthy') || s.includes('live')) return 'good' as const;
  return 'info' as const;
}

function eventText(event: ControlTowerEvent) {
  return event.description || event.message || event.title || event.type || event.eventType || 'Control tower event';
}

function eventTime(event: ControlTowerEvent) {
  return event.occurredAt || event.timestamp || new Date().toISOString();
}

function parsePath(pathJson: string) {
  try {
    const parsed = JSON.parse(pathJson);
    return Array.isArray(parsed.points) ? parsed.points as [number, number][] : [];
  } catch {
    return [];
  }
}

function project(lat?: number, lng?: number) {
  const minLat = 38.58;
  const maxLat = 39.02;
  const minLng = -77.58;
  const maxLng = -76.98;
  const x = (((lng ?? -77.3) - minLng) / (maxLng - minLng)) * 100;
  const y = (1 - (((lat ?? 38.8) - minLat) / (maxLat - minLat))) * 100;
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(5, Math.min(95, y)) };
}

export default function ControlTower() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ControlTowerEntity | null>(null);
  const [replayOpen, setReplayOpen] = useState(false);
  const { events: streamEvents, connected, error: streamError } = useControlTowerStream();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ['control-tower-summary'], queryFn: fetchControlTowerSummary });

  const allEntities = data?.mapEntities ?? [];
  const activeEntity = selected ?? data?.selectedEntityDefaults ?? allEntities[0] ?? null;
  const liveEvents = [...streamEvents, ...(data?.liveEvents ?? [])].slice(0, 24);
  const filters = data?.filters?.length ? data.filters : fallbackFilters;

  const filteredEntities = useMemo(() => {
    const term = search.toLowerCase();
    return allEntities.filter((entity) => {
      const haystack = Object.values(entity).join(' ').toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Assets' && entity.type === 'asset') ||
        (filter === 'Trailers' && entity.type === 'asset') ||
        haystack.includes(filter.toLowerCase().replace('customer ', '').replace('event', '').trim());
      return matchesSearch && matchesFilter;
    });
  }, [allEntities, filter, search]);

  const actionMutation = useMutation({
    mutationFn: async ({ action, entity }: { action: string; entity?: ControlTowerEntity | null }) => {
      const payload = {
        entityType: entity?.type ?? activeEntity?.type ?? 'vehicle',
        entityId: entity?.id ?? activeEntity?.id ?? 1,
        jobId: entity?.type === 'job' ? entity.id : activeEntity?.id ?? 1,
        message: `OpsTrax ETA update sent for ${entity?.name ?? activeEntity?.name ?? 'selected entity'}.`,
        description: `Control Tower review created for ${entity?.name ?? activeEntity?.name ?? 'selected entity'}.`
      };
      if (action === 'send-eta-update') return sendEtaUpdate(payload);
      if (action === 'create-maintenance-review') return createMaintenanceReview(payload);
      return createDispatchReview(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['control-tower-summary'] })
  });

  if (isLoading) {
    return <div className="glass-panel rounded-lg p-10 text-center text-slate-300">Loading Live Map / Control Tower...</div>;
  }

  if (isError || !data) {
    return (
      <div className="glass-panel rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-white">Control Tower unavailable</h1>
        <p className="mt-2 text-sm text-slate-400">The API did not return the enterprise control tower payload.</p>
        <button onClick={() => refetch()} className="mt-5 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command / Live Map"
        title="Live Map / Control Tower"
        description="Real-time visibility across vehicles, drivers, jobs, routes, assets, geofences, ETA risk, safety incidents, and live operational events."
        badge="Live Simulation"
        actions={
          <>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${connected ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : 'border-amber-400/30 bg-amber-500/10 text-amber-100'}`}>
              <CircleDot size={14} className={connected ? 'live-pulse' : ''} /> {connected ? 'Stream connected' : streamError ?? 'Reconnecting'}
            </span>
            <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-xs text-teal-100">Updated {new Date(data.generatedAt).toLocaleTimeString()}</span>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-200 hover:border-teal/50">
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /> Refresh
            </button>
          </>
        }
      />

      <section className="glass-panel rounded-lg p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="OpsTrax AI Monitoring" />
              <StatusBadge status="Risk Heat Overlay" />
              <StatusBadge status="ETA Predictor" />
            </div>
            <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-300">{data.snapshot}</p>
          </div>
          <button onClick={() => setReplayOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md border border-purple-300/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 hover:border-purple-300/60">
            <History size={16} /> View Route Replay
          </button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => {
          const Icon = iconMap[kpi.icon as keyof typeof iconMap] ?? RadioTower;
          return <KpiCard key={kpi.key} label={kpi.label} value={kpi.value} trend={kpi.trend} status={kpi.status} tone={kpiTone(kpi.status)} icon={Icon} />;
        })}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[330px_minmax(0,1fr)_390px]">
        <aside className="space-y-5">
          <section className="glass-panel rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-white">Fleet scope</h2>
              <SlidersHorizontal size={17} className="text-slate-400" />
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicle, job, asset..." className="w-full rounded-md border border-line bg-navy/70 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-teal" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs transition ${filter === item ? 'border-teal/60 bg-teal/15 text-teal-100' : 'border-line bg-navy/60 text-slate-300 hover:border-teal/40'}`}>{item}</button>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Entities</h2>
              <span className="text-xs text-slate-500">{filteredEntities.length} visible</span>
            </div>
            <div className="mt-4 max-h-[640px] space-y-2 overflow-y-auto pr-1 opstrax-scroll">
              {filteredEntities.map((entity) => {
                const selectedState = activeEntity?.id === entity.id && activeEntity?.type === entity.type;
                const EntityIcon = entity.type === 'asset' ? Package : entity.type === 'job' ? ClipboardCheck : Truck;
                return (
                  <button key={`${entity.type}-${entity.id}`} onClick={() => setSelected(entity)} className={`w-full rounded-md border p-3 text-left transition ${selectedState ? 'border-teal/60 bg-teal/10' : 'border-line bg-navy/65 hover:border-teal/35 hover:bg-white/[0.04]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/5 text-teal-100"><EntityIcon size={17} /></div>
                        <div>
                          <p className="text-sm font-semibold text-white">{entity.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{entity.operator} - {entity.zone}</p>
                        </div>
                      </div>
                      <StatusBadge status={entity.riskBand} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <span className="rounded border border-line bg-black/15 px-2 py-1 text-slate-300">{entity.status}</span>
                      <span className="rounded border border-line bg-black/15 px-2 py-1 text-slate-300">{entity.eta}</span>
                      <span className="rounded border border-line bg-black/15 px-2 py-1 text-slate-300">Risk {entity.riskScore}</span>
                    </div>
                  </button>
                );
              })}
              {filteredEntities.length === 0 && <div className="rounded-md border border-line bg-navy/60 p-6 text-center text-sm text-slate-400">No entities match the current control tower filters.</div>}
            </div>
          </section>
        </aside>

        <section className="glass-panel overflow-hidden rounded-lg">
          <div className="flex flex-col justify-between gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Northern Virginia / DC command map</h2>
              <p className="mt-1 text-sm text-slate-400">Vehicles, routes, stop markers, geofences, delay zones, incident markers, and maintenance risk overlay.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['On Route', 'At Stop', 'Delayed', 'Idle', 'Critical', 'Maintenance'].map((item) => <StatusBadge key={item} status={item} />)}
            </div>
          </div>
          <ControlMap
            entities={filteredEntities}
            selected={activeEntity}
            routes={data.routes}
            geofences={data.geofences}
            events={liveEvents}
            onSelect={setSelected}
          />
        </section>

        <aside className="space-y-5">
          {activeEntity && <EntityDrawer entity={activeEntity} onAction={(action) => actionMutation.mutate({ action, entity: activeEntity })} loading={actionMutation.isPending} />}
          <AiRecommendations recommendations={data.aiRecommendations} onAction={(recommendation) => actionMutation.mutate({ action: recommendation.action, entity: activeEntity })} loading={actionMutation.isPending} />
          <LiveTimeline events={liveEvents} connected={connected} />
        </aside>
      </div>

      {replayOpen && <RouteReplay routes={data.routes} events={liveEvents.slice(0, 8)} onClose={() => setReplayOpen(false)} />}
    </div>
  );
}

function ControlMap({ entities, selected, routes, geofences, events, onSelect }: {
  entities: ControlTowerEntity[];
  selected?: ControlTowerEntity | null;
  routes: { id: number; pathJson: string; status: string; name?: string }[];
  geofences: { id: number; name: string; type: string; centerLatitude: number; centerLongitude: number; radiusMeters: number; status: string }[];
  events: ControlTowerEvent[];
  onSelect: (entity: ControlTowerEntity) => void;
}) {
  return (
    <div className="command-grid relative h-[760px] overflow-hidden bg-[#050b14]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(20,184,166,0.12),transparent_24%),radial-gradient(circle_at_70%_65%,rgba(168,85,247,0.10),transparent_22%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {routes.slice(0, 8).map((route, index) => {
          const points = parsePath(route.pathJson).map(([lng, lat]) => project(lat, lng));
          const d = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
          return <path key={route.id} d={d} fill="none" stroke={route.status?.includes('Delayed') || route.status?.includes('Deviation') ? '#f59e0b' : index % 3 === 0 ? '#14b8a6' : '#38bdf8'} strokeWidth="0.42" strokeDasharray={route.status?.includes('Deviation') ? '1.3 1.3' : '0'} opacity="0.72" />;
        })}
      </svg>

      {geofences.map((zone) => {
        const pos = project(Number(zone.centerLatitude), Number(zone.centerLongitude));
        const critical = zone.status === 'Critical';
        return (
          <div key={zone.id} className={`absolute rounded-full border ${critical ? 'border-red-400/50 bg-red-500/8' : zone.status === 'Warning' ? 'border-amber-300/45 bg-amber-500/8' : 'border-teal/35 bg-teal/7'}`} style={{ left: `${pos.x - 5}%`, top: `${pos.y - 4}%`, width: `${zone.radiusMeters / 165}px`, height: `${zone.radiusMeters / 165}px`, minWidth: 78, minHeight: 78 }}>
            <span className="absolute left-2 top-2 rounded bg-black/40 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-200">{zone.name}</span>
          </div>
        );
      })}

      {events.slice(0, 7).map((event, index) => {
        const pos = project(event.lat, event.lng);
        return (
          <div key={`${event.id}-${index}`} className="absolute grid h-7 w-7 place-items-center rounded-full border border-amber-200/50 bg-amber-500/20 text-amber-100 shadow-lg shadow-amber-900/30" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <AlertTriangle size={14} />
          </div>
        );
      })}

      {entities.map((entity) => {
        const pos = project(Number(entity.lat), Number(entity.lng));
        const color = toneFor(entity.status, entity.riskBand);
        const selectedState = selected?.id === entity.id && selected?.type === entity.type;
        const Icon = entity.type === 'asset' ? Package : entity.type === 'job' ? Target : Truck;
        return (
          <button key={`${entity.type}-${entity.id}`} onClick={() => onSelect(entity)} className={`absolute z-10 grid h-9 w-9 place-items-center rounded-full border-2 ${statusColors[color]} ${selectedState ? 'scale-125 shadow-2xl shadow-teal/30' : 'shadow-lg shadow-black/30'} transition hover:scale-125`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} title={entity.name}>
            <span className={entity.status !== 'Offline' ? 'live-pulse absolute inset-0 rounded-full text-current' : ''} />
            <Icon size={17} className="relative text-[#03101b]" />
          </button>
        );
      })}

      {selected && (
        <div className="absolute bottom-5 left-5 max-w-sm rounded-lg border border-teal/30 bg-[#07111f]/90 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-teal-200">Selected entity</p>
              <h3 className="mt-1 text-lg font-semibold text-white">{selected.name}</h3>
            </div>
            <StatusBadge status={selected.riskBand} />
          </div>
          <p className="mt-3 text-sm leading-5 text-slate-300">{selected.recommendedAction}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-300">
            <span className="rounded border border-line bg-black/20 p-2">ETA {selected.eta}</span>
            <span className="rounded border border-line bg-black/20 p-2">Speed {selected.speed}</span>
            <span className="rounded border border-line bg-black/20 p-2">Risk {selected.riskScore}</span>
          </div>
        </div>
      )}

      <div className="absolute right-5 top-5 rounded-lg border border-line bg-[#07111f]/85 p-3 backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Map legend</p>
        <div className="grid gap-2 text-xs text-slate-300">
          {Object.entries({ Healthy: 'green', 'At Stop': 'blue', Delayed: 'amber', Critical: 'red', Maintenance: 'purple', Idle: 'teal', Offline: 'gray' }).map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${statusColors[color].split(' ')[0]}`} /> {label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntityDrawer({ entity, onAction, loading }: { entity: ControlTowerEntity; onAction: (action: string) => void; loading: boolean }) {
  const rows = [
    ['Status', entity.status],
    ['Zone', entity.zone],
    ['Current job', entity.currentJob],
    ['Route', entity.route],
    ['Speed', `${entity.speed} mph`],
    ['ETA', entity.eta],
    ['Safety score', entity.safetyScore ? `${entity.safetyScore}` : 'N/A'],
    ['Fuel/idling', entity.fuelIdling],
    ['Maintenance', entity.maintenanceStatus],
    ['Last event', entity.lastEvent]
  ];
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-teal-200">{entity.type} detail</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{entity.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{entity.operator}</p>
        </div>
        <StatusBadge status={entity.etaRisk} />
      </div>
      <div className="mt-4 rounded-lg border border-line bg-navy/65 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Risk heat score</span>
          <span className="text-2xl font-semibold text-white">{entity.riskScore}</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-800">
          <div className="h-2 rounded-full bg-gradient-to-r from-teal via-amberx to-red-500" style={{ width: `${entity.riskScore}%` }} />
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-md border border-line bg-panel/60 p-3">
            <dt className="text-xs uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-md border border-purple-300/20 bg-purple-500/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-100">Recommended action</p>
        <p className="mt-2 text-sm leading-5 text-slate-300">{entity.recommendedAction}</p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        <button disabled={loading} onClick={() => onAction('send-eta-update')} className="inline-flex items-center justify-center gap-2 rounded-md bg-teal px-3 py-2 text-sm font-semibold text-navy disabled:opacity-60"><Send size={15} /> Send ETA update</button>
        <button disabled={loading} onClick={() => onAction('create-dispatch-review')} className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-200 hover:border-skyx/50 disabled:opacity-60"><Navigation size={15} /> Create dispatch review</button>
        <button disabled={loading} onClick={() => onAction('create-maintenance-review')} className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-200 hover:border-purple-300/50 disabled:opacity-60"><Wrench size={15} /> Create maintenance review</button>
      </div>
    </section>
  );
}

function AiRecommendations({ recommendations, onAction, loading }: { recommendations: ControlTowerRecommendation[]; onAction: (recommendation: ControlTowerRecommendation) => void; loading: boolean }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Sparkles size={17} className="text-purple-200" />
        <h2 className="font-semibold text-white">AI dispatch suggestions</h2>
      </div>
      <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1 opstrax-scroll">
        {recommendations.slice(0, 8).map((item) => (
          <article key={item.title} className="rounded-md border border-line bg-navy/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-5 text-white">{item.title}</h3>
              <StatusBadge status={item.severity} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.evidence}</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">Action: {item.recommendedAction}</p>
            <button disabled={loading} onClick={() => onAction(item)} className="mt-3 w-full rounded-md border border-purple-300/25 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-100 hover:border-purple-300/60 disabled:opacity-60">
              Execute placeholder action
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function LiveTimeline({ events, connected }: { events: ControlTowerEvent[]; connected: boolean }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Bell size={17} className="text-teal-100" /><h2 className="font-semibold text-white">Live event timeline</h2></div>
        <StatusBadge status={connected ? 'Live' : 'Reconnecting'} />
      </div>
      <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1 opstrax-scroll">
        {events.map((event) => (
          <div key={`${event.id}-${eventTime(event)}`} className="rounded-md border border-line bg-navy/70 p-3">
            <div className="flex items-start gap-3">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${event.severity?.toLowerCase().includes('critical') ? 'bg-red-400' : event.severity?.toLowerCase().includes('warning') || event.severity?.toLowerCase().includes('high') ? 'bg-amberx' : 'bg-teal'}`} />
              <div>
                <p className="text-sm font-medium text-white">{event.title || event.type || event.eventType}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{eventText(event)}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">{new Date(eventTime(event)).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RouteReplay({ routes, events, onClose }: { routes: { id: number; name?: string; status: string }[]; events: ControlTowerEvent[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-4xl rounded-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-200">Route replay placeholder</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Control Tower Route Replay</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Timeline controls, route events, geofence transitions, dwell markers, and ETA drift are structured here for a full replay engine.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-line p-2 text-slate-300 hover:border-teal/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="mt-6 rounded-lg border border-line bg-navy/70 p-4">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-teal-100" />
            <input type="range" min="0" max="100" defaultValue="62" className="w-full accent-teal" />
            <span className="text-sm text-slate-300">14:42</span>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-panel/60 p-4">
            <h3 className="font-semibold text-white">Routes in replay scope</h3>
            <div className="mt-3 space-y-2">
              {routes.slice(0, 6).map((route) => <div key={route.id} className="flex items-center justify-between rounded-md bg-navy/70 p-3 text-sm"><span className="text-slate-200">{route.name ?? `Route ${route.id}`}</span><StatusBadge status={route.status} /></div>)}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-panel/60 p-4">
            <h3 className="font-semibold text-white">Replay event list</h3>
            <div className="mt-3 space-y-2">
              {events.map((event) => <div key={`${event.id}-replay`} className="rounded-md bg-navy/70 p-3 text-sm text-slate-300">{event.title || eventText(event)}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
