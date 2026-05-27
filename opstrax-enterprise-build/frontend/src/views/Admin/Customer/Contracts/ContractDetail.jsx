
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CUSTOMERS } from '@/data/mock/customers';
import GradeBadge from '@/components/common/GradeBadge';
import { 
  ArrowLeft, Calendar, User, Truck, Thermometer, 
  MapPin, DollarSign, FileText, CheckCircle2 
} from 'lucide-react';

const ContractDetail = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();

  // Find contract across all customers
  let contract = null;
  let customer = null;

  for (const c of MOCK_CUSTOMERS) {
    const found = c.contracts.find(con => con.id === contractId);
    if (found) {
      contract = found;
      customer = c;
      break;
    }
  }

  if (!contract) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-white">Contract not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span>Back to Contracts</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{contract.title}</h1>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="font-medium text-gray-300">{customer.company_name}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="font-mono text-sm">{contract.id}</span>
            </div>
          </div>
          <div className="flex gap-3">
             <GradeBadge grade={contract.grade} />
             <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> Active
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Key Info */}
        <div className="space-y-6 xl:col-span-1">
            <div className="bg-card-dark p-5 rounded-xl shadow-lg border border-white/5">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contract Terms</h3>
                
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="text-gray-500 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-200">{contract.period.start} — {contract.period.end}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <User className="text-gray-500 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm text-gray-500">Point of Contact</p>
                            <p className="font-medium text-gray-200">{contract.poc.name}</p>
                            <p className="text-sm text-primary">{contract.poc.contact}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Thermometer className="text-gray-500 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm text-gray-500">Load Type</p>
                            <p className="font-medium text-gray-200">{contract.load_type}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card-dark p-5 rounded-xl shadow-lg border border-white/5">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Dedicated Resources</h3>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg text-center border border-blue-500/20">
                        <span className="block text-2xl font-bold text-blue-400">{contract.dedicated_resources.vehicles_count}</span>
                        <span className="text-xs text-blue-300/70 font-medium">Vehicles</span>
                    </div>
                    <div className="bg-indigo-500/10 p-3 rounded-lg text-center border border-indigo-500/20">
                        <span className="block text-2xl font-bold text-indigo-400">{contract.dedicated_resources.drivers_count}</span>
                        <span className="text-xs text-indigo-300/70 font-medium">Drivers</span>
                    </div>
                 </div>
                 <p className="text-xs text-gray-400 italic bg-white/5 p-2 rounded border border-white/5">
                    "{contract.dedicated_resources.notes}"
                 </p>
            </div>
        </div>

        {/* Right Column: Detailed Specs */}
        <div className="space-y-6 xl:col-span-2">
            
            {/* Vehicle Requirements */}
            <div className="bg-card-dark p-6 rounded-xl shadow-lg border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Truck className="text-blue-400" size={20} />
                    <h3 className="font-bold text-white">Vehicle Requirements</h3>
                </div>
                
                <div className="overflow-hidden border border-white/5 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
                            <tr>
                                <th className="px-4 py-3">Vehicle Type</th>
                                <th className="px-4 py-3">Required Count</th>
                                <th className="px-4 py-3">Engagement Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {contract.vehicle_requirements.map((req, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-200">{req.type}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-gray-300 border border-white/10">
                                            {req.count} Units
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{req.engaged_details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rates & Billing */}
            <div className="bg-card-dark p-6 rounded-xl shadow-lg border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="text-primary" size={20} />
                    <h3 className="font-bold text-white">Agreed Rates</h3>
                </div>

                <div className="grid gap-4">
                    {contract.rates.map((rate, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-white/5 rounded-lg hover:border-primary/30 transition-colors bg-white/5">
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {rate.type === 'Per KM' ? (
                                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20"><MapPin size={16}/></div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20"><FileText size={16}/></div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">{rate.type}</p>
                                    {rate.origin && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                            <span>{rate.origin}</span>
                                            <span className="text-gray-600">→</span>
                                            <span>{rate.destination}</span>
                                        </div>
                                    )}
                                    {rate.notes && <p className="text-xs text-gray-500 mt-1">{rate.notes}</p>}
                                    {rate.vehicle && <p className="text-xs font-medium text-blue-400 mt-1 px-2 py-0.5 bg-blue-500/10 rounded w-fit border border-blue-500/20">{rate.vehicle}</p>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-white">{rate.amount} <span className="text-xs font-normal text-gray-500">{rate.currency}</span></p>
                                <p className="text-xs text-gray-500">Rate Unit</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Destinations */}
            <div className="bg-card-dark p-6 rounded-xl shadow-lg border border-white/5">
                 <div className="flex items-center gap-2 mb-4">
                    <MapPin className="text-rose-500" size={20} />
                    <h3 className="font-bold text-white">Approved Destinations</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {contract.destinations.map((dest, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                            {dest}
                        </span>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
