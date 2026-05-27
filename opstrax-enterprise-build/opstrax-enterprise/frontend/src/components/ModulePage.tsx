import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Download, Eye, Filter, Plus, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { ModuleConfig, ModuleRecord } from '../types';
import { createModuleRecord, fetchModule } from '../services/api';
import ActionQueue from './ActionQueue';
import KpiCard from './KpiCard';
import PageHeader from './PageHeader';
import StatusBadge from './StatusBadge';

const moduleSignals: Record<string, string[]> = {
  vehicles: ['Late Risk', 'Service Soon', 'High Idle', 'Low Risk'],
  drivers: ['Coaching Needed', 'HOS Watch', 'Top Performer', 'Low Risk'],
  'jobs-orders': ['SLA Watch', 'Late Risk', 'Customer ETA Sent', 'Low Risk'],
  maintenance: ['Service Soon', 'Critical', 'Parts Ready', 'Scheduled'],
  'work-orders': ['Open', 'In Progress', 'Parts Hold', 'Completed'],
  safety: ['Coaching Needed', 'High Risk', 'Closed', 'Review'],
  dashcam: ['AI Review', 'Evidence Ready', 'Coaching Needed', 'Processed'],
  compliance: ['Audit Risk', 'Expiring Soon', 'Ready', 'Review'],
  'customer-eta-portal': ['ETA Sent', 'En Route', 'Arrived', 'SLA Watch'],
  'reports-analytics': ['Scheduled', 'Export Ready', 'Live', 'Executive']
};

export default function ModulePage({ config }: { config: ModuleConfig }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ModuleRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['module', config.key], queryFn: () => fetchModule(config.key) });

  const createMutation = useMutation({
    mutationFn: () => createModuleRecord(config.key, { name: `New ${config.title}`, status: 'Active', owner: 'Ops Control', priority: 'Normal', location: 'Operations HQ' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', config.key] });
      setModalOpen(false);
    }
  });

  const filtered = useMemo(() => {
    const lowered = query.toLowerCase();
    return data.filter((item) => JSON.stringify(item).toLowerCase().includes(lowered));
  }, [data, query]);

  const exceptions = data.filter((item) => `${item.status} ${item.priority}`.toLowerCase().match(/risk|critical|delayed|warning|high|review|due/)).length;
  const signals = moduleSignals[config.key] ?? ['Low Risk', 'Watch', 'AI Suggested', 'Live'];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module"
        title={config.title}
        description={config.description}
        actions={<button onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy shadow-lg shadow-teal/10"><Plus size={16} /> Create</button>}
      />

      <SpecialModulePanel config={config} rows={data} />

      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard label="Operational Records" value={data.length} trend="API live" status="Seeded" />
        <KpiCard label="Risk Heat Score" value={exceptions ? `${Math.min(99, exceptions * 12)}%` : '12%'} trend={exceptions ? 'Watch' : 'Low'} status={signals[0]} tone={exceptions > 2 ? 'warn' : 'good'} />
        <KpiCard label="Exceptions" value={exceptions} trend="Needs review" status={signals[1]} tone={exceptions ? 'warn' : 'good'} />
        <KpiCard label="AI Recommendations" value={Math.max(2, Math.ceil(data.length / 4))} trend="Generated" status={signals[2]} tone="ai" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="glass-panel rounded-lg overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-md border border-line bg-navy/70 py-2 pl-10 pr-3 text-sm text-white outline-none transition focus:border-teal" placeholder={`Search ${config.title.toLowerCase()}`} />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-navy/60 px-3 py-2 text-sm text-slate-200 hover:border-teal/40">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-navy/60 px-3 py-2 text-sm text-slate-200 hover:border-skyx/40">
              <Download size={16} /> Export
            </button>
          </div>

          {isLoading && <div className="p-10 text-center text-slate-400">Loading operational data...</div>}
          {isError && <div className="p-10 text-center text-red-200">Unable to load this module. Check the API connection.</div>}
          {!isLoading && !isError && filtered.length === 0 && <div className="p-10 text-center text-slate-400">No matching records found.</div>}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="overflow-x-auto opstrax-scroll">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Record</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Operational Metric</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((item, index) => (
                    <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer transition hover:bg-white/[0.04]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{config.title} - enterprise record</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3"><StatusBadge status={signals[index % signals.length]} /></td>
                      <td className="px-4 py-3 text-slate-300">{item.owner}</td>
                      <td className="max-w-sm px-4 py-3 text-slate-300">{item.metric}</td>
                      <td className="px-4 py-3 text-slate-300">{item.location}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(item.updatedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><button className="rounded-md border border-line p-2 text-slate-400 hover:border-teal/40 hover:text-white"><Eye size={15} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="glass-panel rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="text-purple-200" size={17} /> Module intelligence</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">OpsTrax is monitoring exception patterns, SLA pressure, cost leakage, and predictive risk for this operational area.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {signals.map((signal) => <StatusBadge key={signal} status={signal} />)}
            </div>
          </section>
          <ActionQueue />
        </aside>
      </div>

      {selected && (
        <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl border-l border-line bg-[#07101d] p-6 shadow-2xl">
          <button className="absolute right-4 top-4 text-slate-400 hover:text-white" onClick={() => setSelected(null)}><X size={20} /></button>
          <p className="text-sm text-teal-200">{config.title} detail</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{selected.name}</h2>
          <div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={selected.status} /><StatusBadge status={selected.priority} /><StatusBadge status="AI Monitored" /></div>
          <section className="mt-6 rounded-lg border border-line bg-panel/75 p-4">
            <h3 className="font-semibold text-white">Operational summary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{selected.metric}. Current owner is {selected.owner}, location is {selected.location}. OpsTrax AI recommends maintaining watch status until next checkpoint.</p>
          </section>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {Object.entries(selected).slice(0, 12).map(([key, value]) => (
              <div key={key} className="rounded-md border border-line bg-panel/70 p-3">
                <dt className="text-xs uppercase text-slate-500">{key}</dt>
                <dd className="mt-1 break-words text-slate-200">{String(value)}</dd>
              </div>
            ))}
          </dl>
          <section className="mt-5 rounded-lg border border-line bg-panel/70 p-4">
            <h3 className="font-semibold text-white">Timeline</h3>
            <div className="mt-3 space-y-3 text-sm text-slate-300">
              {['Record updated from API', 'AI risk score recalculated', 'Owner notified'].map((event) => <div key={event} className="flex gap-2"><span className="mt-1.5 h-2 w-2 rounded-full bg-teal" />{event}</div>)}
            </div>
          </section>
        </aside>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-lg p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">Create {config.title} record</h2>
            <p className="mt-2 text-sm text-slate-400">Creates a seeded-style operational record through the existing backend API.</p>
            <div className="mt-5 grid gap-3">
              {['Name', 'Owner', 'Location'].map((field) => <input key={field} disabled className="rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-500" placeholder={`${field} generated by demo API`} />)}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="rounded-md border border-line px-4 py-2 text-sm text-slate-200">Cancel</button>
              <button onClick={() => createMutation.mutate()} className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy">{createMutation.isPending ? 'Creating...' : 'Create record'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecialModulePanel({ config, rows }: { config: ModuleConfig; rows: ModuleRecord[] }) {
  if (config.key === 'customer-eta-portal') return <CustomerEtaPanel />;
  if (config.key === 'dashcam') return <DashcamPanel />;
  if (config.key === 'compliance') return <CompliancePanel />;
  if (config.key === 'reports-analytics') return <ReportsPanel />;
  if (['vehicles', 'drivers', 'jobs-orders', 'maintenance', 'work-orders', 'safety'].includes(config.key)) {
    return (
      <section className="glass-panel rounded-lg p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{config.title} intelligence layer</h2>
            <p className="mt-1 text-sm text-slate-400">Risk heat scoring, predictive badges, mission timeline, and AI recommendation chips tailored to this module.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Low Risk', 'Watch', 'High Risk', 'Critical'].map((risk) => <StatusBadge key={risk} status={risk} />)}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {rows.slice(0, 3).map((row, index) => (
            <div key={row.id} className="rounded-md border border-line bg-navy/70 p-3">
              <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-white">{row.name}</h3><StatusBadge status={index === 0 ? 'Predictive' : row.priority} /></div>
              <p className="mt-2 text-xs leading-5 text-slate-400">{row.metric}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return null;
}

function CustomerEtaPanel() {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <div>
          <p className="text-sm font-medium text-teal-200">OpsTrax ETA</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Premium customer tracking portal</h2>
          <p className="mt-2 text-sm text-slate-400">Delivery status, driver visibility, timeline milestones, proof-of-delivery readiness, and branded customer messaging.</p>
        </div>
        <div className="rounded-lg border border-teal/30 bg-teal/10 p-4 text-right">
          <p className="text-xs text-slate-400">Current ETA</p>
          <p className="mt-1 text-3xl font-semibold text-white">2:42 PM</p>
          <StatusBadge status="En Route" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {['Scheduled', 'Assigned', 'En Route', 'Arrived', 'Completed'].map((step, index) => <div key={step} className={`rounded-md border p-3 text-sm ${index < 3 ? 'border-teal/30 bg-teal/10 text-teal-100' : 'border-line bg-navy/70 text-slate-400'}`}>{step}</div>)}
      </div>
    </section>
  );
}

function DashcamPanel() {
  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-semibold text-white">AI Dashcam incident review</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {['Harsh braking', 'Following distance', 'Lane departure', 'No action'].map((event, index) => <div key={event} className="rounded-md border border-line bg-navy/70 p-3"><div className="aspect-video rounded bg-gradient-to-br from-slate-800 to-slate-950" /><div className="mt-3 flex items-center justify-between"><span className="text-sm text-white">{event}</span><StatusBadge status={index < 2 ? 'Review' : 'Processed'} /></div></div>)}
      </div>
    </section>
  );
}

function CompliancePanel() {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-white">Compliance readiness center</h2><p className="mt-1 text-sm text-slate-400">Audit score, document vault, HOS/ELD, DVIR completion, and expiring file risk.</p></div>
        <div className="text-right"><p className="text-3xl font-semibold text-white">91%</p><StatusBadge status="Audit Ready" /></div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {['Expiring documents', 'HOS / ELD status', 'DVIR completion', 'Driver qualification files'].map((item, index) => <div key={item} className="rounded-md border border-line bg-navy/70 p-3"><p className="text-sm text-white">{item}</p><p className="mt-2 text-xs text-slate-400">{index === 0 ? '2 items require action' : 'Within tolerance'}</p></div>)}
      </div>
    </section>
  );
}

function ReportsPanel() {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><h2 className="text-lg font-semibold text-white">Enterprise analytics workspace</h2><p className="mt-1 text-sm text-slate-400">Scheduled reports, export controls, and operational filters for fleet, safety, fuel, maintenance, SLA, and compliance.</p></div>
        <div className="flex gap-2"><button className="rounded-md border border-line px-3 py-2 text-sm text-slate-200"><Filter size={15} className="inline" /> Filters</button><button className="rounded-md bg-teal px-3 py-2 text-sm font-semibold text-navy"><CalendarClock size={15} className="inline" /> Schedule</button></div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {['Fleet Utilization', 'Driver Safety', 'Fuel & Idling', 'Maintenance Cost', 'On-Time Delivery', 'Compliance Risk', 'Customer SLA'].map((report) => <div key={report} className="rounded-md border border-line bg-navy/70 p-3 text-sm text-white">{report}</div>)}
      </div>
    </section>
  );
}
