import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal, Search, Sparkles, Truck } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { getData } from '../services/api';

const columns = ['Unassigned', 'Assigned', 'En Route', 'At Stop', 'Completed', 'Delayed / Exception'];

export default function DispatchBoard() {
  const { data = [], isLoading } = useQuery({ queryKey: ['dispatch-board'], queryFn: () => getData<any[]>('/dispatch/board') });
  const count = (status: string) => data.filter((item) => item.status === status).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dispatch"
        title="Dispatch Board"
        description="Modern operational board for assigning drivers, vehicles, job priority, SLA status, ETA risk, and exception recovery."
        actions={<button className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy">Optimize assignments</button>}
      />

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {columns.map((column) => <KpiCard key={column} label={column} value={count(column)} trend="Board" status={column === 'Delayed / Exception' ? 'Watch' : 'Active'} tone={column === 'Delayed / Exception' ? 'warn' : column === 'Completed' ? 'good' : 'info'} icon={Truck} />)}
      </div>

      <section className="glass-panel rounded-lg p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input className="w-full rounded-md border border-line bg-navy/70 py-2 pl-10 pr-3 text-sm outline-none focus:border-teal" placeholder="Search job, customer, driver, vehicle..." />
          </div>
          <div className="flex flex-wrap gap-2">
            {['SLA Watch', 'High Priority', 'Unassigned', 'Late Risk', 'AI Suggested'].map((filter) => <button key={filter} className="rounded-full border border-line bg-navy/70 px-3 py-1.5 text-xs text-slate-300 hover:border-teal/40">{filter}</button>)}
          </div>
        </div>
        <div className="mt-4 rounded-md border border-purple-400/20 bg-purple-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-100"><Sparkles size={16} /> AI dispatch recommendation</div>
          <p className="mt-2 text-sm text-slate-300">Suggested match: assign Vehicle 106 with Priya Shah to the UrbanMed expedited SLA load. Best score is based on HOS availability, safety score, distance to pickup, and maintenance state.</p>
        </div>
      </section>

      {isLoading ? <div className="glass-panel rounded-lg p-10 text-slate-400">Loading board...</div> : (
        <div className="grid gap-4 xl:grid-cols-6">
          {columns.map((column) => (
            <section key={column} className="min-h-[620px] rounded-lg border border-line bg-panel/80 p-3 shadow-xl shadow-black/10">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">{column}</h2>
                <span className="rounded-full border border-line px-2 py-0.5 text-xs text-slate-400">{count(column)}</span>
              </div>
              <div className="space-y-3">
                {data.filter((item) => item.status === column).map((item, index) => (
                  <article key={item.id} className="group rounded-lg border border-line bg-navy/75 p-3 transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-lg hover:shadow-black/20">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                      <button className="text-slate-500 group-hover:text-white"><MoreHorizontal size={17} /></button>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Customer: {['Northstar Retail', 'Pioneer Foods', 'UrbanMed Supply'][index % 3]}</p>
                    <p className="mt-1 text-xs text-slate-500">Pickup/drop-off: {item.location} - Regional DC</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <span>Driver: {['Luis', 'Nina', 'Priya', 'Marcus'][index % 4]}</span>
                      <span>Vehicle: V{101 + index}</span>
                      <span>ETA: {column === 'Delayed / Exception' ? '42m late' : 'On track'}</span>
                      <span>SLA: {index % 4 === 0 ? 'Watch' : 'Green'}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={item.priority} />
                      <StatusBadge status={column === 'Delayed / Exception' ? 'Late Risk' : index % 3 === 0 ? 'SLA Watch' : 'Low Risk'} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
