import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UnauthorizedView } from './UnauthorizedView';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: ReactNode;
  onGoHome: () => void;
  onGoUserDashboard: () => void;
  onOpenSignIn: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  children,
  onGoHome,
  onGoUserDashboard,
  onOpenSignIn
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin w-8 h-8 border-3 border-navy-800 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Authenticating CampusNest session...</p>
      </div>
    );
  }

  // Not signed in: redirect to unauthorized view with sign-in prompt
  if (!user) {
    return (
      <UnauthorizedView
        requiredRole={requiredRole}
        onGoHome={onGoHome}
        onGoUserDashboard={onGoUserDashboard}
        onOpenSignIn={onOpenSignIn}
      />
    );
  }

  // Signed in, but role does not match
  if (user.role !== requiredRole) {
    return (
      <UnauthorizedView
        requiredRole={requiredRole}
        onGoHome={onGoHome}
        onGoUserDashboard={onGoUserDashboard}
        onOpenSignIn={onOpenSignIn}
      />
    );
  }

  // Role matches perfectly
  return <>{children}</>;
};
