import { useState } from 'react';
import { Bot, ClipboardCheck, FileText, MessageSquare, Send, Sparkles, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { postData } from '../services/api';

const categories = ['Cost Leakage', 'Dispatch Risk', 'Maintenance Planning', 'Driver Coaching', 'Safety Review', 'Compliance Audit', 'Customer SLA', 'Executive Summary'];
const prompts = [
  'Which vehicles are costing us the most this week?',
  'Which jobs are at risk today?',
  'Which drivers need coaching?',
  "Create next week's maintenance plan.",
  'Generate an incident report.',
  "Summarize yesterday's fleet performance.",
  'Find idle cost leakage.',
  'Show compliance risks.'
];

export default function AICopilot() {
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'OpsTrax AI is monitoring dispatch, cost, safety, compliance, and maintenance signals. Choose a prompt or ask a fleet operations question.' }]);
  const [input, setInput] = useState(prompts[0]);
  const [loading, setLoading] = useState(false);

  async function ask(prompt = input) {
    if (!prompt) return;
    setLoading(true);
    setMessages((items) => [...items, { role: 'user', text: prompt }]);
    const answer = await postData<{ answer: string }>('/ai/ask', { prompt });
    setMessages((items) => [...items, { role: 'assistant', text: answer.answer }]);
    setInput('');
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="OpsTrax AI Copilot"
        description="Premium operational intelligence workspace for cost leakage, dispatch risk, maintenance planning, driver coaching, compliance audits, and executive summaries."
        actions={<StatusBadge status="AI Active" />}
      />
      <div className="grid gap-5 2xl:grid-cols-[260px_1fr_360px]">
        <aside className="glass-panel rounded-lg p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Prompt categories</h2>
          <div className="mt-4 space-y-2">
            {categories.map((category, index) => (
              <button key={category} onClick={() => setInput(prompts[index] ?? prompts[0])} className="w-full rounded-md border border-line bg-navy/60 px-3 py-2.5 text-left text-sm text-slate-300 transition hover:border-purple-300/50 hover:bg-purple-500/10 hover:text-white">
                {category}
              </button>
            ))}
          </div>
        </aside>

        <section className="glass-panel rounded-lg">
          <div className="flex items-center gap-3 border-b border-line p-5">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-purple-400/30 bg-purple-500/15 text-purple-100"><Bot /></div>
            <div>
              <h2 className="text-xl font-semibold text-white">Operational intelligence workspace</h2>
              <p className="text-sm text-slate-400">Connected to backend endpoint <span className="text-slate-300">/api/ai/ask</span></p>
            </div>
          </div>
          <div className="h-[560px] space-y-4 overflow-y-auto p-5 opstrax-scroll">
            {messages.map((message, index) => (
              <div key={index} className={`max-w-3xl rounded-lg border p-4 soft-enter ${message.role === 'user' ? 'ml-auto border-teal/30 bg-teal/15 text-teal-50' : 'border-purple-400/20 bg-navy/75 text-slate-200'}`}>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">{message.role === 'user' ? <MessageSquare size={14} /> : <Sparkles size={14} />} {message.role}</div>
                <p className="leading-6">{message.text}</p>
                {message.role === 'assistant' && index > 0 && (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {['Evidence: seeded jobs, vehicles, safety events', 'Recommended: notify dispatcher', 'Confidence: 86%'].map((item) => <div key={item} className="rounded-md border border-line bg-panel/70 p-3 text-xs text-slate-300">{item}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-line p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.slice(0, 4).map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1.5 text-xs text-teal-100 hover:border-teal/60">{prompt}</button>)}
            </div>
            <div className="flex gap-3">
              <input value={input} onChange={(event) => setInput(event.target.value)} className="flex-1 rounded-md border border-line bg-navy/70 px-3 py-3 text-sm outline-none focus:border-teal" placeholder="Ask OpsTrax AI..." />
              <button disabled={loading || !input} onClick={() => ask()} className="inline-flex items-center gap-2 rounded-md bg-teal px-4 py-2 font-semibold text-navy disabled:opacity-50"><Send size={16} /> Ask</button>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="glass-panel rounded-lg p-4">
            <h2 className="font-semibold text-white">AI-generated action cards</h2>
            <div className="mt-4 space-y-3">
              {[
                [Wrench, 'Create Work Order', 'Vehicle 112 recovery and diagnostics'],
                [MessageSquare, 'Notify Dispatcher', 'JOB-1006 SLA delay watch'],
                [ClipboardCheck, 'Create Coaching Task', 'Repeat safety event pattern'],
                [FileText, 'Export Report', 'Executive fleet performance brief']
              ].map(([Icon, title, body]) => {
                const TypedIcon = Icon as typeof Wrench;
                return (
                  <button key={title as string} className="w-full rounded-md border border-line bg-navy/70 p-3 text-left transition hover:border-purple-300/50">
                    <div className="flex gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-purple-500/15 text-purple-100"><TypedIcon size={17} /></div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{title as string}</h3>
                        <p className="mt-1 text-xs text-slate-400">{body as string}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="glass-panel rounded-lg p-4">
            <h2 className="font-semibold text-white">Suggested prompts</h2>
            <div className="mt-4 space-y-2">
              {prompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="w-full rounded-md border border-line bg-navy/60 p-3 text-left text-xs text-slate-300 hover:border-teal/40">{prompt}</button>)}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
