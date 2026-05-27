import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, FileUp, Plus, Search, SlidersHorizontal, Sparkles, UserCheck, Wrench, X } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useDriverDetail, useDriverSummary, useDrivers } from '../hooks/useDrivers';
import { useVehicleDetail, useVehicleSummary, useVehicles } from '../hooks/useVehicles';
import { assignDriver, changeVehicleStatus, createVehicle, previewVehicleImport, updateVehicle, type VehicleRecord } from '../services/vehiclesApi';
import { assignVehicle, changeDriverStatus, createDriver, previewDriverImport, updateDriver, type DriverRecord } from '../services/driversApi';

type Mode = 'vehicles' | 'drivers';
type AnyRecord = VehicleRecord | DriverRecord;

const vehicleFilters = {
  status: ['All', 'Active', 'Idle', 'Offline', 'Maintenance', 'Critical', 'Unassigned'],
  type: ['All', 'Sleeper Tractor', 'Box Truck', 'Cargo Van', 'Reefer', 'Day Cab'],
  maintenanceStatus: ['All', 'Current', 'Due Soon', 'Critical'],
  complianceStatus: ['All', 'Current', 'Expiring'],
  riskLevel: ['All', 'Low', 'Watch', 'High', 'Critical'],
  region: ['All', 'Manassas', 'Woodbridge', 'Alexandria', 'Dulles', 'Fairfax', 'Arlington', 'Washington DC']
};

const driverFilters = {
  status: ['All', 'Active', 'Assigned', 'Off Duty', 'Suspended', 'Review'],
  availability: ['All', 'Available', 'Assigned', 'Off Duty', 'Unavailable', 'Needs Review'],
  riskLevel: ['All', 'Low', 'Watch', 'High', 'Critical'],
  region: vehicleFilters.region
};

export default function MasterDataPage({ mode }: { mode: Mode }) {
  const queryClient = useQueryClient();
  const params = useParams();
  const isVehicles = mode === 'vehicles';
  const [filters, setFilters] = useState<Record<string, string>>({ search: '' });
  const [selectedId, setSelectedId] = useState<number | undefined>(params.id ? Number(params.id) : undefined);
  const [modal, setModal] = useState<'create' | 'edit' | 'import' | null>(null);
  const vehicleList = useVehicles(isVehicles ? filters : {});
  const driverList = useDrivers(!isVehicles ? filters : {});
  const vehicleSummary = useVehicleSummary();
  const driverSummary = useDriverSummary();
  const vehicleDetail = useVehicleDetail(isVehicles ? selectedId : undefined);
  const driverDetail = useDriverDetail(!isVehicles ? selectedId : undefined);
  const rows = (isVehicles ? vehicleList.data : driverList.data) ?? [];
  const summary = isVehicles ? vehicleSummary.data : driverSummary.data;
  const detail = (isVehicles ? vehicleDetail.data : driverDetail.data) as AnyRecord | undefined;
  const isLoading = isVehicles ? vehicleList.isLoading : driverList.isLoading;
  const isError = isVehicles ? vehicleList.isError : driverList.isError;

  const createMutation = useMutation({
    mutationFn: async () => isVehicles
      ? createVehicle({ vehicleCode: `TRK-${Math.floor(Math.random() * 800 + 300)}`, name: 'New Fleet Vehicle', status: 'Active', region: 'Manassas', vin: `VIN${Date.now()}`, plateNumber: `OPX-${Date.now() % 10000}`, modelYear: 2024, odometer: 0 })
      : createDriver({ driverCode: `DRV-${Math.floor(Math.random() * 800 + 300)}`, firstName: 'New', lastName: 'Driver', name: 'New Driver', status: 'Active', availability: 'Available', region: 'Manassas', email: `driver${Date.now()}@opstrax.demo`, licenseNumber: `L${Date.now()}`, licenseExpiry: '2027-12-31' }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setModal(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!detail) return null;
      return isVehicles
        ? updateVehicle(detail.id, { ...detail, notes: 'Updated from OpsTrax master data module.' } as VehicleRecord)
        : updateDriver(detail.id, { ...detail, notes: 'Updated from OpsTrax master data module.' } as DriverRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setModal(null);
    }
  });

  const actionMutation = useMutation({
    mutationFn: async (action: string) => {
      if (!detail) return null;
      if (isVehicles) {
        if (action === 'assign') return assignDriver(detail.id, 1);
        return changeVehicleStatus(detail.id, action);
      }
      if (action === 'assign') return assignVehicle(detail.id, 1);
      return changeDriverStatus(detail.id, action);
    },
    onSuccess: () => queryClient.invalidateQueries()
  });

  const importMutation = useMutation({ mutationFn: () => isVehicles ? previewVehicleImport() : previewDriverImport() });

  const filteredReports = summary?.reports ?? [];
  const filtersConfig = isVehicles ? vehicleFilters : driverFilters;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fleet Master Data"
        title={isVehicles ? 'Vehicles' : 'Drivers'}
        description={isVehicles ? 'Manage fleet assets, assignments, lifecycle status, maintenance, devices, documents, and operational risk.' : 'Manage driver profiles, assignments, compliance, safety, HOS, coaching, and availability.'}
        actions={
          <>
            <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy"><Plus size={16} /> Add {isVehicles ? 'Vehicle' : 'Driver'}</button>
            <button onClick={() => setModal('import')} className="inline-flex items-center gap-2 rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-200 hover:border-teal/40"><FileUp size={16} /> Import</button>
            <button className="inline-flex items-center gap-2 rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-200 hover:border-skyx/40"><Download size={16} /> Export</button>
          </>
        }
      />

      <section className="glass-panel rounded-lg p-4">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr_280px] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{isVehicles ? 'Fleet Readiness' : 'Driver Readiness'}</p>
            <p className="mt-1 text-4xl font-semibold text-white">{isVehicles ? summary?.fleetReadinessScore : summary?.driverReadinessScore}%</p>
          </div>
          <p className="text-sm leading-6 text-slate-300">{isVehicles ? 'OpsTrax evaluates active status, maintenance posture, compliance state, telematics health, assignment coverage, utilization, idle cost, and lifecycle completeness.' : 'OpsTrax evaluates availability, assignment coverage, license/medical expirations, HOS state, safety score, coaching queue, and profile completeness.'}</p>
          <div className="rounded-lg border border-purple-300/20 bg-purple-500/10 p-4">
            <p className="text-xs uppercase tracking-wide text-purple-100">Master Data Completeness</p>
            <p className="mt-1 text-3xl font-semibold text-white">{summary?.masterDataCompletenessScore ?? 0}%</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(summary?.kpis ?? []).map((kpi) => <KpiCard key={kpi.key} label={kpi.label} value={kpi.value} trend={kpi.trend} status={kpi.status} tone={kpi.status.match(/Critical|High/) ? 'bad' : kpi.status.match(/Watch|Review/) ? 'warn' : 'info'} />)}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
        <section className="glass-panel overflow-hidden rounded-lg">
          <div className="border-b border-line p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                <input value={filters.search ?? ''} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className="w-full rounded-md border border-line bg-navy/70 py-2 pl-10 pr-3 text-sm outline-none focus:border-teal" placeholder={`Search ${isVehicles ? 'vehicles' : 'drivers'}...`} />
              </div>
              <button className="inline-flex items-center gap-2 rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-200"><SlidersHorizontal size={16} /> Filters</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(filtersConfig).flatMap(([key, options]) => options.map((option) => (
                <button key={`${key}-${option}`} onClick={() => setFilters({ ...filters, [key]: option })} className={`rounded-full border px-3 py-1.5 text-xs ${filters[key] === option || (!filters[key] && option === 'All') ? 'border-teal/60 bg-teal/15 text-teal-100' : 'border-line bg-navy/60 text-slate-300 hover:border-teal/35'}`}>{key}: {option}</button>
              )))}
            </div>
          </div>

          {isLoading && <div className="p-10 text-center text-slate-400">Loading master data...</div>}
          {isError && <div className="p-10 text-center text-red-200">Unable to load master data.</div>}
          {!isLoading && rows.length === 0 && <div className="p-10 text-center text-slate-400">No matching records.</div>}
          {!isLoading && rows.length > 0 && (
            <div className="overflow-x-auto opstrax-scroll">
              {isVehicles ? <VehicleTable rows={rows as VehicleRecord[]} onSelect={setSelectedId} /> : <DriverTable rows={rows as DriverRecord[]} onSelect={setSelectedId} />}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="glass-panel rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="text-purple-200" size={17} /> AI master-data intelligence</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{isVehicles ? 'Vehicle risk scoring combines maintenance, compliance, device health, idle cost, utilization, age, mileage, and safety events.' : 'Driver risk scoring combines safety score, coaching queue, license expiry, HOS, compliance, and recent incident signals.'}</p>
          </section>
          <section className="glass-panel rounded-lg p-4">
            <h2 className="font-semibold text-white">Report placeholders</h2>
            <div className="mt-3 grid gap-2">
              {filteredReports.map((report) => <button key={report} className="rounded-md border border-line bg-navy/70 p-3 text-left text-sm text-slate-300 hover:border-teal/40">{report}</button>)}
            </div>
          </section>
        </aside>
      </div>

      {selectedId && detail && <DetailDrawer mode={mode} detail={detail} onClose={() => setSelectedId(undefined)} onEdit={() => setModal('edit')} onAction={(action) => actionMutation.mutate(action)} loading={actionMutation.isPending} />}
      {modal && <MasterModal mode={mode} type={modal} detail={detail} onClose={() => setModal(null)} onCreate={() => createMutation.mutate()} onUpdate={() => updateMutation.mutate()} onImport={() => importMutation.mutate()} loading={createMutation.isPending || updateMutation.isPending || importMutation.isPending} importResult={importMutation.data} />}
    </div>
  );
}

function VehicleTable({ rows, onSelect }: { rows: VehicleRecord[]; onSelect: (id: number) => void }) {
  return (
    <table className="min-w-[1500px] text-left text-sm">
      <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400"><tr>{['Vehicle ID','Plate','VIN','Type','Make/Model/Year','Assigned Driver','Status','Device','Camera','Odometer','Fuel','Maintenance','Compliance','Utilization','Risk','Recommended Action','Actions'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">
        {rows.map((v) => <tr key={v.id} className="hover:bg-white/[0.04]">
          <td className="px-4 py-3 font-semibold text-white">{v.vehicleCode}</td><td className="px-4 py-3 text-slate-300">{v.plateNumber}</td><td className="px-4 py-3 text-slate-300">{v.vin}</td><td className="px-4 py-3 text-slate-300">{v.vehicleType}</td><td className="px-4 py-3 text-slate-300">{v.make} {v.model} {v.modelYear}</td><td className="px-4 py-3 text-slate-300">{v.assignedDriver || 'Unassigned'}</td><td className="px-4 py-3"><StatusBadge status={v.status} /></td><td className="px-4 py-3"><StatusBadge status={v.deviceStatus} /></td><td className="px-4 py-3"><StatusBadge status={v.cameraStatus} /></td><td className="px-4 py-3 text-slate-300">{Number(v.odometer).toLocaleString()}</td><td className="px-4 py-3 text-slate-300">{v.fuelType}</td><td className="px-4 py-3"><StatusBadge status={v.maintenanceStatus} /></td><td className="px-4 py-3"><StatusBadge status={v.complianceStatus} /></td><td className="px-4 py-3 text-slate-300">{v.utilizationPercent}%</td><td className="px-4 py-3"><Risk score={v.riskScore} label={v.riskLevel} /></td><td className="px-4 py-3 text-slate-300">{v.recommendedAction}</td><td className="px-4 py-3"><button onClick={() => onSelect(v.id)} className="rounded-md border border-line px-3 py-2 text-xs text-slate-200 hover:border-teal/40">Open</button></td>
        </tr>)}
      </tbody>
    </table>
  );
}

function DriverTable({ rows, onSelect }: { rows: DriverRecord[]; onSelect: (id: number) => void }) {
  return (
    <table className="min-w-[1450px] text-left text-sm">
      <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400"><tr>{['Driver ID','Name','Phone','Email','License','License Expiry','Assigned Vehicle','Availability','Current Job','HOS','Safety','Coaching','Compliance','Risk','Recommended Action','Actions'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">
        {rows.map((d) => <tr key={d.id} className="hover:bg-white/[0.04]">
          <td className="px-4 py-3 font-semibold text-white">{d.driverCode}</td><td className="px-4 py-3 text-slate-300">{d.name}</td><td className="px-4 py-3 text-slate-300">{d.phone}</td><td className="px-4 py-3 text-slate-300">{d.email}</td><td className="px-4 py-3 text-slate-300">{d.licenseClass} / {d.licenseNumber}</td><td className="px-4 py-3 text-slate-300">{new Date(d.licenseExpiry).toLocaleDateString()}</td><td className="px-4 py-3 text-slate-300">{d.assignedVehicle || 'Unassigned'}</td><td className="px-4 py-3"><StatusBadge status={d.availability} /></td><td className="px-4 py-3 text-slate-300">Dispatch queue</td><td className="px-4 py-3"><StatusBadge status={d.hosStatus} /></td><td className="px-4 py-3 text-slate-300">{d.safetyScore}</td><td className="px-4 py-3"><StatusBadge status={d.coachingStatus} /></td><td className="px-4 py-3"><StatusBadge status={d.complianceStatus} /></td><td className="px-4 py-3"><Risk score={d.riskScore} label={d.riskLevel} /></td><td className="px-4 py-3 text-slate-300">{d.recommendedAction}</td><td className="px-4 py-3"><button onClick={() => onSelect(d.id)} className="rounded-md border border-line px-3 py-2 text-xs text-slate-200 hover:border-teal/40">Open</button></td>
        </tr>)}
      </tbody>
    </table>
  );
}

function Risk({ score, label }: { score: number; label: string }) {
  return <div className="min-w-28"><div className="flex items-center justify-between text-xs"><span className="text-slate-300">{label}</span><span className="text-white">{score}</span></div><div className="mt-1 h-1.5 rounded bg-slate-800"><div className="h-1.5 rounded bg-gradient-to-r from-teal via-amberx to-red-500" style={{ width: `${score}%` }} /></div></div>;
}

function DetailDrawer({ mode, detail, onClose, onEdit, onAction, loading }: { mode: Mode; detail: AnyRecord; onClose: () => void; onEdit: () => void; onAction: (action: string) => void; loading: boolean }) {
  const isVehicles = mode === 'vehicles';
  const cards = isVehicles
    ? [['Assigned driver', (detail as VehicleRecord).assignedDriver || 'Unassigned'], ['Active job', 'Dispatch queue'], ['Location/zone', (detail as VehicleRecord).region], ['Odometer', Number((detail as VehicleRecord).odometer).toLocaleString()], ['Engine hours', (detail as VehicleRecord).engineHours], ['Device status', (detail as VehicleRecord).deviceStatus], ['Camera status', (detail as VehicleRecord).cameraStatus], ['Maintenance due', (detail as VehicleRecord).maintenanceStatus], ['Compliance', (detail as VehicleRecord).complianceStatus]]
    : [['Assigned vehicle', (detail as DriverRecord).assignedVehicle || 'Unassigned'], ['Current job', 'Dispatch queue'], ['License expiry', new Date((detail as DriverRecord).licenseExpiry).toLocaleDateString()], ['Medical card', new Date((detail as DriverRecord).medicalCardExpiry).toLocaleDateString()], ['HOS status', (detail as DriverRecord).hosStatus], ['DVIR completion', '94%'], ['Safety score', (detail as DriverRecord).safetyScore], ['Coaching', (detail as DriverRecord).coachingStatus], ['Compliance', (detail as DriverRecord).complianceStatus]];
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl overflow-y-auto border-l border-line bg-[#07101d] p-6 shadow-2xl opstrax-scroll">
      <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X size={20} /></button>
      <p className="text-sm text-teal-200">{isVehicles ? 'Vehicle detail' : 'Driver detail'}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{detail.name}</h2>
      <div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={detail.status} /><StatusBadge status={detail.riskLevel} /><StatusBadge status="AI Monitored" /></div>
      <div className="mt-5 rounded-lg border border-purple-300/20 bg-purple-500/10 p-4"><p className="text-xs uppercase tracking-wide text-purple-100">AI risk summary</p><p className="mt-2 text-sm leading-6 text-slate-300">{detail.recommendedAction}. Evidence includes profile completeness, compliance posture, assignment state, safety/HOS/device signals, and recent timeline events.</p></div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">{cards.map(([k, v]) => <div key={k} className="rounded-md border border-line bg-panel/70 p-3"><p className="text-xs uppercase text-slate-500">{k}</p><p className="mt-1 text-slate-200">{String(v)}</p></div>)}</div>
      <section className="mt-5 rounded-lg border border-line bg-panel/70 p-4"><h3 className="font-semibold text-white">AI recommendations</h3><div className="mt-3 space-y-2">{(detail.recommendations ?? []).map((r: any) => <div key={r.title} className="rounded-md bg-navy/70 p-3 text-sm text-slate-300"><div className="flex justify-between gap-2"><span className="text-white">{r.title}</span><StatusBadge status={r.severity} /></div><p className="mt-1 text-xs text-slate-400">{r.recommendedAction}</p></div>)}</div></section>
      <section className="mt-5 rounded-lg border border-line bg-panel/70 p-4"><h3 className="font-semibold text-white">Timeline / audit trail</h3><div className="mt-3 space-y-2">{(detail.timeline ?? []).map((t: any) => <div key={t.id} className="rounded-md bg-navy/70 p-3 text-sm text-slate-300">{t.title}<p className="mt-1 text-xs text-slate-500">{new Date(t.occurredAt).toLocaleString()}</p></div>)}</div></section>
      <section className="mt-5 rounded-lg border border-line bg-panel/70 p-4"><h3 className="font-semibold text-white">Smart assignment suggestion</h3><p className="mt-2 text-sm text-slate-300">{detail.smartAssignment ? JSON.stringify(detail.smartAssignment) : 'No suggestion available.'}</p></section>
      <div className="mt-5 grid gap-2 sm:grid-cols-3"><button onClick={onEdit} className="rounded-md bg-teal px-3 py-2 text-sm font-semibold text-navy">Edit</button><button disabled={loading} onClick={() => onAction('assign')} className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-200"><UserCheck size={15} /> Assign</button><button disabled={loading} onClick={() => onAction(isVehicles ? 'Maintenance' : 'Suspended')} className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-200"><Wrench size={15} /> Change Status</button></div>
    </aside>
  );
}

function MasterModal({ mode, type, detail, onClose, onCreate, onUpdate, onImport, loading, importResult }: { mode: Mode; type: 'create' | 'edit' | 'import'; detail?: AnyRecord; onClose: () => void; onCreate: () => void; onUpdate: () => void; onImport: () => void; loading: boolean; importResult: unknown }) {
  const isVehicles = mode === 'vehicles';
  const fields = isVehicles ? ['Vehicle ID', 'Plate', 'VIN', 'Type', 'Make', 'Model', 'Year', 'Fuel type', 'Ownership type', 'Region/zone', 'Status', 'Assigned driver', 'Odometer', 'Engine hours', 'Device ID', 'Camera ID', 'Notes'] : ['Driver ID', 'First name', 'Last name', 'Phone', 'Email', 'License number', 'License class', 'License expiry', 'Medical card expiry', 'Region/zone', 'Status', 'Availability', 'Assigned vehicle', 'Driver type', 'Notes'];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6 shadow-2xl opstrax-scroll">
        <button onClick={onClose} className="absolute right-5 top-5 text-slate-400 hover:text-white"><X size={20} /></button>
        <h2 className="text-xl font-semibold text-white">{type === 'import' ? `Import ${isVehicles ? 'Vehicles' : 'Drivers'}` : `${type === 'create' ? 'Add' : 'Edit'} ${isVehicles ? 'Vehicle' : 'Driver'}`}</h2>
        {type === 'import' ? (
          <div className="mt-5 space-y-4">
            <button onClick={onImport} className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy">{loading ? 'Previewing...' : 'Upload CSV / Preview Import'}</button>
            <div className="rounded-md border border-line bg-navy/70 p-4 text-sm text-slate-300">Required columns: {fields.slice(0, 10).join(', ')}</div>
            <div className="rounded-md border border-line bg-navy/70 p-4 text-sm text-slate-300">Import history placeholder: last successful import staged by OpsTrax demo user.</div>
            {Boolean(importResult) && <pre className="overflow-auto rounded-md bg-black/30 p-3 text-xs text-slate-300">{JSON.stringify(importResult, null, 2)}</pre>}
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-2">{fields.map((f) => <input key={f} className="rounded-md border border-line bg-navy/70 px-3 py-2 text-sm text-slate-300 outline-none focus:border-teal" placeholder={f} defaultValue={type === 'edit' && detail ? String((detail as any)[f.split(' ')[0].toLowerCase()] ?? '') : ''} />)}</div>
            <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="rounded-md border border-line px-4 py-2 text-sm text-slate-200">Cancel</button><button onClick={type === 'create' ? onCreate : onUpdate} className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy">{loading ? 'Saving...' : 'Save'}</button></div>
          </>
        )}
      </div>
    </div>
  );
}
