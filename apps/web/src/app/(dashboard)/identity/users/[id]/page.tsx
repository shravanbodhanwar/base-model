'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Shield, Award, Package, Key, Activity, Building2,
  Calendar, Mail, Phone, RefreshCw, CheckCircle, AlertTriangle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DIDCard } from '@/components/shared/DIDCard';
import { TrustGraph } from '@/components/shared/TrustGraph';
import { CredentialCard } from '@/components/shared/CredentialCard';
import { AssetCard } from '@/components/shared/AssetCard';
import { AuditTimeline } from '@/components/shared/AuditTimeline';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { QRModal } from '@/components/shared/QRModal';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'credentials' | 'assets' | 'audit'>('credentials');
  const [selectedQR, setSelectedQR] = useState<{ title: string; url: string; id: string } | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: async () => {
      const res = await apiClient.users.getUser(id as string);
      return res?.data || res;
    },
    enabled: !!id
  });

  const { data: userCredentials = [] } = useQuery({
    queryKey: ['user-credentials', id],
    queryFn: async () => {
      const res = await apiClient.credentials.getCredentials();
      const list = res?.data || res || [];
      return list.filter((c: any) => c.subjectId === id);
    },
    enabled: !!id
  });

  const { data: userAssets = [] } = useQuery({
    queryKey: ['user-assets', id],
    queryFn: async () => {
      const res = await apiClient.assets.getAssets();
      const list = res?.data || res || [];
      return list.filter((a: any) => a.ownerId === id || a.custodianId === id);
    },
    enabled: !!id
  });

  const { data: userActivity = [] } = useQuery({
    queryKey: ['user-activity', id],
    queryFn: async () => {
      const res = await apiClient.audit.getAuditEvents({ actorId: id });
      return res?.data || res || [];
    },
    enabled: !!id
  });

  const suspendMutation = useMutation({
    mutationFn: async () => apiClient.users.suspendUser(id as string),
    onSuccess: () => {
      toast.success('User account suspended');
      queryClient.invalidateQueries({ queryKey: ['user-detail', id] });
    }
  });

  const activateMutation = useMutation({
    mutationFn: async () => apiClient.users.activateUser(id as string),
    onSuccess: () => {
      toast.success('User account activated');
      queryClient.invalidateQueries({ queryKey: ['user-detail', id] });
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading identity and cryptographic profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-500">
        User profile not found.
      </div>
    );
  }

  const primaryRole = user.roleAssignments?.[0]?.role;
  const didRecord = user.dids?.[0];
  const userDID = didRecord?.did || `did:bel:employee:${user.employeeId || 'E-000'}`;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 border border-blue-400/40 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
            {user.name?.substring(0, 2).toUpperCase() || 'BE'}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{user.name}</h1>
              <StatusBadge status={user.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
              <span className="font-mono text-slate-300">Emp ID: {user.employeeId || 'N/A'}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
              {user.department && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {user.department}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => suspendMutation.mutate()}
              disabled={suspendMutation.isPending}
              className="py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-medium transition-all"
            >
              Suspend User
            </button>
          ) : (
            <button
              type="button"
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="py-1.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium transition-all"
            >
              Activate User
            </button>
          )}
        </div>
      </div>

      {/* Trust Graph Visualization */}
      <TrustGraph
        employeeName={user.name}
        employeeDID={userDID}
        unitName="Bangalore Unit (Defence)"
        sbuName={user.department || 'Military Radars SBU'}
        roleName={primaryRole?.displayName || primaryRole?.name || 'Officer'}
        permissions={primaryRole?.permissions || ['VIEW_OWN_DATA']}
      />

      {/* Decentralized Identity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <DIDCard
            did={userDID}
            status={didRecord?.status || user.status}
            publicKey={didRecord?.publicKeyHex || '0x4A8F2...91C3'}
            createdAt={user.createdAt}
            onRotate={() => toast.success('Key rotation initiated on-chain')}
          />
        </div>

        {/* Roles and Scoped Authorizations */}
        <div className="md:col-span-2 bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Role & Scope Assignments</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Scoped RBAC</span>
            </div>

            <div className="mt-4 space-y-3">
              {user.roleAssignments?.map((ra: any) => (
                <div key={ra.id} className="p-3.5 rounded-lg bg-[#1A2744]/70 border border-[#1E3A5F]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{ra.role?.displayName || ra.role?.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                      Scope: {ra.scopeType}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ra.role?.permissions?.map((p: string) => (
                      <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4">
            Organizational boundary enforced: Access is bound strictly to assigned Scope.
          </p>
        </div>
      </div>

      {/* Tabs: Credentials / Assets / Activity */}
      <div className="space-y-4">
        <div className="flex border-b border-[#1E3A5F] gap-6 text-sm">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'credentials' ? 'text-blue-400 border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
            <Award className="w-4 h-4" />
            <span>Verifiable Credentials ({userCredentials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'assets' ? 'text-cyan-400 border-cyan-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
            <Package className="w-4 h-4" />
            <span>Digital Assets in Custody ({userAssets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'audit' ? 'text-emerald-400 border-emerald-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        {activeTab === 'credentials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCredentials.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-xs text-slate-500 bg-[#0D1B2A] rounded-xl border border-[#1E3A5F]">
                No verifiable credentials issued to this subject.
              </div>
            ) : (
              userCredentials.map((c: any) => (
                <CredentialCard
                  key={c.id}
                  credential={c}
                  onShowQR={(cred) => setSelectedQR({
                    title: `Verify ${cred.type}`,
                    url: `${window.location.origin}/verify/credential/${cred.credentialId}`,
                    id: cred.credentialId
                  })}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAssets.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-xs text-slate-500 bg-[#0D1B2A] rounded-xl border border-[#1E3A5F]">
                No digital or physical assets in current custody.
              </div>
            ) : (
              userAssets.map((a: any) => (
                <AssetCard key={a.id} asset={a} />
              ))
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 shadow-xl">
            <AuditTimeline events={userActivity} />
          </div>
        )}
      </div>

      {selectedQR && (
        <QRModal
          isOpen={true}
          onClose={() => setSelectedQR(null)}
          title={selectedQR.title}
          url={selectedQR.url}
          entityId={selectedQR.id}
        />
      )}
    </div>
  );
}
