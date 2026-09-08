import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, FileText, Database, Key } from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  issuerVerified?: boolean;
  signatureValid?: boolean;
  notRevoked?: boolean;
  notExpired?: boolean;
  blockchainAnchorVerified?: boolean;
  result: 'VALID' | 'INVALID' | 'REVOKED' | 'EXPIRED' | string;
  errors?: string[];
  credentialId?: string;
  issuerDID?: string;
  blockchainTxHash?: string | null;
}

interface VerificationChainProps {
  result: VerificationResult;
}

export const VerificationChain: React.FC<VerificationChainProps> = ({ result }) => {
  const steps = [
    {
      title: 'Issuer DID Authenticity',
      desc: 'Cryptographic signature from accredited BEL issuer',
      status: result.issuerVerified !== false,
      icon: Key
    },
    {
      title: 'Cryptographic Signature',
      desc: 'Ed25519 proof matches credential payload hash',
      status: result.signatureValid !== false,
      icon: ShieldCheck
    },
    {
      title: 'Revocation Registry Check',
      desc: 'Queried smart contract revocation status',
      status: result.notRevoked !== false,
      icon: FileText
    },
    {
      title: 'Temporal Expiration',
      desc: 'Credential issued timestamp is within validity period',
      status: result.notExpired !== false,
      icon: AlertTriangle
    },
    {
      title: 'Blockchain Anchor Integrity',
      desc: 'Tamper-evident block confirmation on permissioned ledger',
      status: result.blockchainAnchorVerified !== false,
      icon: Database
    }
  ];

  const isSuccess = result.result === 'VALID' || result.valid;
  const isRevoked = result.result === 'REVOKED';
  const isExpired = result.result === 'EXPIRED';

  return (
    <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#1A2744]/70 border border-[#1E3A5F]">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : isRevoked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
            {isSuccess ? <ShieldCheck className="w-8 h-8" /> : isRevoked ? <ShieldAlert className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Public Verifier Result</span>
            <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
              <span className={isSuccess ? 'text-emerald-400' : isRevoked ? 'text-rose-400' : 'text-amber-400'}>
                {result.result || (result.valid ? 'VALID' : 'INVALID')}
              </span>
              <span className="text-xs font-normal text-slate-400">
                {isSuccess ? '— Cryptographically Verified' : '— Verification Failed'}
              </span>
            </h2>
          </div>
        </div>

        <div className="text-left md:text-right text-xs text-slate-400">
          <div>Verified via <span className="text-slate-200 font-mono">BEL-EDIDAP Engine</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zero PII exposed to verifier</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Verification Steps</h4>
        <div className="divide-y divide-[#1E3A5F]/40 border border-[#1E3A5F] rounded-lg bg-[#0A0F1E]/50">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#1A2744] text-slate-300 border border-[#1E3A5F]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">{step.title}</p>
                    <p className="text-[11px] text-slate-500">{step.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {step.status ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pass</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 text-xs font-medium bg-rose-950/30 px-2 py-0.5 rounded border border-rose-800/40">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Fail</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
