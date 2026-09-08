'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Search, FileText, Package } from 'lucide-react';
import { Input } from '../../components/ui/input';

export default function VerifyLandingPage() {
  const [id, setId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    
    // Simple heuristic: if it contains 'asset' or resembles asset format, go there, else credential
    if (id.toLowerCase().includes('asset') || id.startsWith('AST-')) {
      router.push(`/verify/asset/${id}`);
    } else {
      router.push(`/verify/credential/${id}`);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0D1B2A]/90 backdrop-blur-xl border border-[#1E3A5F] rounded-xl shadow-2xl p-8 text-center">
        <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-200">BEL-EDIDAP Verifier</h1>
        <p className="text-sm text-slate-400 mt-2 mb-6">Public verification portal for Enterprise Credentials and Assets</p>
        
        <span className="inline-block px-3 py-1 mb-8 text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md uppercase tracking-wider">
          PROTOTYPE SYSTEM
        </span>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input 
            value={id} 
            onChange={(e) => setId(e.target.value)} 
            placeholder="Enter Credential ID or Asset ID" 
            className="flex-1 bg-[#1A2744]"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Verify
          </button>
        </form>

        <div className="grid grid-cols-2 gap-4 border-t border-[#1E3A5F] pt-8">
          <button 
            onClick={() => router.push('/verify/credential/CRED-EXAMPLE-123')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#1A2744] hover:bg-[#1E3A5F] transition-colors text-slate-300 text-sm border border-transparent hover:border-blue-500/30"
          >
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Example Credential</span>
          </button>
          <button 
            onClick={() => router.push('/verify/asset/AST-EXAMPLE-456')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#1A2744] hover:bg-[#1E3A5F] transition-colors text-slate-300 text-sm border border-transparent hover:border-purple-500/30"
          >
            <Package className="w-6 h-6 text-purple-400" />
            <span>Example Asset</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          Note: This verifier does not expose sensitive personal data. It only confirms the cryptographic validity and revocation status of issued items.
        </p>
      </div>
    </div>
  );
}
