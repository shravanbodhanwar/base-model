'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Award, Package, Shield, Activity, Database, Scale,
  Building2, Key, CheckCircle2, Clock, AlertTriangle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { SimulatedBanner } from '@/components/shared/SimulatedBanner';
import { AuditTimeline } from '@/components/shared/AuditTimeline';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const primaryRole = user?.roleAssignments?.[0]?.role?.name || 'OFFICER';

  const { data: users = [] } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      const res = await apiClient.users.getUsers();
      return res?.data || res || [];
    }
  });

  const { data: creds = [] } = useQuery({
    queryKey: ['dashboard-creds'],
    queryFn: async () => {
      const res = await apiClient.credentials.getCredentials();
      return res?.data || res || [];
    }
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['dashboard-assets'],
    queryFn: async () => {
      const res = await apiClient.assets.getAssets();
      return res?.data || res || [];
    }
  });

  const { data: dids = [] } = useQuery({
    queryKey: ['dashboard-dids'],
    queryFn: async () => {
      const res = await apiClient.dids.getDIDs();
      return res?.data || res || [];
    }
  });

  const { data: auditEvents = [] } = useQuery({
    queryKey: ['dashboard-audit'],
    queryFn: async () => {
      const res = await apiClient.audit.getAuditEvents({ take: 10 });
      return res?.data || res || [];
    }
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['dashboard-proposals'],
    queryFn: async () => {
      const res = await apiClient.governance.getProposals();
      return res?.data || res || [];
    }
  });

  const activeCredsCount = Array.isArray(creds) ? creds.filter((c: any) => c.status === 'ACTIVE').length : 0;
  const pendingProposalsCount = Array.isArray(proposals) ? proposals.filter((p: any) => p.status === 'PENDING').length : 0;

  const stats = [
    { label: 'Active Identity DIDs', value: dids.length || 11, icon: Key, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Accredited Personnel', value: users.length || 11, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Verifiable Credentials', value: activeCredsCount || creds.length, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Defence Digital Assets', value: assets.length || 3, icon: Package, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Multi-Sig Proposals', value: pendingProposalsCount, icon: Scale, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Audit Trail Events', value: auditEvents.length || 14, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' }
  ];

  return (
    <div className="space-y-6">
      <SimulatedBanner />

      {/* Hero Welcome with Role Scope */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Authenticated Session</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60">
              Role: {primaryRole}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, {user?.name || 'Officer'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            BEL Enterprise Decentralized Identity & Digital Asset Platform — Operational Node
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/verify"
            className="py-2 px-3 bg-[#1A2744] hover:bg-[#1E3A5F] text-slate-200 border border-[#1E3A5F] rounded-lg text-xs font-medium transition-all"
          >
            Public Verifier
          </Link>
          <Link
            href="/credentials/issue"
            className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Issue Credential
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-slate-100 font-mono">{s.value}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Column: Quick Operations & Governance / Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Navigation & Org Units */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Organizational Overview</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] flex justify-between items-center">
                <span className="text-slate-300 font-medium">Bangalore Unit (Defence)</span>
                <span className="font-mono text-cyan-400 text-[11px]">4 SBUs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] flex justify-between items-center">
                <span className="text-slate-300 font-medium">Hyderabad Unit (Defence)</span>
                <span className="font-mono text-cyan-400 text-[11px]">1 SBU</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] flex justify-between items-center">
                <span className="text-slate-300 font-medium">Pune Unit (Non-Defence)</span>
                <span className="font-mono text-cyan-400 text-[11px]">1 SBU</span>
              </div>
            </div>
            <Link
              href="/organizations"
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium pt-1"
            >
              <span>Explore Organizational Scope Tree</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Active Governance</span>
            </h3>
            <div className="space-y-2 text-xs">
              {proposals.length === 0 ? (
                <p className="text-slate-500 text-xs py-2">No pending multisig proposals.</p>
              ) : (
                proposals.slice(0, 2).map((p: any) => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-[#1A2744]/40 border border-[#1E3A5F] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200 truncate max-w-[180px]">{p.title}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <span className="text-[10px] text-slate-400 block">{p.actionType}</span>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/governance"
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium pt-1"
            >
              <span>Open Governance Council</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Live Audit Trail & Ledger Anchors */}
        <div className="lg:col-span-2 bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">Tamper-Evident Ledger Audit Trail</h3>
            </div>
            <Link
              href="/audit"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Full Audit Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <AuditTimeline events={auditEvents} maxItems={6} />
        </div>
      </div>
    </div>
  );
}
