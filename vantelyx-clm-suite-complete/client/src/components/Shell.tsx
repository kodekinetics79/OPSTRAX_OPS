import {
  Activity,
  Archive,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  Gauge,
  GitBranch,
  Home,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  PenTool,
  PlaySquare,
  ScrollText,
  Settings,
  ShieldAlert,
  SquareStack,
  Workflow
} from 'lucide-react';
import type { ReactNode } from 'react';
import { brand } from '../config/brand';
import { cx } from '../utils/format';

export type ViewKey =
  | 'dashboard'
  | 'intake'
  | 'requestPortal'
  | 'repository'
  | 'workspace'
  | 'workflow'
  | 'obligations'
  | 'renewals'
  | 'vendors'
  | 'risk'
  | 'analytics'
  | 'templates'
  | 'esign'
  | 'integrations'
  | 'admin'
  | 'rfp';

const navItems: Array<{ key: ViewKey; label: string; icon: ReactNode; badge?: string; group: string }> = [
  { key: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={18} />, group: 'Control' },
  { key: 'intake', label: 'AI Intake', icon: <Bot size={18} />, badge: 'AI', group: 'Control' },
  { key: 'requestPortal', label: 'Request Portal', icon: <Home size={18} />, group: 'Control' },
  { key: 'repository', label: 'Repository', icon: <Archive size={18} />, group: 'Lifecycle' },
  { key: 'workspace', label: 'Workspace', icon: <ScrollText size={18} />, group: 'Lifecycle' },
  { key: 'workflow', label: 'Workflow Studio', icon: <Workflow size={18} />, group: 'Lifecycle' },
  { key: 'obligations', label: 'Obligations', icon: <ClipboardCheck size={18} />, group: 'Lifecycle' },
  { key: 'renewals', label: 'Renewals', icon: <CalendarClock size={18} />, group: 'Lifecycle' },
  { key: 'vendors', label: 'Vendors', icon: <Building2 size={18} />, group: 'Intelligence' },
  { key: 'risk', label: 'Risk & Compliance', icon: <ShieldAlert size={18} />, group: 'Intelligence' },
  { key: 'analytics', label: 'Analytics', icon: <Gauge size={18} />, group: 'Intelligence' },
  { key: 'templates', label: 'Templates & Clauses', icon: <SquareStack size={18} />, group: 'Platform' },
  { key: 'esign', label: 'E-Sign & Execution', icon: <PenTool size={18} />, group: 'Platform' },
  { key: 'integrations', label: 'Integrations', icon: <Link2 size={18} />, group: 'Platform' },
  { key: 'admin', label: 'Admin & Security', icon: <LockKeyhole size={18} />, group: 'Platform' },
  { key: 'rfp', label: 'RFP Coverage', icon: <FileCheck2 size={18} />, group: 'Platform' }
];

const titleByView: Record<ViewKey, string> = {
  dashboard: 'Executive contract command center',
  intake: 'AI-powered contract intake',
  requestPortal: 'Business request portal',
  repository: 'Contract repository system of record',
  workspace: 'Contract workspace and negotiation cockpit',
  workflow: 'Workflow studio and approval queue',
  obligations: 'Obligation command center',
  renewals: 'Renewal and notice management',
  vendors: 'Vendor and counterparty intelligence',
  risk: 'Risk, compliance, and audit readiness',
  analytics: 'Portfolio analytics and reporting',
  templates: 'Template and clause playbook library',
  esign: 'E-signature and execution control',
  integrations: 'Enterprise integrations hub',
  admin: 'Admin, roles, security, and governance',
  rfp: 'RFP feature coverage and differentiators'
};

export function Shell({ activeView, setActiveView, children, onNewContract }: { activeView: ViewKey; setActiveView: (view: ViewKey) => void; children: ReactNode; onNewContract: () => void }) {
  const groups = Array.from(new Set(navItems.map(item => item.group)));
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 border-r border-white/10 bg-slate-950 text-white shadow-soft xl:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-glow">
                <FileSearch size={24} />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight">{brand.productName}</p>
                <p className="text-xs text-slate-400">{brand.suiteName}</p>
              </div>
            </div>
          </div>

          <nav className="no-scrollbar flex-1 overflow-y-auto p-4">
            {groups.map(group => (
              <div key={group} className="mb-5">
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{group}</p>
                <div className="space-y-1">
                  {navItems.filter(item => item.group === group).map(item => (
                    <button
                      key={item.key}
                      onClick={() => setActiveView(item.key)}
                      className={cx(
                        'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition',
                        activeView === item.key ? 'bg-white text-slate-950 shadow-soft' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                      {item.badge && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-black text-white">{item.badge}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="m-4 rounded-4xl border border-white/10 bg-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <Activity size={16} /> Complete Product Build
            </div>
            <p className="text-xs leading-5 text-slate-300">
              Includes AI intake, repository, workflow, obligations, renewals, vendors, risk, reporting, templates, e-sign, integrations, and admin security.
            </p>
          </div>
        </div>
      </aside>

      <div className="xl:pl-80">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-brand-600"><GitBranch size={14} /> AI Contract Operations</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">{titleByView[activeView]}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setActiveView('analytics')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm">
                Export Board
              </button>
              <button onClick={onNewContract} className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-soft">
                + New Contract
              </button>
              <button onClick={() => setActiveView('intake')} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-black text-white shadow-soft">
                <span className="inline-flex items-center gap-2"><PlaySquare size={16} /> Run AI Intake</span>
              </button>
              <button className="relative rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
