import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  Download,
  Eye,
  FileCheck2,
  Filter,
  Gavel,
  Layers3,
  LineChart as LineChartIcon,
  Link2,
  LockKeyhole,
  Mail,
  PenTool,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
  Workflow,
  X
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Shell, type ViewKey } from './components/Shell';
import { Badge, Button, Card, Field, inputClass, MiniMetric, ProgressBar, RiskBadge, SectionTitle, StatCard, StatusIcon } from './components/UI';
import { rfpCoverage, seedState, trendData } from './data/seed';
import { loadState, resetSavedState, saveState } from './services/storage';
import type { AppState, Contract, ContractStatus, ContractType, IntakeAnalysis, ObligationStatus, RiskLevel, WorkflowStatus } from './types/domain';
import { daysUntil, downloadTextFile, makeId, money, shortDate } from './utils/format';

const statusTone: Record<ContractStatus, 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate'> = {
  Intake: 'blue',
  Drafting: 'slate',
  'Legal Review': 'violet',
  'Finance Review': 'blue',
  'Security Review': 'red',
  'Counterparty Review': 'amber',
  'Approval Pending': 'amber',
  'Ready for Signature': 'green',
  Executed: 'green',
  'Renewal Window': 'red',
  Expired: 'red',
  Terminated: 'slate'
};

const workflowTone: Record<WorkflowStatus, 'blue' | 'green' | 'amber' | 'red' | 'slate'> = {
  Waiting: 'slate',
  Active: 'blue',
  Approved: 'green',
  Rejected: 'red',
  Skipped: 'amber'
};

const riskWeight: Record<RiskLevel, number> = { Low: 20, Medium: 48, High: 74, Critical: 92 };

function audit(action: string, object: string, detail: string, actor = 'Vantelyx User') {
  return {
    id: makeId('AUD'),
    timestamp: new Date().toISOString(),
    actor,
    action,
    object,
    detail
  };
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

function App() {
  const [state, setState] = useState<AppState>(() => loadState(seedState));
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [selectedContractId, setSelectedContractId] = useState(state.contracts[0]?.id ?? '');
  const [showNewContract, setShowNewContract] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<IntakeAnalysis | null>(null);

  useEffect(() => saveState(state), [state]);

  const selectedContract = useMemo(() => state.contracts.find(contract => contract.id === selectedContractId) ?? state.contracts[0], [state.contracts, selectedContractId]);

  function createContract(input: {
    title: string;
    counterparty: string;
    type: ContractType;
    value: number;
    owner: string;
    department: string;
    riskScore?: number;
  }) {
    const nextNumber = String(state.contracts.length + 1).padStart(4, '0');
    const id = `VCLM-2026-${nextNumber}`;
    const riskScore = input.riskScore ?? 46;
    const riskLevel = riskFromScore(riskScore);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    const renewal = new Date(end);
    renewal.setDate(renewal.getDate() - 90);

    const baseClauses = state.clausePlaybook.slice(0, 3).map((item, index) => ({
      id: makeId('CL'),
      name: item.name,
      category: item.category,
      status: index === 1 && riskLevel !== 'Low' ? 'Needs Review' as const : 'Approved' as const,
      risk: item.risk,
      position: item.preferredLanguage,
      fallback: item.fallbackLanguage,
      note: index === 1 && riskLevel !== 'Low' ? 'AI detected this clause should be reviewed before approval.' : 'Aligned with approved playbook.'
    }));

    const contract: Contract = {
      id,
      title: input.title,
      counterparty: input.counterparty,
      type: input.type,
      status: 'Intake',
      value: input.value,
      currency: 'USD',
      owner: input.owner,
      department: input.department,
      legalEntity: 'Kode Kinetics LLC',
      jurisdiction: 'Virginia',
      paymentTerms: 'Net 30',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      renewalDate: renewal.toISOString().slice(0, 10),
      renewalNoticeDays: 90,
      riskScore,
      riskLevel,
      businessPriority: riskLevel,
      stage: 18,
      tags: ['New Intake', 'AI Ready'],
      aiSummary: 'Newly created contract record. Run AI review to extract clause deviations, obligations, risk drivers, and routing recommendations.',
      nextAction: 'Complete intake metadata, upload the agreement, and launch legal workflow.',
      clauses: baseClauses,
      obligations: [],
      documents: []
    };

    setState(current => ({
      ...current,
      contracts: [contract, ...current.contracts],
      workflowSteps: [
        { id: makeId('WF'), contractId: id, name: 'Business Intake Review', role: 'Business Owner', assignee: input.owner, status: 'Active', slaHours: 12, startedAt: new Date().toISOString() },
        { id: makeId('WF'), contractId: id, name: 'Legal Review', role: 'Legal Reviewer', assignee: 'Legal Queue', status: 'Waiting', slaHours: 48 },
        ...current.workflowSteps
      ],
      auditEvents: [audit('Contract created', id, `${input.title} created for ${input.counterparty}.`), ...current.auditEvents]
    }));
    setSelectedContractId(id);
    setActiveView('workspace');
    setShowNewContract(false);
  }

  function updateContractStatus(contractId: string, status: ContractStatus) {
    setState(current => ({
      ...current,
      contracts: current.contracts.map(contract => contract.id === contractId ? { ...contract, status, stage: Math.min(100, contract.stage + 10) } : contract),
      auditEvents: [audit('Status updated', contractId, `Status changed to ${status}.`), ...current.auditEvents]
    }));
  }

  function approveWorkflowStep(stepId: string) {
    setState(current => {
      const target = current.workflowSteps.find(step => step.id === stepId);
      if (!target) return current;
      let activatedNext = false;
      const workflowSteps = current.workflowSteps.map(step => {
        if (step.id === stepId) return { ...step, status: 'Approved' as const, completedAt: new Date().toISOString(), note: 'Approved from demo UI.' };
        if (!activatedNext && step.contractId === target.contractId && step.status === 'Waiting') {
          activatedNext = true;
          return { ...step, status: 'Active' as const, startedAt: new Date().toISOString() };
        }
        return step;
      });
      return {
        ...current,
        workflowSteps,
        auditEvents: [audit('Workflow approved', target.contractId, `${target.name} approved by ${target.assignee}.`), ...current.auditEvents]
      };
    });
  }

  function createObligation(contractId: string, title: string, owner: string, dueDate: string) {
    const obligation = {
      id: makeId('OBL'),
      contractId,
      title,
      owner,
      department: 'Operations',
      dueDate,
      status: 'Open' as const,
      priority: 'Medium' as const,
      sourceClause: 'Manual obligation',
      evidenceRequired: true
    };
    setState(current => ({
      ...current,
      obligations: [obligation, ...current.obligations],
      contracts: current.contracts.map(contract => contract.id === contractId ? { ...contract, obligations: [obligation, ...contract.obligations] } : contract),
      auditEvents: [audit('Obligation created', contractId, obligation.title), ...current.auditEvents]
    }));
  }

  function updateObligationStatus(obligationId: string, status: ObligationStatus) {
    setState(current => ({
      ...current,
      obligations: current.obligations.map(obligation => obligation.id === obligationId ? { ...obligation, status } : obligation),
      contracts: current.contracts.map(contract => ({ ...contract, obligations: contract.obligations.map(obligation => obligation.id === obligationId ? { ...obligation, status } : obligation) })),
      auditEvents: [audit('Obligation updated', obligationId, `Status changed to ${status}.`), ...current.auditEvents]
    }));
  }

  function runIntake(fileName: string, text: string, counterpartyHint: string) {
    const hasData = /data|privacy|customer|personal|phi|pii/i.test(text);
    const hasAutoRenew = /auto[-\s]?renew|renewal|notice/i.test(text);
    const hasUnlimited = /unlimited liability|uncapped|indemnity/i.test(text);
    const score = Math.min(96, 35 + (hasData ? 22 : 0) + (hasAutoRenew ? 15 : 0) + (hasUnlimited ? 24 : 0) + Math.floor(Math.random() * 8));
    const analysis: IntakeAnalysis = {
      id: makeId('AI'),
      fileName: fileName || 'pasted-contract-request.txt',
      agreementType: hasData ? 'Data Processing Agreement' : hasAutoRenew ? 'Software License' : 'Master Services Agreement',
      counterparty: counterpartyHint || 'Detected Counterparty LLC',
      value: hasUnlimited ? 525000 : hasData ? 245000 : 85000,
      riskScore: score,
      riskLevel: riskFromScore(score),
      detectedDates: ['Effective date detected', hasAutoRenew ? 'Renewal notice detected' : 'No renewal notice found'],
      flags: [
        hasData ? 'Data/privacy language detected — DPA and security review recommended.' : 'No obvious personal-data language detected.',
        hasAutoRenew ? 'Auto-renewal or renewal notice language detected.' : 'Renewal language may be missing or unclear.',
        hasUnlimited ? 'Potential uncapped liability or indemnity exposure detected.' : 'No explicit unlimited liability phrase detected.'
      ],
      suggestedRoute: ['Business Owner', 'Legal', ...(hasData ? ['Security / Privacy'] : []), ...(score > 65 ? ['Finance'] : [])],
      confidence: 88
    };
    setLatestAnalysis(analysis);
    setState(current => ({ ...current, auditEvents: [audit('AI intake analyzed', analysis.id, `${analysis.fileName} classified as ${analysis.agreementType}.`, 'Vantelyx AI'), ...current.auditEvents] }));
  }

  function createFromAnalysis() {
    if (!latestAnalysis) return;
    createContract({
      title: `${latestAnalysis.counterparty} ${latestAnalysis.agreementType}`,
      counterparty: latestAnalysis.counterparty,
      type: latestAnalysis.agreementType,
      value: latestAnalysis.value,
      owner: 'Business Requester',
      department: latestAnalysis.agreementType === 'Data Processing Agreement' ? 'Security' : 'IT',
      riskScore: latestAnalysis.riskScore
    });
  }

  function exportPortfolioCsv() {
    const rows = [
      ['ID', 'Title', 'Counterparty', 'Type', 'Status', 'Owner', 'Department', 'Value', 'Risk', 'Renewal Notice Date'],
      ...state.contracts.map(contract => [contract.id, contract.title, contract.counterparty, contract.type, contract.status, contract.owner, contract.department, String(contract.value), contract.riskLevel, contract.renewalDate])
    ];
    downloadTextFile('vantelyx-contract-portfolio.csv', rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n'));
  }

  function resetDemoData() {
    resetSavedState();
    setState(seedState);
    setSelectedContractId(seedState.contracts[0].id);
    setLatestAnalysis(null);
  }

  const view = (() => {
    switch (activeView) {
      case 'dashboard': return <Dashboard state={state} setActiveView={setActiveView} exportPortfolioCsv={exportPortfolioCsv} />;
      case 'intake': return <AiIntake latestAnalysis={latestAnalysis} runIntake={runIntake} createFromAnalysis={createFromAnalysis} />;
      case 'requestPortal': return <RequestPortal onCreate={createContract} />;
      case 'repository': return <Repository contracts={state.contracts} selectedId={selectedContractId} setSelectedId={setSelectedContractId} setActiveView={setActiveView} />;
      case 'workspace': return <ContractWorkspace state={state} selectedContract={selectedContract} setSelectedContractId={setSelectedContractId} updateContractStatus={updateContractStatus} createObligation={createObligation} />;
      case 'workflow': return <WorkflowStudio state={state} approveWorkflowStep={approveWorkflowStep} />;
      case 'obligations': return <Obligations state={state} updateObligationStatus={updateObligationStatus} createObligation={createObligation} />;
      case 'renewals': return <Renewals contracts={state.contracts} />;
      case 'vendors': return <Vendors state={state} />;
      case 'risk': return <RiskCompliance state={state} />;
      case 'analytics': return <Analytics state={state} exportPortfolioCsv={exportPortfolioCsv} />;
      case 'templates': return <Templates state={state} />;
      case 'esign': return <ESignature state={state} updateContractStatus={updateContractStatus} />;
      case 'integrations': return <Integrations state={state} />;
      case 'admin': return <AdminSecurity state={state} resetDemoData={resetDemoData} />;
      case 'rfp': return <RfpCoverage />;
      default: return <Dashboard state={state} setActiveView={setActiveView} exportPortfolioCsv={exportPortfolioCsv} />;
    }
  })();

  return (
    <Shell activeView={activeView} setActiveView={setActiveView} onNewContract={() => setShowNewContract(true)}>
      {view}
      {showNewContract && <NewContractModal onClose={() => setShowNewContract(false)} onCreate={createContract} />}
    </Shell>
  );
}

function Dashboard({ state, setActiveView, exportPortfolioCsv }: { state: AppState; setActiveView: (view: ViewKey) => void; exportPortfolioCsv: () => void }) {
  const totalValue = state.contracts.reduce((sum, contract) => sum + contract.value, 0);
  const highRisk = state.contracts.filter(contract => contract.riskLevel === 'High' || contract.riskLevel === 'Critical').length;
  const openObligations = state.obligations.filter(obligation => obligation.status !== 'Completed').length;
  const renewalsSoon = state.contracts.filter(contract => daysUntil(contract.renewalDate) <= 90).length;
  const priorityContracts = [...state.contracts].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Contracts" value={String(state.contracts.length)} note="Portfolio across intake, review, approval, execution, and renewal." icon={<Database size={18} />} />
        <StatCard label="Contract Value" value={money(totalValue)} note="Commercial exposure currently tracked by Vantelyx CLM." tone="green" icon={<LineChartIcon size={18} />} />
        <StatCard label="High Risk" value={String(highRisk)} note="Critical or high-risk agreements needing active oversight." tone="amber" icon={<AlertTriangle size={18} />} />
        <StatCard label="Open Obligations" value={String(openObligations)} note={`${renewalsSoon} renewal/notice items need attention within 90 days.`} tone="violet" icon={<ClipboardCheck size={18} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle eyebrow="Executive View" title="Contract velocity, execution, and cycle time" desc="This dashboard is designed for leadership: what is moving, what is stuck, what is risky, and where money or deadlines are exposed." action={<Button variant="secondary" onClick={exportPortfolioCsv}><Download size={16} /> Export CSV</Button>} />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="created" stroke="currentColor" strokeWidth={3} fill="currentColor" fillOpacity={0.08} />
                <Line type="monotone" dataKey="executed" stroke="currentColor" strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Priority Queue" title="What needs attention" />
          <div className="space-y-4">
            {priorityContracts.map(contract => (
              <button key={contract.id} onClick={() => setActiveView('workspace')} className="w-full rounded-3xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/30">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-black">{contract.title}</p>
                  <RiskBadge risk={contract.riskLevel} />
                </div>
                <p className="text-xs leading-5 text-slate-500">{contract.nextAction}</p>
              </button>
            ))}
            <div className="rounded-3xl bg-slate-950 p-4 text-white">
              <p className="font-black">AI recommendation</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">Focus today on renewal windows, DPA gaps, uncapped liability, and active approvals older than SLA.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <SectionTitle eyebrow="Risk Composition" title="Risk by contract" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state.contracts.map(contract => ({ name: contract.id.replace('VCLM-2026-', '#'), risk: contract.riskScore }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="risk" radius={[12, 12, 0, 0]} fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow="Fast Actions" title="Common contract actions" />
          <div className="grid gap-3">
            <Button onClick={() => setActiveView('intake')} className="justify-start"><Bot size={16} /> Analyze contract with AI intake</Button>
            <Button onClick={() => setActiveView('requestPortal')} variant="secondary" className="justify-start"><Mail size={16} /> Submit business request</Button>
            <Button onClick={() => setActiveView('workflow')} variant="secondary" className="justify-start"><Workflow size={16} /> Open approval queue</Button>
            <Button onClick={() => setActiveView('renewals')} variant="secondary" className="justify-start"><CalendarClock size={16} /> Review renewal exposure</Button>
          </div>
        </Card>
        <AuditFeed events={state.auditEvents} />
      </div>
    </div>
  );
}

function AiIntake({ latestAnalysis, runIntake, createFromAnalysis }: { latestAnalysis: IntakeAnalysis | null; runIntake: (fileName: string, text: string, counterpartyHint: string) => void; createFromAnalysis: () => void }) {
  const [fileName, setFileName] = useState('northstar-saas-agreement.pdf');
  const [counterparty, setCounterparty] = useState('Northstar Analytics LLC');
  const [text, setText] = useState('Agreement includes auto-renewal, customer data processing, data security obligations, indemnity, and uncapped liability language. Renewal notice appears to be 45 days.');

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <SectionTitle eyebrow="Smart Intake" title="Upload, classify, extract, and route contracts" desc="This screen simulates the AI document pipeline. Later it can connect to OCR, Azure OpenAI/OpenAI, document storage, email ingestion, and your .NET API." />
        <div className="rounded-4xl border-2 border-dashed border-slate-200 bg-slate-50 p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white shadow-soft">
              <UploadCloud size={30} />
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="File name / email subject">
                  <input className={inputClass} value={fileName} onChange={event => setFileName(event.target.value)} />
                </Field>
                <Field label="Counterparty hint">
                  <input className={inputClass} value={counterparty} onChange={event => setCounterparty(event.target.value)} />
                </Field>
              </div>
              <Field label="Paste contract text, email request, or extracted OCR text">
                <textarea className={`${inputClass} min-h-40`} value={text} onChange={event => setText(event.target.value)} />
              </Field>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => runIntake(fileName, text, counterparty)}><Sparkles size={16} /> Run AI Intake Preview</Button>
                <Button variant="secondary"><UploadCloud size={16} /> Attach File</Button>
                <Button variant="secondary"><Mail size={16} /> Pull From Email</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ['1', 'Classify', 'Agreement type, value, urgency, owner, and counterparty.'],
            ['2', 'Extract', 'Dates, terms, obligations, clauses, notice periods, parties.'],
            ['3', 'Compare', 'Playbook deviations, missing clauses, fallback positions.'],
            ['4', 'Route', 'Legal, finance, security, procurement, and executive approvals.']
          ].map(item => (
            <div key={item[0]} className="rounded-3xl border border-slate-200 p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-sm font-black text-brand-700">{item[0]}</div>
              <h4 className="font-black">{item[1]}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item[2]}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="AI Draft Output" title="Extraction preview" />
        {latestAnalysis ? (
          <div className="space-y-4">
            <InsightRow label="Agreement Type" value={latestAnalysis.agreementType} />
            <InsightRow label="Counterparty" value={latestAnalysis.counterparty} />
            <InsightRow label="Contract Value" value={money(latestAnalysis.value)} />
            <InsightRow label="Risk Score" value={`${latestAnalysis.riskScore}/100`} />
            <InsightRow label="Confidence" value={`${latestAnalysis.confidence}%`} />
            <div className="space-y-2">
              {latestAnalysis.flags.map(flag => <div key={flag} className="rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-800"><strong>Flag:</strong> {flag}</div>)}
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Suggested Route</p>
              <div className="flex flex-wrap gap-2">{latestAnalysis.suggestedRoute.map(route => <Badge key={route} tone="blue">{route}</Badge>)}</div>
            </div>
            <Button onClick={createFromAnalysis} className="w-full">Create Contract Record <ArrowRight size={16} /></Button>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">Run intake to see detected terms, risk score, route, flags, and one-click record creation.</div>
        )}
      </Card>
    </div>
  );
}

function RequestPortal({ onCreate }: { onCreate: (input: { title: string; counterparty: string; type: ContractType; value: number; owner: string; department: string }) => void }) {
  const [title, setTitle] = useState('New Vendor Services Agreement');
  const [counterparty, setCounterparty] = useState('New Vendor LLC');
  const [type, setType] = useState<ContractType>('Vendor Agreement');
  const [value, setValue] = useState('125000');
  const [owner, setOwner] = useState('Business Requester');
  const [department, setDepartment] = useState('Procurement');

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate({ title, counterparty, type, value: Number(value) || 0, owner, department });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <SectionTitle eyebrow="Business Request Portal" title="Create clean contract requests from day one" desc="This is the intake path for non-legal business users. It prevents incomplete requests from becoming messy email threads." />
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Contract title"><input className={inputClass} value={title} onChange={event => setTitle(event.target.value)} /></Field>
          <Field label="Counterparty"><input className={inputClass} value={counterparty} onChange={event => setCounterparty(event.target.value)} /></Field>
          <Field label="Contract type"><select className={inputClass} value={type} onChange={event => setType(event.target.value as ContractType)}>{['Vendor Agreement', 'NDA', 'Software License', 'Statement of Work', 'Master Services Agreement', 'Purchase Agreement', 'Data Processing Agreement'].map(option => <option key={option}>{option}</option>)}</select></Field>
          <Field label="Estimated value"><input className={inputClass} value={value} onChange={event => setValue(event.target.value)} /></Field>
          <Field label="Owner"><input className={inputClass} value={owner} onChange={event => setOwner(event.target.value)} /></Field>
          <Field label="Department"><input className={inputClass} value={department} onChange={event => setDepartment(event.target.value)} /></Field>
          <div className="md:col-span-2"><Button type="submit"><Plus size={16} /> Submit Contract Request</Button></div>
        </form>
      </Card>
      <Card>
        <SectionTitle eyebrow="Guardrails" title="Request quality score" />
        <div className="space-y-4">
          <ProgressBar value={88} label="Completeness" />
          {['Business purpose captured', 'Counterparty identified', 'Value range provided', 'Approval path can be estimated'].map(item => <div key={item} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={17} className="text-emerald-600" /> {item}</div>)}
        </div>
      </Card>
    </div>
  );
}

function Repository({ contracts, selectedId, setSelectedId, setActiveView }: { contracts: Contract[]; selectedId: string; setSelectedId: (id: string) => void; setActiveView: (view: ViewKey) => void }) {
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | RiskLevel>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ContractStatus>('All');
  const filtered = contracts.filter(contract => {
    const haystack = `${contract.title} ${contract.counterparty} ${contract.type} ${contract.status} ${contract.owner} ${contract.department}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (riskFilter === 'All' || contract.riskLevel === riskFilter) && (statusFilter === 'All' || contract.status === statusFilter);
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Repository</p>
            <h2 className="text-2xl font-black tracking-tight">Searchable contract system of record</h2>
            <p className="mt-2 text-sm text-slate-500">Every record has owner, dates, risk score, playbook results, documents, workflow, obligations, and audit trail.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search contracts..." className="w-56 border-none bg-transparent text-sm outline-none" />
            </div>
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold" value={riskFilter} onChange={event => setRiskFilter(event.target.value as 'All' | RiskLevel)}>
              {['All', 'Low', 'Medium', 'High', 'Critical'].map(item => <option key={item}>{item}</option>)}
            </select>
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold" value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'All' | ContractStatus)}>
              {['All', 'Intake', 'Legal Review', 'Finance Review', 'Approval Pending', 'Ready for Signature', 'Executed', 'Renewal Window'].map(item => <option key={item}>{item}</option>)}
            </select>
            <Button variant="secondary"><Filter size={17} /></Button>
          </div>
        </div>
      </Card>

      <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-soft">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4">Contract</th>
              <th className="px-5 py-4">Counterparty</th>
              <th className="px-5 py-4">Owner</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Risk</th>
              <th className="px-5 py-4">Value</th>
              <th className="px-5 py-4">Renewal Notice</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(contract => (
              <tr key={contract.id} className={selectedId === contract.id ? 'bg-brand-50/50' : 'hover:bg-slate-50/80'}>
                <td className="px-5 py-4">
                  <p className="font-black text-slate-950">{contract.title}</p>
                  <p className="text-xs text-slate-500">{contract.id} · {contract.type}</p>
                </td>
                <td className="px-5 py-4">{contract.counterparty}</td>
                <td className="px-5 py-4">{contract.owner}</td>
                <td className="px-5 py-4"><Badge tone={statusTone[contract.status]}>{contract.status}</Badge></td>
                <td className="px-5 py-4"><RiskBadge risk={contract.riskLevel} /></td>
                <td className="px-5 py-4 font-bold">{money(contract.value, contract.currency)}</td>
                <td className="px-5 py-4">{shortDate(contract.renewalDate)}</td>
                <td className="px-5 py-4"><Button variant="secondary" onClick={() => { setSelectedId(contract.id); setActiveView('workspace'); }}><Eye size={16} /> Open</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractWorkspace({ state, selectedContract, setSelectedContractId, updateContractStatus, createObligation }: { state: AppState; selectedContract: Contract; setSelectedContractId: (id: string) => void; updateContractStatus: (id: string, status: ContractStatus) => void; createObligation: (contractId: string, title: string, owner: string, dueDate: string) => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        {state.contracts.map(contract => (
          <button
            key={contract.id}
            onClick={() => setSelectedContractId(contract.id)}
            className={`w-full rounded-4xl border p-5 text-left shadow-soft transition ${selectedContract.id === contract.id ? 'border-slate-950 bg-white' : 'border-slate-200 bg-white hover:border-brand-200'}`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <Badge tone={statusTone[contract.status]}>{contract.status}</Badge>
              <RiskBadge risk={contract.riskLevel} />
            </div>
            <h3 className="font-black leading-6">{contract.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{contract.counterparty}</p>
            <div className="mt-4"><ProgressBar value={contract.stage} label="Lifecycle stage" /></div>
          </button>
        ))}
      </div>
      <ContractDetail contract={selectedContract} workflowSteps={state.workflowSteps.filter(step => step.contractId === selectedContract.id)} updateContractStatus={updateContractStatus} createObligation={createObligation} />
    </div>
  );
}

function ContractDetail({ contract, workflowSteps, updateContractStatus, createObligation }: { contract: Contract; workflowSteps: AppState['workflowSteps']; updateContractStatus: (id: string, status: ContractStatus) => void; createObligation: (contractId: string, title: string, owner: string, dueDate: string) => void }) {
  const [obligationTitle, setObligationTitle] = useState('');
  const [obligationOwner, setObligationOwner] = useState(contract.owner);
  const [obligationDue, setObligationDue] = useState('2026-07-15');

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone={statusTone[contract.status]}>{contract.status}</Badge>
              <RiskBadge risk={contract.riskLevel} />
              {contract.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <h2 className="text-3xl font-black tracking-tight">{contract.title}</h2>
            <p className="mt-2 text-slate-500">{contract.id} · {contract.counterparty} · {contract.department}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold" value={contract.status} onChange={event => updateContractStatus(contract.id, event.target.value as ContractStatus)}>
              {Object.keys(statusTone).map(status => <option key={status}>{status}</option>)}
            </select>
            <Button><FileCheck2 size={16} /> Open Document</Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MiniMetric label="Owner" value={contract.owner} />
          <MiniMetric label="Value" value={money(contract.value, contract.currency)} />
          <MiniMetric label="End Date" value={shortDate(contract.endDate)} />
          <MiniMetric label="Renewal Notice" value={shortDate(contract.renewalDate)} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle eyebrow="AI Summary" title="Contract intelligence brief" />
          <p className="rounded-4xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{contract.aiSummary}</p>
          <div className="mt-5 rounded-4xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-amber-700" size={20} />
              <div>
                <p className="font-black text-amber-900">Recommended next action</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">{contract.nextAction}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow="Risk Score" title={`${contract.riskScore}/100`} />
          <ProgressBar value={contract.riskScore} label="AI risk score" />
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p>Risk score combines clause deviations, contract value, renewal timing, vendor profile, DPA/security triggers, and approval status.</p>
            <Button className="w-full"><Sparkles size={16} /> Run Deep Review</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Clause Intelligence" title="Playbook deviations and fallback positions" />
          <div className="grid gap-4">
            {contract.clauses.map(clause => (
              <div key={clause.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2"><Badge tone={clause.status === 'Approved' ? 'green' : clause.status === 'Missing' ? 'red' : 'amber'}>{clause.status}</Badge><RiskBadge risk={clause.risk} /></div>
                  <Badge>{clause.category}</Badge>
                </div>
                <h4 className="font-black">{clause.name}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">{clause.note}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black uppercase text-slate-500">Preferred</p><p className="mt-1 text-xs leading-5 text-slate-600">{clause.position}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-black uppercase text-slate-500">Fallback</p><p className="mt-1 text-xs leading-5 text-slate-600">{clause.fallback}</p></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow="Documents / Workflow / Obligations" title="Execution cockpit" />
          <div className="mb-6 space-y-3">
            {contract.documents.length ? contract.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                <div><p className="font-bold">{doc.name}</p><p className="text-xs text-slate-500">{doc.type} · {doc.version} · {doc.status}</p></div>
                <Badge tone="blue">{doc.status}</Badge>
              </div>
            )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No documents attached yet.</p>}
          </div>

          <div className="mb-6 space-y-3">
            {workflowSteps.map(step => (
              <div key={step.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                <div><p className="font-bold">{step.name}</p><p className="text-xs text-slate-500">{step.assignee} · SLA {step.slaHours}h</p></div>
                <Badge tone={workflowTone[step.status]}>{step.status}</Badge>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="mb-3 font-black">Add obligation</p>
            <div className="space-y-3">
              <input className={inputClass} placeholder="Obligation title" value={obligationTitle} onChange={event => setObligationTitle(event.target.value)} />
              <div className="grid gap-3 md:grid-cols-2">
                <input className={inputClass} value={obligationOwner} onChange={event => setObligationOwner(event.target.value)} />
                <input className={inputClass} type="date" value={obligationDue} onChange={event => setObligationDue(event.target.value)} />
              </div>
              <Button onClick={() => { if (obligationTitle.trim()) { createObligation(contract.id, obligationTitle, obligationOwner, obligationDue); setObligationTitle(''); } }}><Plus size={16} /> Add Obligation</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function WorkflowStudio({ state, approveWorkflowStep }: { state: AppState; approveWorkflowStep: (stepId: string) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle eyebrow="Workflow Studio" title="Policy-based approval routing" desc="The product foundation supports workflow branching by contract value, risk, department, vendor type, data/privacy trigger, renewal urgency, and approval authority." />
        <div className="grid gap-4 md:grid-cols-5">
          {['Request', 'Legal', 'Finance', 'Security', 'Executive'].map((step, index) => (
            <div key={step} className="relative rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white font-black shadow-sm">{index + 1}</div>
              <p className="font-black">{step}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Rules branch by value, clause risk, vendor type, data exposure, department, and category.</p>
              {index < 4 && <ChevronRight className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-300 md:block" />}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Live Work Queue" title="Approvals and SLA health" />
        <div className="space-y-3">
          {state.workflowSteps.map(step => (
            <div key={step.id} className="grid gap-4 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_170px_130px_100px_120px] md:items-center">
              <div>
                <p className="font-black">{step.name}</p>
                <p className="text-sm text-slate-500">{step.contractId} · {step.role}</p>
              </div>
              <p className="text-sm font-semibold">{step.assignee}</p>
              <Badge tone={workflowTone[step.status]}>{step.status}</Badge>
              <p className="text-sm text-slate-500">SLA {step.slaHours}h</p>
              <Button variant={step.status === 'Active' ? 'primary' : 'secondary'} disabled={step.status !== 'Active'} onClick={() => approveWorkflowStep(step.id)}>Approve</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Obligations({ state, updateObligationStatus, createObligation }: { state: AppState; updateObligationStatus: (id: string, status: ObligationStatus) => void; createObligation: (contractId: string, title: string, owner: string, dueDate: string) => void }) {
  const [contractId, setContractId] = useState(state.contracts[0]?.id ?? '');
  const [title, setTitle] = useState('Upload compliance evidence');
  const [owner, setOwner] = useState('Compliance Owner');
  const [dueDate, setDueDate] = useState('2026-07-01');

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle eyebrow="Obligation Center" title="Turn contract language into accountable work" desc="Every obligation has a source clause, owner, due date, status, priority, and evidence requirement." />
        <div className="grid gap-4 md:grid-cols-5">
          <MiniMetric label="Open" value={String(state.obligations.filter(o => o.status === 'Open').length)} />
          <MiniMetric label="In Progress" value={String(state.obligations.filter(o => o.status === 'In Progress').length)} />
          <MiniMetric label="Overdue" value={String(state.obligations.filter(o => o.status === 'Overdue').length)} />
          <MiniMetric label="Evidence Required" value={String(state.obligations.filter(o => o.evidenceRequired).length)} />
          <MiniMetric label="Owners" value={String(new Set(state.obligations.map(o => o.owner)).size)} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle eyebrow="Task Register" title="Active obligations" />
          <div className="space-y-3">
            {state.obligations.map(obligation => (
              <div key={obligation.id} className="grid gap-4 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_150px_150px_150px] md:items-center">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2"><RiskBadge risk={obligation.priority} /><Badge>{obligation.sourceClause}</Badge>{obligation.evidenceRequired && <Badge tone="blue">Evidence</Badge>}</div>
                  <h3 className="font-black">{obligation.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{obligation.contractId} · Owner: {obligation.owner}</p>
                </div>
                <div className="text-sm font-bold">Due {shortDate(obligation.dueDate)}</div>
                <Badge tone={obligation.status === 'Completed' ? 'green' : obligation.status === 'Overdue' ? 'red' : obligation.status === 'Blocked' ? 'amber' : 'blue'}>{obligation.status}</Badge>
                <select className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold" value={obligation.status} onChange={event => updateObligationStatus(obligation.id, event.target.value as ObligationStatus)}>
                  {['Open', 'In Progress', 'Completed', 'Overdue', 'Blocked'].map(status => <option key={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow="Manual Task" title="Add obligation" />
          <div className="space-y-3">
            <Field label="Contract"><select className={inputClass} value={contractId} onChange={event => setContractId(event.target.value)}>{state.contracts.map(contract => <option key={contract.id} value={contract.id}>{contract.id} · {contract.title}</option>)}</select></Field>
            <Field label="Title"><input className={inputClass} value={title} onChange={event => setTitle(event.target.value)} /></Field>
            <Field label="Owner"><input className={inputClass} value={owner} onChange={event => setOwner(event.target.value)} /></Field>
            <Field label="Due date"><input type="date" className={inputClass} value={dueDate} onChange={event => setDueDate(event.target.value)} /></Field>
            <Button onClick={() => createObligation(contractId, title, owner, dueDate)} className="w-full"><Plus size={16} /> Add Obligation</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Renewals({ contracts }: { contracts: Contract[] }) {
  const renewalList = [...contracts].sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle eyebrow="Renewal Command" title="No missed renewals, no surprise auto-renewals" desc="Renewal control is one of the fastest ways CLM pays for itself. This view prioritizes notice windows, spend exposure, owner accountability, and renegotiation timing." />
        <div className="grid gap-4 lg:grid-cols-4">
          {renewalList.map(contract => {
            const days = daysUntil(contract.renewalDate);
            return (
              <div key={contract.id} className="rounded-4xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <CalendarClock size={20} />
                  <RiskBadge risk={contract.riskLevel} />
                </div>
                <p className="text-3xl font-black tracking-tight">{days > 0 ? days : 0}</p>
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">Days to notice</p>
                <h4 className="mt-4 font-black leading-6">{contract.title}</h4>
                <p className="mt-2 text-sm text-slate-500">Notice date: {shortDate(contract.renewalDate)}</p>
                <p className="mt-2 text-sm font-bold text-slate-700">{money(contract.value, contract.currency)}</p>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Negotiation Planner" title="Renewal action plan" />
        <div className="grid gap-4 md:grid-cols-3">
          {['Confirm owner decision', 'Benchmark price and usage', 'Issue notice or renewal instruction'].map((step, index) => (
            <div key={step} className="rounded-3xl border border-slate-200 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 font-black text-brand-700">{index + 1}</div>
              <p className="font-black">{step}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Configured as a repeatable renewal playbook task in the obligation engine.</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Vendors({ state }: { state: AppState }) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle eyebrow="Vendor / Counterparty Intelligence" title="Risk-aware relationship management" desc="Vantelyx treats counterparties as living profiles, not just names inside PDFs. This helps with compliance evidence, insurance, risk reviews, performance, renewals, and vendor portal workflows." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {state.vendors.map(vendor => (
            <div key={vendor.id} className="rounded-4xl border border-slate-200 p-5">
              <div className="mb-4 flex items-center justify-between"><UserCheck size={22} /><RiskBadge risk={vendor.risk} /></div>
              <h3 className="font-black leading-6">{vendor.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{vendor.category}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <MiniMetric label="Contracts" value={String(vendor.activeContracts)} />
                <MiniMetric label="Renewals" value={String(vendor.expiringSoon)} />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p><strong>Insurance:</strong> {vendor.insuranceStatus}</p>
                <p><strong>Data Processing:</strong> {vendor.dataProcessing ? 'Yes' : 'No'}</p>
                <ProgressBar value={vendor.performanceScore} label="Performance" />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Vendor Portal Concept" title="Self-service evidence and compliance collection" />
        <div className="grid gap-4 md:grid-cols-4">
          {['Upload insurance certificates', 'Complete security questionnaires', 'Update company profile', 'Respond to obligation evidence requests'].map(item => <div key={item} className="rounded-3xl border border-slate-200 p-5 font-bold">{item}</div>)}
        </div>
      </Card>
    </div>
  );
}

function RiskCompliance({ state }: { state: AppState }) {
  const controls = [
    { title: 'Clause playbook enforcement', desc: 'Preferred language, fallback positions, and escalation rules for risky or missing clauses.', Icon: ShieldCheck, status: 'good' as const },
    { title: 'Audit evidence chain', desc: 'Every route, approval, status change, task, and AI flag is tracked in an auditable log.', Icon: ClipboardCheck, status: 'good' as const },
    { title: 'Data/privacy guardrails', desc: 'DPA and security review triggers appear when data-processing language is detected.', Icon: LockKeyhole, status: 'warning' as const },
    { title: 'Vendor compliance files', desc: 'Insurance, certificates, SOC reports, and questionnaires can be attached to vendor profile.', Icon: FileCheck2, status: 'warning' as const },
    { title: 'Renewal and notice risk', desc: 'Auto-renewal and notice periods are surfaced as operational risks.', Icon: CalendarClock, status: 'danger' as const },
    { title: 'Segregation of duties', desc: 'RBAC-ready model separates requester, legal, finance, security, admin, vendor, and auditor roles.', Icon: Gavel, status: 'good' as const }
  ];
  const deviations = state.contracts.flatMap(contract => contract.clauses.filter(clause => clause.status !== 'Approved').map(clause => ({ contract, clause })));

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <SectionTitle eyebrow="Compliance Guardrails" title="Risks, controls, policy deviations, and audit evidence" />
        <div className="grid gap-4 md:grid-cols-2">
          {controls.map(({ title, desc, Icon, status }) => (
            <div key={title} className="rounded-4xl border border-slate-200 p-5">
              <div className="mb-4 flex items-center justify-between"><Icon size={24} /><StatusIcon status={status} /></div>
              <h3 className="font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </Card>
      <AuditFeed events={state.auditEvents} />
      <Card className="xl:col-span-3">
        <SectionTitle eyebrow="Policy Exceptions" title="Open clause deviations" />
        <div className="grid gap-3">
          {deviations.map(({ contract, clause }) => (
            <div key={`${contract.id}-${clause.id}`} className="grid gap-4 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_150px_120px] md:items-center">
              <div><p className="font-black">{clause.name}</p><p className="text-sm text-slate-500">{contract.id} · {contract.title} · {clause.note}</p></div>
              <Badge tone={clause.status === 'Missing' ? 'red' : 'amber'}>{clause.status}</Badge>
              <RiskBadge risk={clause.risk} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Analytics({ state, exportPortfolioCsv }: { state: AppState; exportPortfolioCsv: () => void }) {
  const riskData = ['Low', 'Medium', 'High', 'Critical'].map(risk => ({ risk, count: state.contracts.filter(contract => contract.riskLevel === risk).length }));
  const deptData = Array.from(new Set(state.contracts.map(contract => contract.department))).map(department => ({ department, value: state.contracts.filter(contract => contract.department === department).reduce((sum, contract) => sum + contract.value, 0) }));
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Analytics" title="Cycle-time improvement" action={<Button variant="secondary" onClick={exportPortfolioCsv}><Download size={16} /> Export CSV</Button>} />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cycle" stroke="currentColor" strokeWidth={4} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow="Risk Mix" title="Portfolio risk distribution" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="risk" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Exposure" title="Value by department" />
          <div className="space-y-3">
            {deptData.map(item => <div key={item.department} className="rounded-3xl border border-slate-200 p-4"><div className="flex justify-between text-sm font-black"><span>{item.department}</span><span>{money(item.value)}</span></div><ProgressBar value={Math.min(100, (item.value / Math.max(...deptData.map(d => d.value))) * 100)} label="" /></div>)}
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow="Executive Reports" title="Reports leadership gets" />
          <div className="space-y-3">
            {['Portfolio exposure by department', 'High-risk clauses by contract type', 'Bottlenecks by workflow queue', 'Upcoming renewals and termination notice dates', 'Vendor concentration and performance risk', 'Legal review SLA and aging reports', 'Evidence gaps by vendor and obligation owner'].map(report => (
              <div key={report} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3"><LineChartIcon size={18} /><span className="font-bold">{report}</span></div>
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Templates({ state }: { state: AppState }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <SectionTitle eyebrow="Templates" title="Approved contract templates" desc="Templates reduce drafting time and create clean starting points aligned with company playbooks." />
        <div className="space-y-3">
          {state.templates.map(template => (
            <div key={template.id} className="rounded-3xl border border-slate-200 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">{template.name}</h3><Badge tone={template.status === 'Active' ? 'green' : template.status === 'Draft' ? 'amber' : 'slate'}>{template.status}</Badge></div>
              <p className="text-sm text-slate-500">{template.type} · {template.department} · v{template.version} · Updated {shortDate(template.lastUpdated)}</p>
              <div className="mt-3"><RiskBadge risk={template.risk} /></div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Clause Library" title="Negotiation playbook" desc="This is the logic layer that lets the AI identify non-standard language and suggest fallback positions." />
        <div className="space-y-3">
          {state.clausePlaybook.map(item => (
            <div key={item.id} className="rounded-3xl border border-slate-200 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">{item.name}</h3><RiskBadge risk={item.risk} /></div>
              <p className="text-sm leading-6 text-slate-600"><strong>Preferred:</strong> {item.preferredLanguage}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500"><strong>Escalate:</strong> {item.escalationRule}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ESignature({ state, updateContractStatus }: { state: AppState; updateContractStatus: (id: string, status: ContractStatus) => void }) {
  const ready = state.contracts.filter(contract => ['Approval Pending', 'Ready for Signature', 'Executed'].includes(contract.status));
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle eyebrow="Execution Control" title="E-signature packet readiness" desc="Designed to integrate with DocuSign, Adobe Sign, or an internal signature workflow. The product tracks packet status, signers, executed PDFs, and certificates." />
        <div className="grid gap-4 md:grid-cols-4">
          {['Prepare packet', 'Route signers', 'Capture certificate', 'Store executed version'].map((step, index) => <div key={step} className="rounded-3xl border border-slate-200 p-5"><PenTool size={20} className="mb-3" /><p className="font-black">{index + 1}. {step}</p><p className="mt-2 text-sm text-slate-500">Execution audit and final document storage step.</p></div>)}
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Signature Queue" title="Ready / pending execution" />
        <div className="space-y-3">
          {ready.map(contract => <div key={contract.id} className="grid gap-4 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_160px_170px] md:items-center"><div><p className="font-black">{contract.title}</p><p className="text-sm text-slate-500">{contract.counterparty} · {contract.id}</p></div><Badge tone={statusTone[contract.status]}>{contract.status}</Badge><Button disabled={contract.status === 'Executed'} onClick={() => updateContractStatus(contract.id, contract.status === 'Ready for Signature' ? 'Executed' : 'Ready for Signature')}>{contract.status === 'Ready for Signature' ? 'Mark Executed' : 'Prepare Packet'}</Button></div>)}
        </div>
      </Card>
    </div>
  );
}

function Integrations({ state }: { state: AppState }) {
  return (
    <Card>
      <SectionTitle eyebrow="Integrations Hub" title="Enterprise connector roadmap" desc="The current build includes the UI and API abstraction plan. Production integrations can be connected one by one without changing the core CLM workflow model." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {state.integrations.map(integration => (
          <div key={integration.id} className="rounded-4xl border border-slate-200 p-5">
            <div className="mb-4 flex items-center justify-between"><Link2 size={21} /><Badge tone={integration.status === 'Connected' ? 'green' : integration.status === 'Needs Admin' ? 'amber' : 'slate'}>{integration.status}</Badge></div>
            <h3 className="font-black">{integration.name}</h3>
            <p className="mt-1 text-xs font-black uppercase tracking-wider text-brand-600">{integration.category}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{integration.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AdminSecurity({ state, resetDemoData }: { state: AppState; resetDemoData: () => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <SectionTitle eyebrow="RBAC" title="Role model" />
        <div className="space-y-3">
          {state.roles.map(role => <div key={role.role} className="rounded-3xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><p className="font-black">{role.role}</p><Badge>{role.users} users</Badge></div><p className="mt-2 text-xs leading-5 text-slate-500">{role.permissions.join(' · ')}</p></div>)}
        </div>
      </Card>
      <Card className="xl:col-span-2">
        <SectionTitle eyebrow="Enterprise Controls" title="Security and governance checklist" action={<Button variant="secondary" onClick={resetDemoData}><RefreshCcw size={16} /> Reset Demo Data</Button>} />
        <div className="grid gap-4 md:grid-cols-2">
          {['SSO/SAML/OIDC ready', 'Multi-tenant data boundaries', 'Least-privilege permissions', 'Document access controls', 'Immutable audit trail design', 'Admin approval for integrations', 'Vendor portal role separation', 'Retention and legal hold ready', 'API key / webhook governance', 'Export and reporting permissions'].map(item => (
            <div key={item} className="flex items-center gap-3 rounded-3xl border border-slate-200 p-4 text-sm font-bold"><CheckCircle2 className="text-emerald-600" size={18} /> {item}</div>
          ))}
        </div>
        <div className="mt-6 rounded-4xl bg-slate-950 p-5 text-white">
          <p className="font-black">Production security note</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">The build is structured for SSO, RBAC, API authorization, tenant isolation, audit logging, and document controls. Production should add JWT validation, database-backed policy checks, encryption configuration, secrets management, and vulnerability scanning.</p>
        </div>
      </Card>
    </div>
  );
}

function RfpCoverage() {
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle eyebrow="RFP Alignment" title="Feature coverage and scoring story" desc="This table is designed to help position Vantelyx CLM as more than a basic repository: it covers the expected requirements and adds high-value differentiators." />
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Requirement</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">How Vantelyx Addresses It</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{rfpCoverage.map(row => <tr key={row[0]}><td className="px-5 py-4 font-black">{row[0]}</td><td className="px-5 py-4"><Badge tone={row[1] === 'Covered' ? 'green' : row[1] === 'Enhanced' ? 'blue' : 'violet'}>{row[1]}</Badge></td><td className="px-5 py-4 text-slate-600">{row[2]}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Competitive Edge" title="How to outscore conventional CLM tools" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Low-training UX', 'Business users start from guided requests, not legal jargon.'],
            ['AI as assistant, not gimmick', 'AI classifies, extracts, flags risk, suggests route, and supports playbook comparison.'],
            ['Obligation-first operations', 'The system tracks what must happen after signature, not only before signature.'],
            ['Vendor evidence self-service', 'Counterparties can update insurance, certificates, and questionnaires.'],
            ['Renewal revenue control', 'Notice windows and auto-renewal language are visible before they cost money.'],
            ['RFP-ready audit posture', 'Approvals, evidence, and changes are demonstrable in one place.']
          ].map(item => <div key={item[0]} className="rounded-4xl border border-slate-200 p-5"><p className="font-black">{item[0]}</p><p className="mt-2 text-sm leading-6 text-slate-500">{item[1]}</p></div>)}
        </div>
      </Card>
    </div>
  );
}

function AuditFeed({ events }: { events: AppState['auditEvents'] }) {
  return (
    <Card>
      <SectionTitle eyebrow="Audit Trail" title="Recent activity" />
      <div className="space-y-4">
        {events.slice(0, 7).map(event => (
          <div key={event.id} className="rounded-3xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-black">{event.action}</p>
              <p className="text-[11px] font-bold text-slate-400">{shortDate(event.timestamp)}</p>
            </div>
            <p className="text-xs leading-5 text-slate-500">{event.actor} · {event.object}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{event.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-3 text-sm">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-950">{value}</span>
    </div>
  );
}

function NewContractModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: { title: string; counterparty: string; type: ContractType; value: number; owner: string; department: string }) => void }) {
  const [title, setTitle] = useState('New Contract Request');
  const [counterparty, setCounterparty] = useState('Counterparty LLC');
  const [type, setType] = useState<ContractType>('Master Services Agreement');
  const [value, setValue] = useState('50000');
  const [owner, setOwner] = useState('Business Owner');
  const [department, setDepartment] = useState('Procurement');

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate({ title, counterparty, type, value: Number(value) || 0, owner, department });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-4xl bg-white p-6 shadow-soft">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">New Record</p><h2 className="text-2xl font-black">Create contract</h2></div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 p-2"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><input className={inputClass} value={title} onChange={event => setTitle(event.target.value)} /></Field>
          <Field label="Counterparty"><input className={inputClass} value={counterparty} onChange={event => setCounterparty(event.target.value)} /></Field>
          <Field label="Type"><select className={inputClass} value={type} onChange={event => setType(event.target.value as ContractType)}>{['Master Services Agreement', 'NDA', 'Statement of Work', 'Lease', 'Software License', 'Purchase Agreement', 'Data Processing Agreement', 'Partner Agreement', 'Vendor Agreement'].map(option => <option key={option}>{option}</option>)}</select></Field>
          <Field label="Value"><input className={inputClass} value={value} onChange={event => setValue(event.target.value)} /></Field>
          <Field label="Owner"><input className={inputClass} value={owner} onChange={event => setOwner(event.target.value)} /></Field>
          <Field label="Department"><input className={inputClass} value={department} onChange={event => setDepartment(event.target.value)} /></Field>
          <div className="flex justify-end gap-3 md:col-span-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit"><Plus size={16} /> Create Contract</Button></div>
        </form>
      </div>
    </div>
  );
}

export default App;
