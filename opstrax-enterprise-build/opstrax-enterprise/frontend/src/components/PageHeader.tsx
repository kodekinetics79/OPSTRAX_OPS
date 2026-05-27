import { ChevronRight, Sparkles } from 'lucide-react';
import type React from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  badge?: string;
};

export default function PageHeader({ eyebrow = 'OpsTrax', title, description, actions, badge = 'Live Simulation' }: PageHeaderProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-lg p-5 soft-enter">
      <div className="absolute right-0 top-0 h-32 w-80 bg-gradient-to-l from-teal/10 via-skyx/10 to-transparent" />
      <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{eyebrow}</span>
            <ChevronRight size={14} />
            <span className="text-teal-100">{badge}</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-100">
            <Sparkles size={14} /> OpsTrax AI Active
          </span>
          {actions}
        </div>
      </div>
    </section>
  );
}
