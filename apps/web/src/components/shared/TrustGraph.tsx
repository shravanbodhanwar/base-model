import React from 'react';
import { Building2, Layers, Cpu, User, ShieldCheck, Key } from 'lucide-react';

interface TrustGraphProps {
  employeeName: string;
  employeeDID: string;
  unitName?: string;
  sbuName?: string;
  roleName?: string;
  permissions?: string[];
}

export const TrustGraph: React.FC<TrustGraphProps> = ({
  employeeName,
  employeeDID,
  unitName = 'Bangalore Unit (Defence)',
  sbuName = 'Military Radars SBU',
  roleName = 'OFFICER',
  permissions = ['VIEW_OWN_DATA']
}) => {
  return (
    <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1E3A5F]">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Cryptographic Trust Hierarchy</h3>
          <p className="text-xs text-slate-400">Decentralized credential-anchored organizational authority</p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          W3C DID Model
        </span>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-3 text-center">
        {/* Node 1: Root Org */}
        <div className="flex flex-col items-center z-10 w-full md:w-36">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-400/40 flex items-center justify-center text-blue-200 shadow-md shadow-blue-500/20 mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200">BEL Root DID</span>
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">did:bel:org:bel-001</span>
          <span className="text-[9px] text-blue-400 mt-1 px-1.5 py-0.5 bg-blue-900/30 rounded">Trust Anchor</span>
        </div>

        {/* Arrow 1 */}
        <div className="hidden md:flex items-center text-slate-600">→</div>

        {/* Node 2: Unit */}
        <div className="flex flex-col items-center z-10 w-full md:w-36">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-800 to-slate-900 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-md mb-2">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Unit DID</span>
          <span className="text-[10px] text-slate-400 truncate max-w-[130px]">{unitName}</span>
          <span className="text-[9px] text-indigo-400 mt-1 px-1.5 py-0.5 bg-indigo-900/30 rounded">Unit Authority</span>
        </div>

        {/* Arrow 2 */}
        <div className="hidden md:flex items-center text-slate-600">→</div>

        {/* Node 3: SBU */}
        <div className="flex flex-col items-center z-10 w-full md:w-36">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-800 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md mb-2">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200">SBU DID</span>
          <span className="text-[10px] text-slate-400 truncate max-w-[130px]">{sbuName}</span>
          <span className="text-[9px] text-cyan-400 mt-1 px-1.5 py-0.5 bg-cyan-900/30 rounded">Department</span>
        </div>

        {/* Arrow 3 */}
        <div className="hidden md:flex items-center text-slate-600">→</div>

        {/* Node 4: Employee */}
        <div className="flex flex-col items-center z-10 w-full md:w-36">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-800 to-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md mb-2 ring-2 ring-emerald-500/20">
            <User className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">{employeeName}</span>
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">{employeeDID}</span>
          <span className="text-[9px] text-emerald-400 mt-1 px-1.5 py-0.5 bg-emerald-900/30 rounded">Self-Controlled</span>
        </div>

        {/* Arrow 4 */}
        <div className="hidden md:flex items-center text-slate-600">→</div>

        {/* Node 5: Role & Permissions */}
        <div className="flex flex-col items-center z-10 w-full md:w-36">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md mb-2">
            <Key className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">{roleName}</span>
          <span className="text-[10px] text-slate-400">{permissions.length} Scoped Perms</span>
          <span className="text-[9px] text-amber-400 mt-1 px-1.5 py-0.5 bg-amber-900/30 rounded">Role Credential</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#1E3A5F]/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>No centralized key storage: Organization does NOT hold employee private keys.</span>
        </span>
        <span className="font-mono text-slate-500 text-[10px]">Verified via VC Proof</span>
      </div>
    </div>
  );
};
