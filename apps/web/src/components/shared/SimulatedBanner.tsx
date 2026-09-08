import * as React from "react"

export function SimulatedBanner() {
  return (
    <div className="bg-amber-900/20 border border-amber-700/50 text-amber-400 text-xs px-4 py-2 flex items-center gap-2 mb-6 rounded-md">
      <span>⚠</span>
      <span><strong>SIMULATED DEMO DATA</strong> — This is a prototype system. Data shown does not represent real BEL employees, operations, or internal systems.</span>
    </div>
  );
}
