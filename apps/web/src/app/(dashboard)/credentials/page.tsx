"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, FileBadge } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function CredentialsPage() {
  const { hasPermission } = useAuth();
  const canIssue = hasPermission('ISSUE_CREDENTIAL');

  const mockCredentials = [
    { id: 'vc-1', type: 'EmployeeCredential', subject: 'did:bel:emp-101', issuer: 'BEL Root', issued: '2023-10-01', status: 'ACTIVE' },
    { id: 'vc-2', type: 'RoleCredential', subject: 'did:bel:emp-101', issuer: 'BEL HR', issued: '2023-10-05', status: 'ACTIVE' },
    { id: 'vc-3', type: 'ClearanceCredential', subject: 'did:bel:emp-204', issuer: 'BEL Security', issued: '2022-05-12', status: 'REVOKED' },
    { id: 'vc-4', type: 'VendorQualification', subject: 'did:bel:ven-88', issuer: 'BEL Procurement', issued: '2024-01-20', status: 'ACTIVE' },
    { id: 'vc-5', type: 'TrainingCertificate', subject: 'did:bel:emp-333', issuer: 'BEL L&D', issued: '2023-11-30', status: 'ACTIVE' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Credentials Registry</h1>
          <p className="text-slate-400 mt-1">Manage and verify W3C Verifiable Credentials</p>
        </div>
        {canIssue && (
          <Link href="/credentials/issue">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Issue Credential</span>
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader className="border-b border-enterprise-surface2 pb-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search credentials by ID or DID..." 
                className="w-full bg-enterprise-bg border border-enterprise-surface2 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-enterprise-surface2 uppercase border-b border-enterprise-surface2">
                <tr>
                  <th className="px-6 py-4 font-medium">Credential ID</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Subject DID</th>
                  <th className="px-6 py-4 font-medium">Issuer</th>
                  <th className="px-6 py-4 font-medium">Issued Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-enterprise-surface2">
                {mockCredentials.map((cred) => (
                  <tr key={cred.id} className="hover:bg-enterprise-surface2/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-300">{cred.id}</td>
                    <td className="px-6 py-4 text-white flex items-center space-x-2">
                      <FileBadge className="w-4 h-4 text-accent-cyan" />
                      <span>{cred.type}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{cred.subject}</td>
                    <td className="px-6 py-4 text-slate-300">{cred.issuer}</td>
                    <td className="px-6 py-4 text-slate-400">{cred.issued}</td>
                    <td className="px-6 py-4">
                      <Badge variant={cred.status === 'ACTIVE' ? 'success' : 'destructive'}>
                        {cred.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/credentials/${cred.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
