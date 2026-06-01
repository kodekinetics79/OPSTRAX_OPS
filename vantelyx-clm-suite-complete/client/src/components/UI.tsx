import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { cx } from '../utils/format';
import type { RiskLevel } from '../types/domain';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={cx('rounded-4xl border border-slate-200 bg-white p-5 shadow-soft md:p-6', className)}>{children}</section>;
}

export function SectionTitle({ eyebrow, title, desc, action }: { eyebrow?: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-600">{eyebrow}</p>}
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 md:text-2xl">{title}</h2>
        {desc && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100'
  } as const;
  return <span className={cx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black', tones[tone])}>{children}</span>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const tone: Record<RiskLevel, 'green' | 'amber' | 'red' | 'violet'> = {
    Low: 'green',
    Medium: 'amber',
    High: 'red',
    Critical: 'violet'
  };
  return <Badge tone={tone[risk]}>{risk}</Badge>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{label ?? 'Progress'}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function StatCard({ label, value, note, tone = 'blue', icon }: { label: string; value: string; note: string; tone?: 'blue' | 'green' | 'amber' | 'red' | 'violet'; icon?: ReactNode }) {
  const tones = {
    blue: 'from-brand-600 to-blue-400',
    green: 'from-emerald-600 to-teal-400',
    amber: 'from-amber-500 to-orange-400',
    red: 'from-red-600 to-rose-400',
    violet: 'from-violet-700 to-fuchsia-500'
  } as const;
  return (
    <Card className="relative overflow-hidden">
      <div className={cx('absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br opacity-15', tones[tone])} />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.20em] text-slate-500">{label}</p>
          {icon && <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">{icon}</div>}
        </div>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
      </div>
    </Card>
  );
}

export function EmptyState({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="rounded-4xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Circle size={20} />
      </div>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function MiniMetric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
      {note && <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  );
}

export function StatusIcon({ status }: { status: 'good' | 'warning' | 'danger' }) {
  if (status === 'good') return <CheckCircle2 className="text-emerald-600" size={18} />;
  if (status === 'warning') return <AlertTriangle className="text-amber-600" size={18} />;
  return <XCircle className="text-red-600" size={18} />;
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; type?: 'button' | 'submit'; disabled?: boolean; className?: string }) {
  const variants = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800',
    secondary: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  } as const;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx('inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100';
