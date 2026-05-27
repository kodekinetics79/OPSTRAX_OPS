import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Bell, Brain, ChevronDown, Command, Menu, Moon, Search, ShieldCheck, Signal } from 'lucide-react';
import { modules } from '../modules/moduleConfig';

function ModuleIcon({ name }: { name: string }) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[name] ?? Icons.Circle;
  return <Icon size={17} />;
}

export default function AppShell() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('opstrax_user') ?? '{"name":"Demo Admin","role":"Administrator","company":"OpsTrax Logistics"}');
  const groups = [
    { title: 'Command', keys: ['command-center', 'control-tower'] },
    { title: 'Dispatch', keys: ['dispatch-board', 'jobs-orders', 'route-planning', 'customer-eta-portal'] },
    { title: 'Fleet', keys: ['vehicles', 'drivers', 'assets', 'fuel-idling', 'carrier-management'] },
    { title: 'Maintenance', keys: ['maintenance', 'work-orders'] },
    { title: 'Safety', keys: ['safety', 'dashcam'] },
    { title: 'Compliance', keys: ['compliance', 'hos-eld', 'dvir-inspections', 'audit-logs'] },
    { title: 'Finance', keys: ['clients-customers', 'contracts-rates', 'expenses', 'billing-subscription'] },
    { title: 'Intelligence', keys: ['reports-analytics', 'sla-kpi-center', 'predictive-cost-margin', 'ai-copilot'] },
    { title: 'Platform', keys: ['integrations', 'user-management', 'settings'] }
  ];

  return (
    <div className="flex min-h-screen bg-transparent text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-76 border-r border-white/10 bg-[#07101d]/95 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex lg:w-80 lg:flex-col">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 border-b border-white/10 px-5 py-5 text-left">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-teal/40 bg-gradient-to-br from-teal to-skyx text-lg font-black text-navy shadow-lg shadow-teal/20">OT</div>
          <div>
            <div className="text-lg font-semibold text-white">OpsTrax</div>
            <div className="text-xs text-slate-400">Transport Management Solution</div>
          </div>
        </button>
        <nav className="flex-1 overflow-y-auto p-3 opstrax-scroll">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{group.title}</p>
              {modules.filter((module) => group.keys.includes(module.key)).map((module) => (
                <NavLink
                  key={module.key}
                  to={module.path}
                  className={({ isActive }) => `group relative mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition duration-200 ${isActive ? 'bg-teal/12 text-teal-50 shadow-lg shadow-teal/5' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`absolute left-0 top-2 h-6 w-0.5 rounded-full transition ${isActive ? 'bg-teal shadow-[0_0_18px_rgba(20,184,166,0.9)]' : 'bg-transparent'}`} />
                      <span className={`grid h-7 w-7 place-items-center rounded-md border transition ${isActive ? 'border-teal/40 bg-teal/15 text-teal-100' : 'border-transparent bg-white/[0.03] text-slate-500 group-hover:text-white'}`}>
                        <ModuleIcon name={module.icon} />
                      </span>
                      <span className="truncate">{module.title}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-100"><Brain size={16} /> OpsTrax AI Active</div>
            <p className="mt-1 text-xs leading-5 text-slate-400">Monitoring cost leakage, safety risk, and service predictions.</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-80">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-[#07101d]/86 px-4 backdrop-blur-xl md:px-6">
          <button className="rounded-md border border-line p-2 text-slate-300 lg:hidden"><Menu size={18} /></button>
          <div className="relative hidden flex-1 md:block">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input className="w-full max-w-2xl rounded-md border border-white/10 bg-white/[0.04] py-2 pl-10 pr-3 text-sm outline-none transition focus:border-teal focus:bg-white/[0.07]" placeholder="Search vehicles, jobs, drivers, customers, documents..." />
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-xs font-medium text-teal-100 xl:inline-flex"><Signal size={14} /> Demo / Live Simulation</span>
          <span className="hidden items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100 xl:inline-flex"><Brain size={14} /> AI Active</span>
          <button className="rounded-md border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition hover:border-teal/40 hover:text-white"><Moon size={18} /></button>
          <button className="relative rounded-md border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition hover:border-amber-400/40 hover:text-white">
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amberx shadow-[0_0_14px_rgba(245,158,11,0.9)]" />
          </button>
          <button className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 transition hover:border-teal/40 lg:flex">
            <ShieldCheck size={16} /> {user.company} <ChevronDown size={14} />
          </button>
          <button className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 transition hover:border-skyx/40 sm:flex">
            <Command size={16} />
            <span className="hidden xl:inline">Command Mode</span>
          </button>
          <div className="hidden rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-right text-sm sm:block">
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-xs text-slate-500">{user.role}</div>
          </div>
        </header>
        <main className="p-4 md:p-6 xl:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
