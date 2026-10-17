import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, demoRole, signOut } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div 
      className="sticky top-0 z-[60] bg-amber-500 text-slate-950 font-semibold text-xs px-4 py-2 flex items-center justify-between shadow-md"
      role="banner"
      aria-label="Demo Mode Active"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1 justify-center">
        <AlertCircle size={15} className="text-slate-950 shrink-0" />
        <span>
          Demo mode: nothing is saved. (Active session: <span className="underline decoration-slate-950 font-bold">{demoRole || 'Demo User'}</span>)
        </span>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-full text-[11px] font-bold hover:bg-slate-800 transition shrink-0 ml-3"
      >
        <LogOut size={12} />
        <span>Exit Demo</span>
      </button>
    </div>
  );
};
