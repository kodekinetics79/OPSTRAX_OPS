
import React from 'react';
import DynamicTable from '@/components/common/DynamicTable';
import StatusBadge from '@/components/common/StatusBadge';
import { MOCK_TENANTS, MOCK_BRANCHES, MOCK_USERS, MOCK_RBAC_ROLES } from '@/data/mock/organization';
import { Plus, Building2, MapPin, Users, ShieldCheck, Mail, Globe, Briefcase, UserCircle, Activity } from 'lucide-react';
import { PremiumHeader, StatsCard } from '@/components';

// Shared Stats Card Data (Mock)
const getStats = (type, data) => {
  const total = data.length;
  const active = data.filter(d => d.status === 'Active').length;
  
  return [
    { label: `Total ${type}`, value: total, icon: type === 'Tenants' ? Building2 : type === 'Branches' ? MapPin : Users, variant: 'primary' },
    { label: 'Active', value: active, icon: Activity, variant: 'success' },
    { label: 'Inactive', value: total - active, icon: UserCircle, variant: 'warning' },
  ];
};

export const TenantManagement = () => {
  const stats = getStats('Tenants', MOCK_TENANTS);
  
  const columns = [
    { 
      header: "Tenant Name", 
      accessor: "name", 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
            <Building2 size={18} />
          </div>
          <div>
            <span className="font-semibold text-slate-400 block">{row.name}</span>
            <span className="text-xs text-slate-400 font-mono">{row.id || "TEN-001"}</span>
          </div>
        </div>
      ) 
    },
    { 
      header: "Region", 
      accessor: "region",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-300">
          <Globe size={14} />
          <span>{row.region}</span>
        </div>
      )
    },
    { 
      header: "Plan", 
      accessor: "plan", 
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
          {row.plan}
        </span>
      ) 
    },
    { header: "Users", accessor: "users" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <PremiumHeader 
        icon={Building2} 
        title="Tenant Management" 
        subtitle="Manage multi-tenant organizations and subscriptions" 
        onAddClick={() => {}}
        buttonLabel="Add Tenant"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} {...s} />
        ))}
      </div>

      <DynamicTable data={MOCK_TENANTS} columns={columns} />
    </div>
  );
};

export const BranchManagement = () => {
  const stats = getStats('Branches', MOCK_BRANCHES);

  const columns = [
    { 
      header: "Branch Name", 
      accessor: "name", 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
            <MapPin size={18} />
          </div>
          <span className="font-semibold text-slate-400">{row.name}</span>
        </div>
      ) 
    },
    { 
      header: "Parent Tenant", 
      accessor: "tenant",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-300">
          <Building2 size={14} />
          <span>{row.tenant}</span>
        </div>
      )
    },
    { header: "City", accessor: "city" },
    { header: "Type", accessor: "type" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <PremiumHeader 
        icon={MapPin} 
        title="Branch Management" 
        subtitle="Offices, hubs, and distribution centers" 
        onAddClick={() => {}}
        buttonLabel="Add Branch"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} {...s} />
        ))}
      </div>

      <DynamicTable data={MOCK_BRANCHES} columns={columns} />
    </div>
  );
};

export const UserManagement = () => {
  const stats = getStats('Users', MOCK_USERS);

  const columns = [
    { 
      header: "User Profile", 
      accessor: "name", 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-400 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400 font-mono">{row.id}</p>
          </div>
        </div>
      ) 
    },
    { 
      header: "Contact", 
      accessor: "email",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Mail size={14} />
          <span>{row.email}</span>
        </div>
      )
    },
    { 
      header: "Role", 
      accessor: "role",
      render: (row) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="font-medium text-slate-700">{row.role}</span>
        </div>
      )
    },
    { 
      header: "Branch", 
      accessor: "branch",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-300">
          <Briefcase size={14} />
          <span>{row.branch}</span>
        </div>
      )
    },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <PremiumHeader 
        icon={Users} 
        title="User Directory" 
        subtitle="System users and access management" 
        onAddClick={() => {}}
        buttonLabel="Add User"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} {...s} />
        ))}
      </div>

      <DynamicTable data={MOCK_USERS} columns={columns} />
    </div>
  );
};

export const RBAC = () => {
  const columns = [
    { 
      header: "Role Name", 
      accessor: "name", 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-slate-400">{row.name}</span>
        </div>
      ) 
    },
    { 
      header: "Description", 
      accessor: "description",
      render: (row) => <span className="text-slate-500">{row.description}</span>
    },
    { 
      header: "Assigned Users", 
      accessor: "users_count", 
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-300 border border-slate-200">
          {row.users_count} Users
        </span>
      ) 
    },
    {
      header: "Permissions",
      accessor: "permissions",
      render: () => (
        <div className="flex -space-x-1">
          {[1,2,3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
              P{i}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
            +5
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <PremiumHeader 
        icon={ShieldCheck} 
        title="Roles & Permissions" 
        subtitle="Configure Role-Based Access Control policies" 
        onAddClick={() => {}}
        buttonLabel="Create Role"
      />
      <DynamicTable data={MOCK_RBAC_ROLES} columns={columns} />
    </div>
  );
};
