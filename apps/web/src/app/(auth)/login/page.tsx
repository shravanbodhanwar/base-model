'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

const DEMO_ACCOUNTS = [
  { email: 'root@bel-demo.in', role: 'ROOT_GOVERNANCE', desc: 'Root Governance Admin' },
  { email: 'admin@bel-demo.in', role: 'ENTERPRISE_ADMIN', desc: 'Enterprise Administrator' },
  { email: 'hr@bel-demo.in', role: 'HR_ADMIN', desc: 'HR Administrator' },
  { email: 'security@bel-demo.in', role: 'SECURITY_ADMIN', desc: 'Security & Compliance Admin' },
  { email: 'procurement@bel-demo.in', role: 'PROCUREMENT_ADMIN', desc: 'Procurement Administrator' },
  { email: 'sbuhead@bel-demo.in', role: 'SBU_HEAD', desc: 'SBU Head — Military Radars' },
  { email: 'manager@bel-demo.in', role: 'MANAGER', desc: 'Manager — Military Radars' },
  { email: 'employee@bel-demo.in', role: 'OFFICER', desc: 'Officer/Employee' },
  { email: 'intern@bel-demo.in', role: 'INTERN', desc: 'Intern — Software SBU' },
  { email: 'auditor@bel-demo.in', role: 'AUDITOR', desc: 'Auditor (Read-Only)' },
  { email: 'vendor@bel-demo.in', role: 'VENDOR', desc: 'External Vendor' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@bel-demo.in');
  const [password, setPassword] = useState('Demo@1234');
  const [showDemo, setShowDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Authentication successful');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || 'Login failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('Demo@1234');
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 mb-4 shadow-lg shadow-blue-500/25">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">BEL-EDIDAP</h1>
          <p className="text-slate-400 mt-1 text-sm">Enterprise Decentralized Identity & Digital Asset Platform</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-xs font-medium">PROTOTYPE SYSTEM</span>
          </div>
        </div>

        {/* Warning banner */}
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-3 mb-6 flex gap-3">
          <span className="text-amber-400 text-base mt-0.5">⚠</span>
          <div className="text-xs text-amber-300/90">
            <strong className="text-amber-400">SIMULATED DEMO DATA</strong> — This is a prototype system using BEL as organizational context.
            It does not represent real BEL employees, operations, or internal systems.
          </div>
        </div>

        {/* Login form */}
        <div className="bg-[#0D1B2A]/90 backdrop-blur-xl border border-[#1E3A5F] rounded-xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@bel-demo.in"
                className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg px-3.5 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1A2744] border border-[#1E3A5F] rounded-lg px-3.5 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In to Platform'
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-[#1E3A5F]">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-300 uppercase tracking-wider mb-3 transition-colors"
            >
              <span>Demo Accounts (all use: Demo@1234)</span>
              {showDemo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemo && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#1A2744] hover:bg-[#1E3A5F] border border-transparent hover:border-blue-500/30 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <div className="text-slate-300 text-xs font-medium group-hover:text-blue-300 transition-colors">
                        {acc.email}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{acc.desc}</div>
                    </div>
                    <span className="ml-3 px-2 py-0.5 bg-[#0D1B2A] rounded text-slate-400 font-mono text-[9px] whitespace-nowrap">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4">
          BEL-EDIDAP Prototype v1.0 · College Seminar Project · Not real BEL software
        </p>
      </div>
    </div>
  );
}
