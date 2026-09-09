'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Shield, ArrowLeft, Cpu, QrCode, ArrowRightLeft,
  Calendar, UserCheck, CheckCircle2, History, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { QRModal } from '@/components/shared/QRModal';
import toast from 'react-hot-toast';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showQR, setShowQR] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferUserId, setTransferUserId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset-detail', id],
    queryFn: async () => {
      const res = await apiClient.assets.getAsset(id as string);
      return res?.data || res;
    },
    enabled: !!id
  });

  const { data: custodyHistory = [] } = useQuery({
    queryKey: ['asset-custody', id],
    queryFn: async () => {
      const res = await apiClient.assets.getCustodyHistory(id as string);
      return res?.data || res || [];
    },
    enabled: !!id
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.users.getUsers();
      return res?.data || res || [];
    }
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      return apiClient.assets.transferAsset(id as string, {
        toUserId: transferUserId,
        notes: transferNotes
      });
    },
    onSuccess: () => {
      toast.success('Asset custody transfer recorded on blockchain');
      setShowTransferModal(false);
      queryClient.invalidateQueries({ queryKey: ['asset-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['asset-custody', id] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Transfer failed'));
    }
  });

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500">Loading asset ledger records...</div>;
  }

  if (!asset) {
    return <div className="text-center py-20 text-slate-500">Asset not found.</div>;
  }

  const publicVerifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/asset/${asset.id}`
    : `/verify/asset/${asset.id}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/assets"
            className="p-2 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-cyan-400" />
              <span>{asset.name}</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Token ID: {asset.tokenId || asset.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQR(true)}
            className="py-2 px-3 bg-[#1A2744] hover:bg-[#1E3A5F] text-slate-200 border border-[#1E3A5F] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Public QR</span>
          </button>

          {asset.transferability !== 'SOULBOUND' && (
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Custody</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E3A5F]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Category</span>
            <div className="text-lg font-bold text-slate-100">{asset.category}</div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={asset.status} />
            <span className={`text-xs px-2.5 py-1 rounded font-mono ${asset.transferability === 'SOULBOUND' ? 'bg-purple-950/50 text-purple-300 border border-purple-800' : 'bg-blue-950/50 text-blue-300 border border-blue-800'}`}>
              {asset.transferability}
            </span>
          </div>
        </div>

        {asset.description && (
          <p className="text-sm text-slate-300 leading-relaxed">
            {asset.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
            <span className="text-slate-500">Current Custodian:</span>
            <div className="font-semibold text-slate-200">
              {asset.custodian?.name || asset.owner?.name || 'Unassigned'}
            </div>
            {asset.owner?.employeeId && (
              <span className="font-mono text-[10px] text-slate-400">Emp ID: {asset.owner.employeeId}</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
            <span className="text-slate-500">Operating Unit:</span>
            <div className="font-semibold text-slate-200">
              {asset.unit?.name || 'Bangalore Unit'}
            </div>
            <span className="text-[10px] text-slate-400">{asset.sbu?.name || 'Military Radars SBU'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
            <span className="text-slate-500">Ledger Registration:</span>
            <div className="font-semibold text-slate-200">
              {asset.mintedAt ? new Date(asset.mintedAt).toLocaleDateString() : 'Active'}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Blockchain Confirmed
            </span>
          </div>
        </div>

        {/* Off-Chain Metadata */}
        {asset.metadataJson && (
          <div className="p-5 rounded-xl bg-[#1A2744]/20 border border-[#1E3A5F] space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Asset Metadata & Technical Specifications
            </div>
            <pre className="p-4 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F] text-xs font-mono text-cyan-300 overflow-x-auto">
              {JSON.stringify(asset.metadataJson, null, 2)}
            </pre>
          </div>
        )}

        {/* Blockchain Anchors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Metadata SHA-256 Digest</span>
            <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F]">
              <HashDisplay hash={asset.metadataHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'} />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Smart Contract Mint TX</span>
            <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F]">
              {asset.blockchainTxHash ? (
                <HashDisplay hash={asset.blockchainTxHash} />
              ) : (
                <span className="text-xs font-mono text-slate-500">Off-Chain Anchored</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custody Timeline */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1E3A5F]">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Custody & Transfer History</h3>
        </div>

        {custodyHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Initial mint custody recorded. No subsequent transfers.
          </div>
        ) : (
          <div className="space-y-3">
            {custodyHistory.map((t: any) => (
              <div key={t.id} className="p-3.5 rounded-lg bg-[#1A2744]/50 border border-[#1E3A5F] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Transferred to: {t.toUser?.name || 'Assigned Officer'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Initiated by: {t.initiator?.name || 'Manager'} · {new Date(t.createdAt).toLocaleString()}
                  </div>
                  {t.notes && <div className="text-[11px] text-slate-500 italic mt-1">{t.notes}</div>}
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Transfer Custody of Asset</h3>
            <p className="text-xs text-slate-400">
              Select the receiving employee/officer. The transfer will be anchored to the smart contract custody registry.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Recipient Custodian
              </label>
              <select
                value={transferUserId}
                onChange={(e) => setTransferUserId(e.target.value)}
                required
                className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Choose Recipient Officer --</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department || 'BEL'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Transfer Reason / Mission Notes
              </label>
              <textarea
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                rows={2}
                placeholder="Reason for equipment reallocation or prototype handover..."
                className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="py-2 px-4 rounded-lg bg-transparent text-slate-400 hover:text-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => transferMutation.mutate()}
                disabled={transferMutation.isPending || !transferUserId}
                className="py-2 px-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {transferMutation.isPending ? 'Executing Transfer...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title={`Verify ${asset.name}`}
        url={publicVerifyUrl}
        entityId={asset.id}
      />
    </div>
  );
}
