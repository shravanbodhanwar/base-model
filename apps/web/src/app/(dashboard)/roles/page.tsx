'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Key, Plus, Trash2, CheckCircle2, User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [scopeType, setScopeType] = useState('SBU');

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiClient.roles.getRoles();
      return res?.data || res || [];
    }
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['role-assignments'],
    queryFn: async () => {
      const res = await apiClient.roles.getRoleAssignments();
      return res?.data || res || [];
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.users.getUsers();
      return res?.data || res || [];
    }
  });

  const assignMutation = useMutation({
    mutationFn: async (payload: any) => apiClient.roles.assignRole(payload),
    onSuccess: () => {
      toast.success('Role assigned with organizational scope');
      setShowAssignModal(false);
      queryClient.invalidateQueries({ queryKey: ['role-assignments'] });
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Role assignment failed'));
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => apiClient.roles.revokeAssignment(id),
    onSuccess: () => {
      toast.success('Role assignment revoked');
      queryClient.invalidateQueries({ queryKey: ['role-assignments'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Scoped RBAC & Role Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enforced Role + Organizational Scope: Defence clearance and departmental segregation of duties
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAssignModal(true)}
          className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Scoped Role</span>
        </button>
      </div>

      <div className="flex border-b border-[#1E3A5F] gap-6 text-sm">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'roles' ? 'text-amber-400 border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
          <span>Defined System Roles ({roles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'assignments' ? 'text-amber-400 border-amber-500' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
          <span>Active Role Assignments ({assignments.length})</span>
        </button>
      </div>

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r: any) => (
            <div key={r.id} className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">{r.displayName || r.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A2744] text-amber-400 border border-[#1E3A5F]">
                  {r.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 min-h-[36px]">
                {r.description || 'Pre-configured defence enterprise security role with scoped authority.'}
              </p>
              <div className="pt-2 border-t border-[#1E3A5F]/50">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1.5">Granted Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {r.permissions?.map((p: string) => (
                    <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A2744] text-slate-400 border-b border-[#1E3A5F]">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role Name</th>
                <th className="py-3 px-4 font-semibold">Scope Level</th>
                <th className="py-3 px-4 font-semibold">Granted Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60 text-slate-300">
              {assignments.map((a: any) => (
                <tr key={a.id} className="hover:bg-[#1A2744]/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-200">
                    {a.user?.name || a.userId}
                    <span className="block text-[10px] text-slate-500">{a.user?.email}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-400">
                    {a.role?.displayName || a.role?.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/40 text-blue-300 border border-blue-800/40">
                      {a.scopeType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(a.grantedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => revokeMutation.mutate(a.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-all"
                      title="Revoke Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D1B2A] border border-[#1E3A5F] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Assign Role with Scope</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200"
                >
                  <option value="">-- Select User --</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">System Role</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200"
                >
                  <option value="">-- Select Role --</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.displayName || r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organizational Scope Level</label>
                <select
                  value={scopeType}
                  onChange={(e) => setScopeType(e.target.value)}
                  className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200"
                >
                  <option value="ENTERPRISE">ENTERPRISE (Company-wide)</option>
                  <option value="UNIT">UNIT (e.g. Bangalore Unit)</option>
                  <option value="SBU">SBU (e.g. Military Radars SBU)</option>
                  <option value="PROJECT">PROJECT (Specific Project)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="py-2 px-4 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => assignMutation.mutate({ userId: selectedUserId, roleId: selectedRoleId, scopeType })}
                disabled={assignMutation.isPending || !selectedUserId || !selectedRoleId}
                className="py-2 px-5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
