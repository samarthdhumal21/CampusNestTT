import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Menu, 
  X, 
  Sparkles, 
  Compass, 
  Info, 
  Home, 
  User, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SignInModal } from './auth/SignInModal';
import type { UserRole } from '../types';

export type NavTabType = 'home' | 'find' | 'explore' | 'about' | 'auth' | 'dashboard-student' | 'dashboard-owner' | 'dashboard-admin';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  savedCompareCount: number;
  openCompareDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCompareCount,
  openCompareDrawer
}) => {
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (tab: NavTabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const getDashboardTabForRole = (role: UserRole): NavTabType => {
    if (role === 'admin') return 'dashboard-admin';
    if (role === 'owner') return 'dashboard-owner';
    return 'dashboard-student';
  };

  const handleDashboardClick = () => {
    if (!user) {
      setIsSignInModalOpen(true);
      return;
    }
    const tab = getDashboardTabForRole(user.role);
    handleNavClick(tab);
  };

  const handleSignOutClick = async () => {
    await signOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setActiveTab('home');
  };

  return (
    <>
      <div className="navbar-outer-wrapper">
        {/* Floating Glass Pill Navbar */}
        <nav className="glass-navbar">
          {/* Brand Logo */}
          <div 
            className="nav-brand-group" 
            onClick={() => handleNavClick('home')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNavClick('home'); }}
            aria-label="CampusNest Kolhapur Home"
          >
            <img
              src="/images/campusnest-logo.png"
              alt="CampusNest Kolhapur"
              className="nav-brand-logo-img"
            />
          </div>

          {/* Desktop Nav Links */}
          <div className="nav-center-pills">
            <button
              className={`nav-pill-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              Home
            </button>
            <button
              className={`nav-pill-btn ${activeTab === 'find' ? 'active' : ''}`}
              onClick={() => handleNavClick('find')}
            >
              Find My Stay
            </button>
            <button
              className={`nav-pill-btn ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => handleNavClick('explore')}
            >
              Explore
            </button>
            <button
              className={`nav-pill-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => handleNavClick('about')}
            >
              About & Data
            </button>
          </div>

          {/* Right Actions: Compare + Budget Matcher + Auth Dropdown / Sign-in */}
          <div className="nav-right-actions">
            {savedCompareCount > 0 && (
              <button
                className="pill-action-secondary"
                onClick={openCompareDrawer}
                title="Compare selected stays"
              >
                Compare ({savedCompareCount})
              </button>
            )}

            <button
              className="pill-action-primary"
              onClick={() => handleNavClick('find')}
            >
              <span>Budget Matcher</span>
              <span className="pill-icon-circle">
                <Sparkles size={13} />
              </span>
            </button>

            {/* AUTH STATE: SIGNED IN OR SIGNED OUT */}
            {user ? (
              /* Signed In User Avatar Dropdown */
              <div ref={dropdownRef} className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User profile and dashboard menu"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200/90 bg-white/90 hover:bg-white hover:border-navy-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-navy-200"
                >
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-xs font-semibold text-navy-950 hidden md:inline-block max-w-[90px] truncate">
                    {user.displayName.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 py-3 px-3 z-50 animate-scale-up text-left"
                  >
                    {/* User Header */}
                    <div className="px-2 pb-3 mb-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-navy-950 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'owner'
                            ? user.ownerStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-navy-800'
                        }`}>
                          {user.role} {user.role === 'owner' ? `(${user.ownerStatus})` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Dashboard Nav Link */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDashboardClick}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-navy-950 flex items-center gap-2.5 mb-1"
                    >
                      <LayoutDashboard size={15} className="text-navy-700" />
                      <span>My Dashboard</span>
                    </button>

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOutClick}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition text-xs font-semibold flex items-center gap-2.5"
                    >
                      <LogOut size={15} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Signed Out: Sign in Pill Button (Glass Style) */
              <button
                type="button"
                onClick={() => handleNavClick('auth')}
                className="pill-action-signin inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/90 bg-white/90 text-navy-950 hover:bg-white hover:border-navy-400 font-semibold text-xs shadow-sm hover:shadow transition-all"
                aria-label="Sign in"
              >
                <User size={14} className="text-navy-700" />
                <span>Sign in</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-glass-dropdown">
            {/* User Profile Summary in Mobile Menu if signed in */}
            {user ? (
              <div className="p-3 mb-2 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-bold text-navy-950 truncate">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-navy-800 uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDashboardClick}
                  className="mt-3 w-full py-2 bg-navy-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard size={14} />
                  <span>Open My Dashboard</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavClick('auth');
                }}
                className="w-full py-2.5 mb-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-navy-950 flex items-center justify-center gap-2 shadow-sm"
              >
                <User size={15} className="text-navy-700" />
                <span>Sign in</span>
              </button>
            )}

            <button
              className={`mobile-nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              <Home size={16} />
              <span>Home</span>
            </button>
            <button
              className={`mobile-nav-link ${activeTab === 'find' ? 'active' : ''}`}
              onClick={() => handleNavClick('find')}
            >
              <Sparkles size={16} />
              <span>Find My Stay (Matcher)</span>
            </button>
            <button
              className={`mobile-nav-link ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => handleNavClick('explore')}
            >
              <Compass size={16} />
              <span>Explore Accommodations & Messes</span>
            </button>
            <button
              className={`mobile-nav-link ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => handleNavClick('about')}
            >
              <Info size={16} />
              <span>About & Data Transparency</span>
            </button>

            {savedCompareCount > 0 && (
              <button
                className="mobile-nav-link"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCompareDrawer();
                }}
                style={{ color: '#d97706' }}
              >
                Compare Stays ({savedCompareCount})
              </button>
            )}

            {user && (
              <button
                type="button"
                className="mobile-nav-link text-rose-600 mt-2"
                onClick={handleSignOutClick}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sign-in Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
};
