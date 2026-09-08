'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, ShieldCheck, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import toast from 'react-hot-toast';

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await apiClient.vendors.getVendors();
      return res?.data || res || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => apiClient.vendors.createVendor(payload),
    onSuccess: () => {
      toast.success('Vendor registered with decentralized identifier');
      setShowCreateModal(false);
      setName('');
      setRegNum('');
      setEmail('');
      setPhone('');
      setAddress('');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Vendor creation failed');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => apiClient.vendors.verifyVendor(id),
    onSuccess: () => {
      toast.success('Vendor marked as QUALIFIED supplier');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Verification failed');
    }
  });

  const filteredVendors = vendors.filter((v: any) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.registrationNumber && v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Defence Vendors & Supplier Portal</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            External contractor identity management, qualification credentials, and compliance tracking
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vendor</span>
        </button>
      </div>

      <div className="flex items-center gap-3 bg-[#0D1B2A] border border-[#1E3A5F] p-3 rounded-xl">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by vendor name or registration number..."
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none flex-1"
        />
      </div>

      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A2744] text-slate-400 border-b border-[#1E3A5F]">
              <tr>
                <th className="py-3 px-4 font-semibold">Vendor Name</th>
                <th className="py-3 px-4 font-semibold">Reg Number</th>
                <th className="py-3 px-4 font-semibold">Vendor DID</th>
                <th className="py-3 px-4 font-semibold">Contact Email</th>
                <th className="py-3 px-4 font-semibold">Qualification</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60 text-slate-300">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Loading vendors...</td></tr>
              ) : filteredVendors.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">No registered vendors found.</td></tr>
              ) : (
                filteredVendors.map((v: any) => (
                  <tr key={v.id} className="hover:bg-[#1A2744]/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">{v.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{v.registrationNumber || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-blue-400 text-[11px] truncate max-w-[200px]">{v.did}</td>
                    <td className="py-3 px-4 text-slate-400">{v.contactEmail || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${v.qualificationStatus === 'QUALIFIED' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' : 'bg-amber-950/50 text-amber-300 border border-amber-800'}`}>
                        {v.qualificationStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                    <td className="py-3 px-4 text-right">
                      {v.qualificationStatus !== 'QUALIFIED' && (
                        <button
                          type="button"
                          onClick={() => verifyMutation.mutate(v.id)}
                          disabled={verifyMutation.isPending}
                          className="py-1 px-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded text-[11px] font-medium transition-all"
                        >
                          Qualify
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Register New Defence Vendor</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bharat Dynamics Technologies"
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registration / GSTIN</label>
                <input
                  type="text"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  placeholder="e.g. 29AABCB1234F1Z5"
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@company.com"
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="py-2 px-4 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => createMutation.mutate({ name, registrationNumber: regNum, contactEmail: email, contactPhone: phone, address })}
                disabled={createMutation.isPending || !name}
                className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {createMutation.isPending ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
