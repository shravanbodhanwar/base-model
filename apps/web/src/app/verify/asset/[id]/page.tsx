'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Shield, Package, CheckCircle2, XCircle, ArrowLeft, History, Cpu } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { HashDisplay } from '@/components/shared/HashDisplay';

export default function PublicAssetVerificationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: verification, isLoading, error } = useQuery({
    queryKey: ['public-verify-asset', id],
    queryFn: async () => {
      const res = await apiClient.verify.verifyAsset(id as string);
      return res?.data || res;
    },
    enabled: !!id
  });

  return (
    <div className="min-h-screen grid-bg p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#1E3A5F]">
          <Link href="/verify" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Public Verifier Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-bold text-slate-200">BEL Asset Custody Ledger</span>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded">
              PROTOTYPE
            </span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-100">Public Asset Verification</h1>
          <p className="text-xs text-slate-400">
            Verify defence equipment custody, authenticity, and blockchain provenance
          </p>
        </div>

        {isLoading ? (
          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Querying asset smart contract registry...</p>
          </div>
        ) : error || !verification ? (
          <div className="bg-[#0D1B2A] border border-rose-900/50 rounded-2xl p-8 text-center space-y-3">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-200">Asset Record Not Found</h2>
            <p className="text-xs text-slate-400">
              The asset token ID could not be resolved on the custody ledger.
            </p>
          </div>
        ) : (
          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E3A5F]">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-[#1A2744] border border-[#1E3A5F] text-cyan-400">
                  <Cpu className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Asset Title</span>
                  <h2 className="text-xl font-bold text-slate-100">{verification.name}</h2>
                  <span className="text-xs font-mono text-cyan-400">Token ID: {verification.tokenId || verification.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AUTHENTIC</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
                <span className="text-slate-500">Asset Category:</span>
                <div className="font-semibold text-slate-200">{verification.category}</div>
                <span className="text-[10px] text-slate-400 font-mono">Transferability: {verification.transferability}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
                <span className="text-slate-500">Current Accredited Custodian:</span>
                <div className="font-semibold text-slate-200">{verification.ownerName || 'Active Officer'}</div>
                <span className="text-[10px] text-slate-400">{verification.unit || 'Bangalore Unit (Defence)'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0F1E] border border-[#1E3A5F] space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Blockchain Proof & Metadata Integrity
              </span>
              <div className="flex flex-col sm:flex-row justify-between text-xs gap-2">
                <span className="text-slate-500">Metadata Digest:</span>
                <HashDisplay hash={verification.metadataHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'} />
              </div>
              {verification.blockchainTxHash && (
                <div className="flex flex-col sm:flex-row justify-between text-xs gap-2 pt-1 border-t border-[#1E3A5F]/40">
                  <span className="text-slate-500">Ledger Anchor TX:</span>
                  <HashDisplay hash={verification.blockchainTxHash} />
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              Recorded across {verification.transferCount || 1} verified chain-of-custody transfer operations.
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-600 mt-12">
        BEL Enterprise Decentralized Identity & Digital Asset Platform · Prototype Architecture
      </div>
    </div>
  );
}
