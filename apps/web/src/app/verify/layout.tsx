export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-200">
      {children}
    </div>
  );
}
