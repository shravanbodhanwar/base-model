'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale, ShieldAlert, CheckCircle2, Clock, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HashDisplay } from '@/components/shared/HashDisplay';
import toast from 'react-hot-toast';

export default function GovernancePage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState('PAUSE_CONTRACT');

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['governance-proposals'],
    queryFn: async () => {
      const res = await apiClient.governance.getProposals();
      return res?.data || res || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => apiClient.governance.createProposal(payload),
    onSuccess: () => {
      toast.success('Multi-signature governance proposal created');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Proposal creation failed'));
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => apiClient.governance.approveProposal(id),
    onSuccess: () => {
      toast.success('Cryptographic governance approval signature recorded');
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Approval failed'));
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-purple-400" />
            <span>Multi-Signature Governance Council</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            2-of-3 M-of-N Cryptographic threshold execution for critical infrastructure and smart contract changes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 flex gap-3 text-xs text-purple-300">
        <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-purple-200">Simulated 2-of-3 Governance Threshold:</strong>
          <p className="text-slate-400 mt-0.5">
            Actions like contract deployment, emergency contract pausing, high-value asset decommissioning, or root DID revocation
            require independent signatures from accredited governance officers before smart contract execution.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-500 bg-[#0D1B2A] rounded-xl border border-[#1E3A5F]">
            Loading governance proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 bg-[#0D1B2A] rounded-xl border border-[#1E3A5F]">
            No active governance proposals.
          </div>
        ) : (
          proposals.map((p: any) => {
            const approvalsCount = p.approvals?.length || 0;
            const threshold = p.requiredApprovals || 2;
            const progressPct = Math.min(100, Math.round((approvalsCount / threshold) * 100));

            return (
              <div key={p.id} className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-4 hover:border-purple-500/40 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {p.actionType}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{p.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {p.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(p.id)}
                        disabled={approveMutation.isPending}
                        className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Sign & Approve</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-[#1E3A5F]/60">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Approval Quorum: <strong className="text-slate-200">{approvalsCount} / {threshold} signatures</strong></span>
                    <span>{progressPct}% Complete</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1A2744] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Approvers list */}
                {p.approvals && p.approvals.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Signatures Collected:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {p.approvals.map((appr: any) => (
                        <div key={appr.id} className="p-2.5 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">
                            {appr.signerDID || `Signer ${appr.signerUserId?.substring(0, 8)}`}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(appr.approvedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Create Multi-Sig Governance Proposal</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Emergency Pause AssetNFT Contract"
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200"
                >
                  <option value="PAUSE_CONTRACT">PAUSE_CONTRACT</option>
                  <option value="UNPAUSE_CONTRACT">UNPAUSE_CONTRACT</option>
                  <option value="UPGRADE_CONTRACT">UPGRADE_CONTRACT</option>
                  <option value="BURN_HIGH_VALUE_ASSET">BURN_HIGH_VALUE_ASSET</option>
                  <option value="REVOKE_ORG_DID">REVOKE_ORG_DID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Justification / Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Operational justification for the governance council to review..."
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200"
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
                onClick={() => createMutation.mutate({ title, description, actionType })}
                disabled={createMutation.isPending || !title}
                className="py-2 px-5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
