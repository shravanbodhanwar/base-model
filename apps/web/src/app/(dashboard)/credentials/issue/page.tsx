'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Shield, User, ArrowLeft, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const CREDENTIAL_TYPES = [
  { id: 'EmployeeIdentityCredential', name: 'Employee Identity Credential', desc: 'Standard organizational employment credential' },
  { id: 'DepartmentMembershipCredential', name: 'Department/SBU Membership', desc: 'SBU and Unit authorized placement' },
  { id: 'RoleCredential', name: 'Role Credential', desc: 'Cryptographic RBAC authority credential' },
  { id: 'SecurityClearanceCredential', name: 'Security & Clearance Credential', desc: 'Confidential defence project access badge' },
  { id: 'TrainingCertificationCredential', name: 'Training Certification', desc: 'Technical qualification or achievement certificate' },
  { id: 'ProjectMembershipCredential', name: 'Project Membership Credential', desc: 'R&D defence project authorized access' },
  { id: 'VendorRegistrationCredential', name: 'Vendor Registration Credential', desc: 'Verified external supplier identity' },
  { id: 'SupplierQualificationCredential', name: 'Supplier Qualification Credential', desc: 'Procurement QA and clearance certification' },
];

export default function IssueCredentialPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(CREDENTIAL_TYPES[0].id);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [claimsText, setClaimsText] = useState(
    JSON.stringify({ department: 'Military Radars SBU', clearanceLevel: 'SECRET', validUntil: '2027-12-31' }, null, 2)
  );

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.users.getUsers();
      return res?.data || res || [];
    }
  });

  const issueMutation = useMutation({
    mutationFn: async (payload: any) => apiClient.credentials.issueCredential(payload),
    onSuccess: (data: any) => {
      toast.success('Verifiable Credential issued and anchored to blockchain');
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      router.push(`/credentials/${data?.data?.id || data?.id || ''}`);
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Failed to issue credential'));
    }
  });

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error('Please select a subject employee/vendor');
      return;
    }

    let parsedClaims = {};
    try {
      parsedClaims = JSON.parse(claimsText);
    } catch (error) {
      const detail = error instanceof Error ? error.message.replace(/^.*?: /, '') : '';
      toast.error(`Claims must be valid JSON${detail ? `: ${detail}` : ''}`);
      return;
    }

    if (!parsedClaims || Array.isArray(parsedClaims) || typeof parsedClaims !== 'object') {
      toast.error('Claims must be a JSON object, for example { "department": "Military Radars SBU" }');
      return;
    }

    const selectedUser = users.find((u: any) => u.id === selectedSubjectId);
    const subjectDID = selectedUser?.dids?.[0]?.did || `did:bel:employee:${selectedUser?.employeeId || selectedSubjectId}`;

    issueMutation.mutate({
      type: selectedType,
      subjectId: selectedSubjectId,
      subjectDID,
      claims: parsedClaims
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/credentials"
          className="p-2 rounded-lg bg-[#0D1B2A] border border-[#1E3A5F] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-400" />
            <span>Issue Verifiable Credential</span>
          </h1>
          <p className="text-sm text-slate-400">
            W3C Verifiable Credential generation with Ed25519 proof and permissioned ledger status anchor
          </p>
        </div>
      </div>

      <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-8 shadow-2xl space-y-8">
        <form onSubmit={handleIssue} className="space-y-6">
          {/* Step 1: Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              1. Select Credential Schema
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CREDENTIAL_TYPES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedType === t.id ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40' : 'bg-[#1A2744]/40 border-[#1E3A5F] hover:border-slate-600'}`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">{t.name}</h4>
                    {selectedType === t.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Select Credential Subject (Holder)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              required
              className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Employee / Subject --</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — Emp ID: {u.employeeId || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Claims */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. Private Credential Claims (Off-Chain JSON)
              </label>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" /> Encrypted & Off-Chain
              </span>
            </div>
            <textarea
              value={claimsText}
              onChange={(e) => setClaimsText(e.target.value)}
              rows={6}
              className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              * Important Architectural Guarantee: These claims stay off-chain in DB. Only the SHA-256 hash will be recorded on the blockchain.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1E3A5F] flex items-center justify-end gap-4">
            <Link
              href="/credentials"
              className="py-2 px-4 rounded-lg bg-transparent text-slate-400 hover:text-slate-200 text-xs font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={issueMutation.isPending}
              className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {issueMutation.isPending ? 'Cryptographically Signing...' : 'Sign & Issue Verifiable Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
