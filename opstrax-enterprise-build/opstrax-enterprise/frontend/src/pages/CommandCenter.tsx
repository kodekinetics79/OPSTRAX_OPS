import { useMemo, useState } from 'react';
import type React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Icons from 'lucide-react';
import { AlertTriangle, Brain, CheckCircle2, ChevronRight, Clock, Eye, Filter, RadioTower, ShieldCheck, Sparkles } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CommandMap from '../components/CommandMap';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import {
  acknowledgeCommandAction,
  completeCommandAction,
  fetchCommandCenterSummary,
  type AiRecommendation,
  type CommandAction,
  type CommandCenterSummary
} from '../services/commandCenterApi';

const statusTone: Record<string, 'good' | 'warn' | 'bad' | 'info' | 'ai'> = {
  Healthy: 'good',
  Watch: 'warn',
  'At Risk': 'bad',
  Critical: 'bad',
  'High Idle': 'bad',
  'Audit Risk': 'warn',
  Coaching: 'ai'
};

function iconFor(name: string) {
  return (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name] ?? Icons.Activity;
}

export default function CommandCenter() {
  const [selectedInsight, setSelectedInsight] = useState<AiRecommendation | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['command-center-summary'], queryFn: fetchCommandCenterSummary, refetchInterval: 30000 });
  const acknowledge = useMutation({ mutationFn: acknowledgeCommandAction, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['command-center-summary'] }) });
  const complete = useMutation({ mutationFn: completeCommandAction, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['command-center-summary'] }) });

  const now = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(new Date()), []);

  if (isLoading) return <div className="glass-panel rounded-lg p-10 text-center text-slate-400">Loading OpsTrax Command Center...</div>;
  if (isError || !data) return <div className="glass-panel rounded-lg p-10 text-center text-red-200">Command Center data is unavailable. Check the API connection.</div>;

  return (
    <div className="space-y-6">
      <ExecutiveHero data={data} generatedAt={now} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
        {data.kpis.map((kpi) => {
          const Icon = iconFor(kpi.icon);
          return (
            <button key={kpi.key} className="text-left" title={`Filter intent: ${kpi.actionIntent}`}>
              <KpiCard label={kpi.label} value={kpi.value} trend={kpi.trend} status={kpi.status} tone={statusTone[kpi.status] ?? 'info'} icon={Icon} />
              <p className="mt-2 px-1 text-xs leading-5 text-slate-500">{kpi.explanation}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.35fr_.85fr]">
        <section className="glass-panel rounded-lg p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Premium live operations map preview</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Fleet control map</h2>
            </div>
            <a href="/control-tower" className="inline-flex items-center justify-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy">
              <RadioTower size={16} /> Open Control Tower
            </a>
          </div>
          <CommandMap vehicles={data.mapPreview.vehicles} events={data.timeline.map((event) => ({ id: event.id, title: event.title, severity: event.severity }))} compact />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {data.mapPreview.geofences.map((zone) => (
              <div key={zone.name} className="rounded-md border border-line bg-navy/65 p-3">
                <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-white">{zone.name}</span><StatusBadge status={zone.severity} /></div>
              </div>
            ))}
          </div>
        </section>

        <AiExecutiveBrief insights={data.aiBrief} selectedInsight={selectedInsight} onSelect={setSelectedInsight} />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[420px_1fr]">
        <PriorityActionQueue actions={data.priorityActions} onAcknowledge={(id) => acknowledge.mutate(id)} onComplete={(id) => complete.mutate(id)} busy={acknowledge.isPending || complete.isPending} />
        <Charts data={data} />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1fr_420px]">
        <FleetSnapshot data={data} />
        <DispatchSnapshot data={data} />
      </div>

      <MissionTimeline data={data} />
    </div>
  );
}

function ExecutiveHero({ data, generatedAt }: { data: CommandCenterSummary; generatedAt: string }) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-lg p-6">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-teal/10 via-skyx/10 to-transparent" />
      <div className="relative grid gap-5 xl:grid-cols-[1fr_420px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Command Center</span>
            <ChevronRight size={14} />
            <span>{generatedAt}</span>
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">OpsTrax Command Center</h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-300">Connected transport. Intelligent control. Enterprise execution.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge status="Live Simulation" />
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-100"><Sparkles size={14} /> OpsTrax AI Active</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-xs font-medium text-teal-100"><ShieldCheck size={14} /> Operational status: {data.operationalStatus}</span>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-navy/75 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><Brain className="text-purple-200" size={18} /> Executive Brief Mode</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{data.executiveBrief}</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Object.entries(data.riskHeatScore).map(([label, score]) => (
              <div key={label} className="rounded-md border border-line bg-panel/70 p-2 text-center">
                <p className="text-lg font-semibold text-white">{score}</p>
                <p className="text-[11px] capitalize text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AiExecutiveBrief({ insights, selectedInsight, onSelect }: { insights: AiRecommendation[]; selectedInsight: AiRecommendation | null; onSelect: (insight: AiRecommendation) => void }) {
  const active = selectedInsight ?? insights[0];
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex items-center gap-2"><Brain className="text-purple-200" /><h2 className="text-xl font-semibold text-white">OpsTrax AI Executive Brief</h2></div>
      <p className="mt-2 text-sm leading-6 text-slate-400">Explainable AI recommendations grounded in seeded operational data, with evidence and next-action guidance.</p>
      <div className="mt-4 space-y-3">
        {insights.slice(0, 6).map((insight) => (
          <button key={insight.id} onClick={() => onSelect(insight)} className={`w-full rounded-md border p-3 text-left transition ${active?.id === insight.id ? 'border-purple-300/60 bg-purple-500/15' : 'border-line bg-navy/65 hover:border-purple-300/40'}`}>
            <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-white">{insight.category}</span><StatusBadge status={insight.severity} /></div>
            <p className="mt-1 text-sm text-slate-300">{insight.title}</p>
          </button>
        ))}
      </div>
      {active && (
        <div className="mt-4 rounded-lg border border-purple-400/20 bg-purple-500/10 p-4">
          <h3 className="font-semibold text-white">{active.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{active.insight}</p>
          <div className="mt-3 rounded-md border border-line bg-navy/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Evidence</p>
            <p className="mt-1 text-xs text-slate-300">{active.evidenceJson}</p>
          </div>
          <div className="mt-3 rounded-md border border-line bg-navy/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Suggested action</p>
            <p className="mt-1 text-sm text-slate-200">{active.recommendedAction}</p>
          </div>
          <button className="mt-4 rounded-md bg-purple-400 px-4 py-2 text-sm font-semibold text-navy">Create AI action</button>
        </div>
      )}
    </section>
  );
}

function PriorityActionQueue({ actions, onAcknowledge, onComplete, busy }: { actions: CommandAction[]; onAcknowledge: (id: number) => void; onComplete: (id: number) => void; busy: boolean }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-wide text-slate-500">AI Action Queue</p><h2 className="text-xl font-semibold text-white">Priority actions</h2></div>
        <StatusBadge status={`${actions.filter((a) => a.status !== 'Completed').length} Open`} />
      </div>
      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <article key={action.id} className="rounded-lg border border-line bg-navy/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2"><StatusBadge status={action.priority} /><StatusBadge status={action.status} /></div>
                <h3 className="mt-3 font-semibold text-white">{action.title}</h3>
              </div>
              <AlertTriangle className={action.priority === 'Critical' ? 'text-red-200' : action.priority === 'High' ? 'text-amber-200' : 'text-skyx'} size={20} />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
              <span>Entity: {action.linkedEntityType}:{action.linkedEntityId}</span>
              <span>Owner: {action.ownerRole}</span>
              <span>Due: {new Date(action.dueAt).toLocaleString()}</span>
              <span>Type: {action.category}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button disabled={busy || action.status === 'Acknowledged' || action.status === 'Completed'} onClick={() => onAcknowledge(action.id)} className="rounded-md border border-line px-3 py-2 text-xs text-slate-200 disabled:opacity-40">Acknowledge</button>
              <button disabled={busy || action.status === 'Completed'} onClick={() => onComplete(action.id)} className="rounded-md bg-teal px-3 py-2 text-xs font-semibold text-navy disabled:opacity-40">Complete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Charts({ data }: { data: CommandCenterSummary }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex items-center gap-2"><Icons.BarChart3 className="text-skyx" /><h2 className="text-xl font-semibold text-white">Command analytics</h2></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        <ChartCard title="Weekly completed jobs"><AreaChart data={data.charts.weeklyCompletedJobs}><CartesianGrid stroke="#253247" /><XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: '#121c2a', border: '1px solid #253247' }} /><Area type="monotone" dataKey="completed" stroke="#38bdf8" fill="#38bdf855" /><Area type="monotone" dataKey="onTime" stroke="#14b8a6" fill="#14b8a655" /></AreaChart></ChartCard>
        <ChartCard title="On-time delivery trend"><AreaChart data={data.charts.onTimeDeliveryTrend}><CartesianGrid stroke="#253247" /><XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" domain={[80, 100]} /><Tooltip contentStyle={{ background: '#121c2a', border: '1px solid #253247' }} /><Area type="monotone" dataKey="percent" stroke="#22c55e" fill="#22c55e44" /></AreaChart></ChartCard>
        <ChartCard title="Idle cost trend"><BarChart data={data.charts.idleCostTrend}><CartesianGrid stroke="#253247" /><XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: '#121c2a', border: '1px solid #253247' }} /><Bar dataKey="cost" fill="#f59e0b" radius={[5, 5, 0, 0]} /></BarChart></ChartCard>
        <ChartCard title="Safety score trend"><AreaChart data={data.charts.safetyScoreTrend}><CartesianGrid stroke="#253247" /><XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" domain={[86, 100]} /><Tooltip contentStyle={{ background: '#121c2a', border: '1px solid #253247' }} /><Area type="monotone" dataKey="score" stroke="#14b8a6" fill="#14b8a655" /></AreaChart></ChartCard>
        <ChartCard title="Maintenance risk by vehicle type"><PieChart><Pie data={data.charts.maintenanceRiskByVehicleType} innerRadius={48} outerRadius={80} dataKey="value" paddingAngle={4}>{['#a855f7', '#38bdf8', '#14b8a6', '#f59e0b'].map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip contentStyle={{ background: '#121c2a', border: '1px solid #253247' }} /></PieChart></ChartCard>
        <ChartCard title="Jobs by status"><BarChart data={data.charts.jobsByStatus}><CartesianGrid stroke="#253247" /><XAxis dataKey="status" stroke="#94a3b8" hide /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: '#121c2a', border: '1px solid #253247' }} /><Bar dataKey="count" fill="#38bdf8" radius={[5, 5, 0, 0]} /></BarChart></ChartCard>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {data.costLeakageRadar.map((item) => (
          <div key={item.category} className="rounded-md border border-line bg-navy/70 p-3">
            <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-white">{item.category}</p><StatusBadge status={item.severity} /></div>
            <p className="mt-2 text-xl font-semibold text-white">${item.value.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.explanation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return <div className="rounded-lg border border-line bg-navy/55 p-4"><h3 className="text-sm font-semibold text-white">{title}</h3><div className="mt-3 h-56"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></div>;
}

function FleetSnapshot({ data }: { data: CommandCenterSummary }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-white">Fleet snapshot: attention needed</h2><button className="rounded-md border border-line px-3 py-2 text-sm text-slate-200"><Filter size={15} className="inline" /> Filter</button></div>
      <div className="overflow-x-auto opstrax-scroll">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500"><tr>{['Vehicle', 'Driver', 'Status', 'Current Job', 'Location/Zone', 'ETA', 'Risk', 'Recommended Action'].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {data.fleetSnapshot.map((row) => (
              <tr key={row.vehicle} className="hover:bg-white/[0.03]">
                <td className="px-3 py-3 font-medium text-white">{row.vehicle}</td>
                <td className="px-3 py-3 text-slate-300">{row.driver}</td>
                <td className="px-3 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-3 py-3 text-slate-300">{row.currentJob}</td>
                <td className="px-3 py-3 text-slate-300">{row.location}</td>
                <td className="px-3 py-3 text-slate-300">{row.eta}</td>
                <td className="px-3 py-3"><StatusBadge status={row.riskScore > 80 ? 'Critical' : row.riskScore > 60 ? 'High Risk' : row.riskScore > 35 ? 'Watch' : 'Low Risk'} /></td>
                <td className="px-3 py-3 text-slate-300">{row.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DispatchSnapshot({ data }: { data: CommandCenterSummary }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-xl font-semibold text-white">Dispatch snapshot</h2>
      <div className="mt-4 space-y-3">
        {data.dispatchSnapshot.map((item) => (
          <div key={item.status} className="rounded-md border border-line bg-navy/70 p-3">
            <div className="flex items-center justify-between gap-3"><span className="font-medium text-white">{item.status}</span><StatusBadge status={item.risk} /></div>
            <div className="mt-3 h-2 rounded-full bg-white/5"><div className="h-2 rounded-full bg-teal" style={{ width: `${Math.min(100, item.count * 14)}%` }} /></div>
            <p className="mt-2 text-xs text-slate-400">{item.count} jobs</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MissionTimeline({ data }: { data: CommandCenterSummary }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex items-center gap-2"><Clock className="text-amber-200" /><h2 className="text-xl font-semibold text-white">Mission Control Timeline</h2></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.timeline.slice(0, 12).map((event) => (
          <article key={event.id} className="rounded-lg border border-line bg-navy/70 p-4">
            <div className="flex items-center justify-between gap-2"><StatusBadge status={event.severity} /><span className="text-xs text-slate-500">{new Date(event.occurredAt).toLocaleTimeString()}</span></div>
            <h3 className="mt-3 font-semibold text-white">{event.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{event.description}</p>
            <p className="mt-3 text-xs text-slate-500">{event.eventType} - {event.linkedEntityType}:{event.linkedEntityId}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-200"><Eye size={15} /> View all events</button>
        <button className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-200"><CheckCircle2 size={15} /> Export timeline</button>
      </div>
    </section>
  );
}
