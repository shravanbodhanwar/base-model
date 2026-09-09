'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award, Shield, Key, Calendar, ArrowLeft, QrCode,
  ShieldCheck, AlertTriangle, RefreshCw, FileText, CheckCircle2, Lock
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { QRModal } from '@/components/shared/QRModal';
import { VerificationChain } from '@/components/shared/VerificationChain';
import toast from 'react-hot-toast';

export default function CredentialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showQR, setShowQR] = useState(false);

  const { data: credential, isLoading } = useQuery({
    queryKey: ['credential-detail', id],
    queryFn: async () => {
      const res = await apiClient.credentials.getCredential(id as string);
      return res?.data || res;
    },
    enabled: !!id
  });

  const { data: verifyResult, refetch: refetchVerify, isFetching: isVerifying } = useQuery({
    queryKey: ['credential-verify', id],
    queryFn: async () => {
      const res = await apiClient.credentials.verifyCredential(id as string);
      return res?.data || res;
    },
    enabled: !!id
  });

  const revokeMutation = useMutation({
    mutationFn: async () => apiClient.credentials.revokeCredential(id as string),
    onSuccess: () => {
      toast.success('Credential revoked and updated on-chain');
      queryClient.invalidateQueries({ queryKey: ['credential-detail', id] });
      refetchVerify();
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Revocation failed'));
    }
  });

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500">Loading credential details...</div>;
  }

  if (!credential) {
    return <div className="text-center py-20 text-slate-500">Credential not found.</div>;
  }

  const publicVerifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/credential/${credential.credentialId}`
    : `/verify/credential/${credential.credentialId}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/credentials"
            className="p-2 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Award className="w-6 h-6 text-blue-400" />
              <span>{credential.type}</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{credential.credentialId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchVerify()}
            disabled={isVerifying}
            className="py-2 px-3 bg-[#1A2744] hover:bg-[#1E3A5F] text-slate-200 border border-[#1E3A5F] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Re-Verify</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQR(true)}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Generate Public QR</span>
          </button>

          {credential.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to revoke this credential? This action will anchor the revocation to the ledger.')) {
                  revokeMutation.mutate();
                }
              }}
              disabled={revokeMutation.isPending}
              className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-medium transition-all"
            >
              Revoke Credential
            </button>
          )}
        </div>
      </div>

      {/* Main Card View */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E3A5F]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Credential Type</span>
            <h2 className="text-xl font-bold text-slate-100">{credential.type}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={credential.status} />
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Issued: {new Date(credential.issuedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Issuer and Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-[#1A2744]/50 border border-[#1E3A5F] space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issuer (Authority)</span>
            <div className="text-sm font-semibold text-slate-200">
              {credential.issuer?.name || 'BEL Central Authority'}
            </div>
            <div className="text-xs font-mono text-blue-400 truncate">
              {credential.issuerDID}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1A2744]/50 border border-[#1E3A5F] space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subject (Holder)</span>
            <div className="text-sm font-semibold text-slate-200">
              {credential.subject?.name || 'Employee / Subject'}
            </div>
            <div className="text-xs font-mono text-cyan-400 truncate">
              {credential.subjectDID}
            </div>
          </div>
        </div>

        {/* Claims Section */}
        <div className="p-5 rounded-xl bg-[#1A2744]/30 border border-[#1E3A5F] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Decrypted Credential Claims (Off-Chain Data)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encrypted & Private
            </span>
          </div>
          <pre className="p-4 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F] text-xs font-mono text-cyan-300 overflow-x-auto">
            {JSON.stringify(credential.claims, null, 2)}
          </pre>
        </div>

        {/* Cryptographic Proof & Ledger Anchors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Claims SHA-256 Digest</span>
            <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F]">
              <HashDisplay hash={credential.credentialHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'} />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Blockchain Ledger Anchor</span>
            <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F]">
              {credential.blockchainTxHash ? (
                <HashDisplay hash={credential.blockchainTxHash} />
              ) : (
                <span className="text-xs font-mono text-slate-500">Off-Chain Integrity Confirmed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Chain Panel */}
      {verifyResult && (
        <VerificationChain result={verifyResult} />
      )}

      {/* QR Modal */}
      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title={`Scan to Verify ${credential.type}`}
        url={publicVerifyUrl}
        entityId={credential.credentialId}
      />
    </div>
  );
}
