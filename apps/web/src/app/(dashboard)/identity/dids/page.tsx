'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Shield, RefreshCw, Plus, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { QRModal } from '@/components/shared/QRModal';
import toast from 'react-hot-toast';

export default function DIDsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQR, setSelectedQR] = useState<{ did: string; url: string } | null>(null);

  const { data: dids = [], isLoading } = useQuery({
    queryKey: ['dids'],
    queryFn: async () => {
      const res = await apiClient.dids.getDIDs();
      return res?.data || res || [];
    }
  });

  const rotateMutation = useMutation({
    mutationFn: async (did: string) => {
      return apiClient.dids.rotateDIDKey(did);
    },
    onSuccess: () => {
      toast.success('DID cryptographic key rotated successfully');
      queryClient.invalidateQueries({ queryKey: ['dids'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Key rotation failed');
    }
  });

  const filteredDIDs = dids.filter((d: any) =>
    d.did.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.owner?.name && d.owner.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Key className="w-6 h-6 text-blue-400" />
            <span>Decentralized Identifiers (DIDs)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            W3C DID Registry: Independent, tamper-evident decentralized identities for employees and organizational units
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-[#1A2744] px-3 py-1.5 rounded-lg border border-[#1E3A5F]">
            Total DIDs: <strong className="text-blue-400 font-mono">{dids.length}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-[#0D1B2A] border border-[#1E3A5F] p-3 rounded-xl">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by DID string, owner name, or entity type..."
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none flex-1"
        />
      </div>

      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A2744] text-slate-400 border-b border-[#1E3A5F]">
              <tr>
                <th className="py-3 px-4 font-semibold">DID Identifier</th>
                <th className="py-3 px-4 font-semibold">Entity Scope</th>
                <th className="py-3 px-4 font-semibold">Associated Owner</th>
                <th className="py-3 px-4 font-semibold">Key Version</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Ledger Anchor</th>
                <th className="py-3 px-4 font-semibold text-right">Key Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">Loading DID documents...</td>
                </tr>
              ) : filteredDIDs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">No matching DIDs found.</td>
                </tr>
              ) : (
                filteredDIDs.map((d: any) => (
                  <tr key={d.id} className="hover:bg-[#1A2744]/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-blue-400 text-[11px] max-w-[240px] truncate">
                      {d.did}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {d.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {d.owner?.name || 'BEL Root Entity'}
                      {d.owner?.employeeId && (
                        <span className="block text-[10px] text-slate-500 font-mono">
                          ID: {d.owner.employeeId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      v{d.keyVersion || 1}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3 px-4">
                      {d.blockchainTxHash ? (
                        <HashDisplay hash={d.blockchainTxHash} />
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">Off-Chain Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => rotateMutation.mutate(d.did)}
                        disabled={rotateMutation.isPending}
                        className="inline-flex items-center gap-1 py-1 px-2.5 bg-[#1A2744] hover:bg-blue-900/30 text-blue-300 border border-[#1E3A5F] hover:border-blue-500/50 rounded-lg text-[11px] transition-all"
                        title="Rotate Cryptographic Key"
                      >
                        <RefreshCw className={`w-3 h-3 ${rotateMutation.isPending ? 'animate-spin' : ''}`} />
                        <span>Rotate Key</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
