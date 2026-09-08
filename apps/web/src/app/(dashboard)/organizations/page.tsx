'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Layers, Cpu, ChevronRight, ChevronDown, Shield, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function OrganizationsPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'bel-root': true,
    'unit-bg': true,
    'unit-hyd': true
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await apiClient.organizations.getOrganizations();
      return res?.data || res || [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-blue-400" />
          <span>Organizational Hierarchy & Units</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Decentralized scope tree: Bharat Electronics Limited corporate root, operational units, and strategic business units (SBUs)
        </p>
      </div>

      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E3A5F]">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Scope Boundary Tree
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded">
            Configurable Simulated Structure
          </span>
        </div>

        {/* Tree Root */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#1A2744] border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bharat Electronics Limited (Root Org)</h3>
                <span className="text-[11px] font-mono text-blue-300">did:bel:org:bel-001</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
              ENTERPRISE SCOPE
            </span>
          </div>

          {/* Segments & Units */}
          <div className="pl-6 space-y-4 border-l-2 border-[#1E3A5F] ml-5">
            {/* Bangalore Unit */}
            <div className="space-y-2">
              <div
                onClick={() => toggleExpand('unit-bg')}
                className="p-3.5 rounded-lg bg-[#1A2744]/60 border border-[#1E3A5F] flex items-center justify-between cursor-pointer hover:border-slate-500 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Bangalore Unit (Defence Segment)</span>
                  <span className="text-[10px] font-mono text-slate-400">did:bel:unit:bg-001</span>
                </div>
                {expanded['unit-bg'] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>

              {expanded['unit-bg'] && (
                <div className="pl-6 space-y-2 border-l-2 border-indigo-900/50 ml-4">
                  {[
                    { name: 'Military Radars SBU', did: 'did:bel:sbu:mr-001', code: 'MR' },
                    { name: 'Electronic Warfare & Avionics SBU', did: 'did:bel:sbu:ew-001', code: 'EW' },
                    { name: 'Software SBU', did: 'did:bel:sbu:sw-001', code: 'SW' },
                    { name: 'Naval Systems SBU', did: 'did:bel:sbu:ns-001', code: 'NS' }
                  ].map((sbu) => (
                    <div key={sbu.did} className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs text-slate-300 font-medium">{sbu.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">({sbu.code})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{sbu.did}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hyderabad Unit */}
            <div className="space-y-2">
              <div
                onClick={() => toggleExpand('unit-hyd')}
                className="p-3.5 rounded-lg bg-[#1A2744]/60 border border-[#1E3A5F] flex items-center justify-between cursor-pointer hover:border-slate-500 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Hyderabad Unit (Defence Segment)</span>
                  <span className="text-[10px] font-mono text-slate-400">did:bel:unit:hyd-001</span>
                </div>
                {expanded['unit-hyd'] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>

              {expanded['unit-hyd'] && (
                <div className="pl-6 space-y-2 border-l-2 border-indigo-900/50 ml-4">
                  <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1E3A5F] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs text-slate-300 font-medium">Communication Systems SBU</span>
                      <span className="text-[10px] font-mono text-slate-500">(CS)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">did:bel:sbu:cs-001</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pune Unit */}
            <div className="p-3.5 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-300">Pune Unit (Non-Defence Segment)</span>
                <span className="text-[10px] font-mono text-slate-500">did:bel:unit:pun-001</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1 SBU (Consumer Electronics)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
