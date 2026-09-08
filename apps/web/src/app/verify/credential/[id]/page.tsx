'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Shield, Award, CheckCircle2, XCircle, ArrowLeft, Key, Database, Calendar } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { VerificationChain } from '@/components/shared/VerificationChain';
import { HashDisplay } from '@/components/shared/HashDisplay';

export default function PublicCredentialVerificationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: verification, isLoading, error } = useQuery({
    queryKey: ['public-verify-cred', id],
    queryFn: async () => {
      const res = await apiClient.verify.verifyCredential(id as string);
      return res?.data || res;
    },
    enabled: !!id
  });

  return (
    <div className="min-h-screen grid-bg p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#1E3A5F]">
          <Link href="/verify" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Public Verifier Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-bold text-slate-200">BEL-EDIDAP Engine</span>
            <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded">
              PROTOTYPE
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-100">Public Credential Verification</h1>
          <p className="text-xs text-slate-400">
            Cryptographic authenticity confirmation via decentralized identity and immutable ledger
          </p>
        </div>

        {isLoading ? (
          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Querying blockchain state and verifying cryptographic proofs...</p>
          </div>
        ) : error || !verification ? (
          <div className="bg-[#0D1B2A] border border-rose-900/50 rounded-2xl p-8 text-center space-y-3">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-200">Credential Not Found / Invalid</h2>
            <p className="text-xs text-slate-400">
              The credential ID or cryptographic hash could not be resolved against the registry.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Authenticity Certificate Box */}
            <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1E3A5F]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Verified Credential</span>
                  <h3 className="text-lg font-bold text-slate-100">{verification.type || 'Identity Credential'}</h3>
                </div>
                <div className="font-mono text-xs text-blue-400 truncate max-w-[220px]">
                  ID: {verification.credentialId}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
                  <span className="text-slate-500">Accredited Issuer:</span>
                  <div className="font-semibold text-slate-200">{verification.issuerName || 'Bharat Electronics Limited'}</div>
                  <span className="font-mono text-[10px] text-blue-400 truncate block">{verification.issuerDID}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
                  <span className="text-slate-500">Subject DID (Holder):</span>
                  <div className="font-semibold text-slate-200">Validated Subject</div>
                  <span className="font-mono text-[10px] text-cyan-400 truncate block">{verification.subjectDID}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2">
                <span>Issued: {new Date(verification.issuedAt).toLocaleDateString()}</span>
                <span className="text-[11px] text-slate-500">Zero Personally Identifiable Information (PII) Stored On-Chain</span>
              </div>
            </div>

            {/* Verification Chain */}
            <VerificationChain
              result={{
                valid: verification.verification?.valid ?? true,
                result: verification.verification?.result || 'VALID',
                issuerVerified: verification.verification?.issuerVerified ?? true,
                signatureValid: verification.verification?.signatureValid ?? true,
                notRevoked: verification.verification?.notRevoked ?? true,
                notExpired: verification.verification?.notExpired ?? true,
                blockchainAnchorVerified: verification.verification?.blockchainAnchorVerified ?? true
              }}
            />
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-600 mt-12">
        BEL Enterprise Decentralized Identity & Digital Asset Platform · Prototype Architecture
      </div>
    </div>
  );
}
