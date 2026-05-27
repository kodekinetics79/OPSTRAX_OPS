import { ArrowRight, Brain, ShieldAlert, Wrench } from 'lucide-react';
import StatusBadge from './StatusBadge';

const actions = [
  { icon: Brain, title: 'Review late jobs', body: '3 jobs are trending beyond SLA tolerance.', status: 'High Risk' },
  { icon: Wrench, title: 'Create service plan', body: '2 vehicles should be pulled forward for PM.', status: 'Service Soon' },
  { icon: ShieldAlert, title: 'Coach driver', body: '1 driver has repeat safety-review events.', status: 'Coaching Needed' }
];

export default function ActionQueue() {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-purple-200">AI Action Queue</p>
          <h2 className="mt-1 font-semibold text-white">Recommended next moves</h2>
        </div>
        <StatusBadge status="AI Active" />
      </div>
      <div className="mt-4 space-y-3">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.title} className="group w-full rounded-md border border-line bg-navy/70 p-3 text-left transition hover:border-purple-300/50 hover:bg-purple-500/10">
              <div className="flex gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md border border-purple-400/30 bg-purple-500/15 text-purple-100"><Icon size={17} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <ArrowRight className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-purple-100" size={15} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{item.body}</p>
                  <div className="mt-2"><StatusBadge status={item.status} /></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
