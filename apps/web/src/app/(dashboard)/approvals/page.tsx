"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const mockApprovals = [
    { id: 'REQ-901', type: 'Role Assignment', subject: 'John Doe', requestedBy: 'HR Admin', date: '2 hours ago', status: 'PENDING' },
    { id: 'REQ-902', type: 'Credential Issuance', subject: 'Vendor A', requestedBy: 'Procurement', date: '5 hours ago', status: 'PENDING' },
    { id: 'REQ-903', type: 'Asset Transfer', subject: 'L7 Laptop', requestedBy: 'IT Dept', date: '1 day ago', status: 'PENDING' },
  ];

  const handleApprove = (id: string) => {
    toast.success(`Request ${id} approved`);
  };

  const handleReject = (id: string) => {
    toast.error(`Request ${id} rejected`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Pending Approvals</h1>
        <p className="text-slate-400 mt-1">Review and sign off on pending system actions</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockApprovals.map((req) => (
          <Card key={req.id}>
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-status-pending/10 flex items-center justify-center text-status-pending shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-white">{req.type}</h3>
                    <Badge variant="warning">Action Required</Badge>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Subject: <span className="text-slate-300 font-medium">{req.subject}</span> • 
                    Requested by <span className="text-slate-300">{req.requestedBy}</span> • {req.date}
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-2">Request ID: {req.id}</p>
                </div>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none text-status-revoked border-status-revoked/30 hover:bg-status-revoked/10 hover:text-status-revoked" onClick={() => handleReject(req.id)}>
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button className="flex-1 sm:flex-none bg-status-active text-enterprise-bg hover:bg-status-active/90" onClick={() => handleApprove(req.id)}>
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {mockApprovals.length === 0 && (
          <Card className="bg-enterprise-surface/30 border-dashed">
            <CardContent className="p-12 text-center">
              <Check className="w-12 h-12 text-status-active/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-300">All Caught Up</h3>
              <p className="text-slate-500 mt-2">There are no pending approvals requiring your attention.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
