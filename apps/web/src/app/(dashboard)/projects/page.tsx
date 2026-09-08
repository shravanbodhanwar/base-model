'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, Shield, FolderGit2, Calendar, User } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function ProjectsPage() {
  const simulatedProjects = [
    {
      id: 'proj-1',
      code: 'RADAR-MK4',
      name: 'Next-Gen 3D Surveillance Radar',
      unit: 'Bangalore Unit (Defence)',
      sbu: 'Military Radars SBU',
      manager: 'Manager MR (manager@bel-demo.in)',
      status: 'ACTIVE',
      did: 'did:bel:project:radar-mk4',
      clearance: 'SECRET',
      members: 14
    },
    {
      id: 'proj-2',
      code: 'EW-SUITE-AV',
      name: 'Airborne Electronic Warfare Suite',
      unit: 'Bangalore Unit (Defence)',
      sbu: 'Electronic Warfare & Avionics SBU',
      manager: 'SBU Head EW',
      status: 'ACTIVE',
      did: 'did:bel:project:ew-av-02',
      clearance: 'TOP_SECRET',
      members: 9
    },
    {
      id: 'proj-3',
      code: 'SONAR-NAV',
      name: 'Submarine Acoustic Sonar System',
      unit: 'Bangalore Unit (Defence)',
      sbu: 'Naval Systems SBU',
      manager: 'Manager Naval',
      status: 'ACTIVE',
      did: 'did:bel:project:sonar-01',
      clearance: 'CONFIDENTIAL',
      members: 18
    },
    {
      id: 'proj-4',
      code: 'SDR-TACTICAL',
      name: 'Software Defined Radio - Handheld',
      unit: 'Hyderabad Unit (Defence)',
      sbu: 'Communication Systems SBU',
      manager: 'Lead Architect SDR',
      status: 'ACTIVE',
      did: 'did:bel:project:sdr-tac-1',
      clearance: 'RESTRICTED',
      members: 22
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <FolderGit2 className="w-6 h-6 text-indigo-400" />
          <span>Strategic Defence Projects</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographic project boundaries: Multi-unit project credentials and clearance scoped access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {simulatedProjects.map((p) => (
          <div key={p.id} className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/60">
                  {p.code}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{p.name}</h3>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div className="space-y-2 text-xs text-slate-400 border-y border-[#1E3A5F]/60 py-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Unit / SBU:</span>
                <span className="text-slate-300 font-medium">{p.unit} · {p.sbu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Project Lead:</span>
                <span className="text-slate-300">{p.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Project DID:</span>
                <span className="font-mono text-blue-400 text-[11px]">{p.did}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Required Clearance:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/40 text-rose-300 border border-rose-800/40">
                  {p.clearance}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>{p.members} Credentialed Personnel</span>
              <span className="text-emerald-400 font-mono text-[10px]">Zero Leakage Architecture</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
