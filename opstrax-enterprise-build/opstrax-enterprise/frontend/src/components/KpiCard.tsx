import { Activity, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type React from 'react';

type KpiCardProps = {
  label: string;
  value: string | number;
  trend?: string;
  tone?: 'good' | 'warn' | 'bad' | 'info' | 'ai';
  status?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

const tones = {
  good: 'from-emerald-500/16 border-emerald-400/30 text-emerald-100',
  warn: 'from-amber-500/16 border-amber-400/30 text-amber-100',
  bad: 'from-red-500/16 border-red-400/30 text-red-100',
  info: 'from-sky-500/16 border-sky-400/30 text-sky-100',
  ai: 'from-purple-500/18 border-purple-400/30 text-purple-100'
};

export default function KpiCard({ label, value, trend = 'Live', tone = 'info', status = 'Nominal', icon: Icon = Activity }: KpiCardProps) {
  const TrendIcon = tone === 'bad' || tone === 'warn' ? ArrowDownRight : tone === 'info' ? Minus : ArrowUpRight;
  return (
    <div className={`group relative overflow-hidden rounded-lg border bg-gradient-to-br ${tones[tone]} to-panel/95 p-4 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/25`}>
      <div className="absolute right-0 top-0 h-20 w-24 bg-white/5 blur-2xl transition group-hover:bg-white/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <strong className="mt-2 block text-3xl font-semibold tracking-tight text-white">{value}</strong>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/5">
          <Icon size={18} />
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-xs"><TrendIcon size={14} /> {trend}</span>
        <span className="rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[11px] text-slate-300">{status}</span>
      </div>
      <div className="relative mt-4 flex h-8 items-end gap-1 opacity-70">
        {[35, 58, 42, 72, 64, 88, 76].map((height, index) => <span key={index} className="flex-1 rounded-t bg-current/35" style={{ height: `${height}%` }} />)}
      </div>
    </div>
  );
}
