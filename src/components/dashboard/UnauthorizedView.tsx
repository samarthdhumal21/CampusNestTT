import React from 'react';
import { ShieldAlert, ArrowLeft, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface UnauthorizedViewProps {
  requiredRole: UserRole;
  onGoHome: () => void;
  onGoUserDashboard: () => void;
  onOpenSignIn: () => void;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  requiredRole,
  onGoHome,
  onGoUserDashboard,
  onOpenSignIn
}) => {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-[28px] p-8 sm:p-12 border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-navy-950 font-serif mb-2">
          You don't have access to this page
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {user ? (
            <>
              You are signed in as a <strong className="text-navy-900 capitalize">{user.role}</strong>. This dashboard is restricted to accounts with the <strong className="text-navy-900 capitalize">{requiredRole}</strong> role.
            </>
          ) : (
            <>
              You need to sign in with an authorized <strong className="text-navy-900 capitalize">{requiredRole}</strong> account to access this dashboard.
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          {user ? (
            <button
              type="button"
              onClick={onGoUserDashboard}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Go to My Dashboard ({user.role})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSignIn}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
