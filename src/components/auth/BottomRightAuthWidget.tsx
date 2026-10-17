import React, { useState } from 'react';
import { User, Minus, Maximize2, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthForm } from './AuthForm';

interface BottomRightAuthWidgetProps {
  onNavigateDashboard?: () => void;
}

export const BottomRightAuthWidget: React.FC<BottomRightAuthWidgetProps> = ({
  onNavigateDashboard
}) => {
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);

  // If minimized, display a sleek pill button at bottom-right
  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="bottom-right-auth-pill"
        aria-label="Expand sign-in box"
      >
        {user ? (
          <>
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
              alt={user.displayName}
              className="bottom-right-pill-avatar"
            />
            <span className="bottom-right-pill-text">{user.displayName.split(' ')[0]}</span>
          </>
        ) : (
          <>
            <User size={15} className="bottom-right-pill-icon" />
            <span className="bottom-right-pill-text">Sign in</span>
          </>
        )}
        <Maximize2 size={13} className="bottom-right-pill-expand" />
      </button>
    );
  }

  return (
    <div 
      className="bottom-right-auth-card"
      role="region"
      aria-label="CampusNest Sign in"
    >
      {/* Top minimize button */}
      <div className="bottom-right-card-header">
        <span className="bottom-right-card-badge">CampusNest Access</span>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="bottom-right-minimize-btn"
          title="Minimize sign-in box"
          aria-label="Minimize sign-in box"
        >
          <Minus size={15} />
        </button>
      </div>

      {/* Main Auth Form */}
      <AuthForm
        variant="card"
        onNavigateDashboard={onNavigateDashboard}
      />
    </div>
  );
};
