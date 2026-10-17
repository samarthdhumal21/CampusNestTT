import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  GraduationCap, 
  Home, 
  Building2, 
  UtensilsCrossed, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  LogOut, 
  LayoutDashboard,
  MailCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth, isDemoLoginEnabled } from '../../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { OwnerType, UserRole } from '../../types';

export type RoleCardId = 'student' | 'pg' | 'hostel' | 'mess';

interface RoleOption {
  id: RoleCardId;
  role: 'student' | 'owner';
  ownerType: OwnerType | null;
  ownerStatus: 'none' | 'pending';
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'student',
    role: 'student',
    ownerType: null,
    ownerStatus: 'none',
    title: 'Student',
    desc: 'Find stays and messes, save your shortlist',
    icon: GraduationCap
  },
  {
    id: 'pg',
    role: 'owner',
    ownerType: 'pg',
    ownerStatus: 'pending',
    title: 'PG Owner',
    desc: 'List & manage paying guest rooms',
    icon: Home
  },
  {
    id: 'hostel',
    role: 'owner',
    ownerType: 'hostel',
    ownerStatus: 'pending',
    title: 'Hostel Owner',
    desc: 'List & manage private student hostels',
    icon: Building2
  },
  {
    id: 'mess',
    role: 'owner',
    ownerType: 'mess',
    ownerStatus: 'pending',
    title: 'Mess Owner',
    desc: 'List & manage student dining & tiffin',
    icon: UtensilsCrossed
  }
];

interface AuthFormProps {
  variant?: 'modal' | 'card' | 'page';
  defaultTab?: 'signin' | 'signup';
  onSuccess?: (targetPath?: string) => void;
  onNavigateDashboard?: (targetPath?: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  variant = 'card',
  defaultTab = 'signin',
  onSuccess,
  onNavigateDashboard
}) => {
  const { 
    user, 
    firebaseUser,
    signIn, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset, 
    signOut, 
    loading, 
    isConfigured, 
    authError, 
    clearAuthError,
    emailNeedsVerification,
    resendVerificationEmail,
    checkEmailVerified,
    verificationCooldown,
    simulateRole,
    intendedPath,
    setIntendedPath
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultTab);
  const [selectedRoleCard, setSelectedRoleCard] = useState<RoleCardId>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isVerifyingRefresh, setIsVerifyingRefresh] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to determine route after sign in
  const getDestinationForUser = (role: UserRole): string => {
    if (intendedPath) {
      const p = intendedPath;
      setIntendedPath(null);
      return p;
    }
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'owner') return '/dashboard/owner';
    return '/dashboard/student';
  };

  // 1. If signed in and rendered as a card/page (and not waiting for email verification)
  if (user && !emailNeedsVerification && variant !== 'modal') {
    const dest = getDestinationForUser(user.role);
    return (
      <div className="auth-signed-in-card" role="region" aria-label="Signed-in Session">
        <div className="auth-avatar-header">
          <img
            src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`}
            alt={user.displayName}
            className="auth-signed-in-avatar"
          />
          <div>
            <div className="auth-signed-in-greeting">Welcome back,</div>
            <h3 className="auth-signed-in-name">{user.displayName}</h3>
            <span className={`auth-role-pill role-${user.role}`}>
              {user.role === 'owner' 
                ? `${user.ownerType ? user.ownerType.toUpperCase() + ' ' : ''}Owner (${user.ownerStatus})`
                : user.role}
            </span>
          </div>
        </div>

        <p className="auth-signed-in-desc">
          Your CampusNest session is active. Access your living cost calculations, saved shortlist, or listing portal.
        </p>

        <div className="auth-signed-in-actions">
          <button
            type="button"
            onClick={() => {
              if (onNavigateDashboard) onNavigateDashboard(dest);
              else if (onSuccess) onSuccess(dest);
            }}
            className="auth-btn-primary"
          >
            <LayoutDashboard size={16} />
            <span>Go to My Dashboard</span>
          </button>

          <button
            type="button"
            onClick={signOut}
            className="auth-btn-secondary"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Email verification screen
  if (emailNeedsVerification) {
    const handleCheckVerification = async () => {
      setIsVerifyingRefresh(true);
      clearAuthError();
      const verified = await checkEmailVerified();
      setIsVerifyingRefresh(false);
      if (verified && user) {
        setSuccessMessage('Email verified successfully! Redirecting...');
        const dest = getDestinationForUser(user.role);
        if (onSuccess) onSuccess(dest);
        else if (onNavigateDashboard) onNavigateDashboard(dest);
      } else {
        setValidationError('Email not verified yet. Please check your inbox and click the verification link.');
      }
    };

    const handleResend = async () => {
      clearAuthError();
      setValidationError(null);
      const res = await resendVerificationEmail();
      if (res.success) {
        setSuccessMessage('Verification email resent! Please check your inbox and spam folder.');
      } else {
        setValidationError(res.error || 'Could not resend email.');
      }
    };

    return (
      <div className={`auth-form-container ${variant === 'card' ? 'is-card' : variant === 'page' ? 'is-page' : 'is-modal'}`}>
        <div className="auth-top-portal-pill">
          <span>CampusNest Kolhapur Student Portal</span>
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-navy-800 mx-auto flex items-center justify-center mb-3">
            <MailCheck className="w-7 h-7 text-navy-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-950 font-serif">
            Verify Your Email Address
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
            We sent a verification link to <strong className="text-navy-900">{firebaseUser?.email}</strong>. 
            Email verification is required before saving data or adding listings.
          </p>
        </div>

        {validationError && (
          <div className="auth-alert-box error" role="alert">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert-box success" role="status">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-3 mt-6">
          <button
            type="button"
            onClick={handleCheckVerification}
            disabled={isVerifyingRefresh}
            className="auth-submit-btn"
          >
            {isVerifyingRefresh ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={16} className="animate-spin" />
                <span>Checking verification status...</span>
              </span>
            ) : (
              <span>I've verified my email</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={verificationCooldown > 0}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-navy-950 rounded-full text-xs font-semibold transition disabled:opacity-50"
          >
            {verificationCooldown > 0 
              ? `Resend email (${verificationCooldown}s)` 
              : 'Resend verification email'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={signOut}
              className="text-xs text-slate-500 hover:text-navy-800 transition"
            >
              Sign out / Use another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    clearAuthError();
    setValidationError(null);
    setSuccessMessage(null);
    setMode(newMode);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setValidationError(null);
    setSuccessMessage(null);

    if (!isConfigured) return;

    // Strict validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsSubmitting(true);
      await sendPasswordReset(trimmedEmail);
      setIsSubmitting(false);
      // As requested: For "Forgot password?" always answer "If an account exists, we sent a reset email."
      setSuccessMessage('If an account exists, we sent a reset email.');
      return;
    }

    // Password validation: strictly at least 8 characters
    if (!password || password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }

    if (mode === 'signup') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 60) {
        setValidationError('Full name must be between 2 and 60 characters.');
        return;
      }

      const selectedOption = ROLE_OPTIONS.find(o => o.id === selectedRoleCard) || ROLE_OPTIONS[0];

      setIsSubmitting(true);
      const res = await signUpWithEmail(
        trimmedName,
        trimmedEmail,
        password,
        selectedOption.role,
        selectedOption.ownerType
      );
      setIsSubmitting(false);

      if (res.success && res.data) {
        setSuccessMessage('Account created! A verification link was sent to your email.');
        const dest = getDestinationForUser(res.data.role);
        if (onSuccess) onSuccess(dest);
      }
    } else {
      setIsSubmitting(true);
      const res = await signInWithEmail(trimmedEmail, password);
      setIsSubmitting(false);

      if (res.success) {
        if (onSuccess) {
          onSuccess();
        }
      }
    }
  };

  const handleGoogleClick = async () => {
    clearAuthError();
    setValidationError(null);

    const selectedOption = ROLE_OPTIONS.find(o => o.id === selectedRoleCard) || ROLE_OPTIONS[0];
    const preselect = mode === 'signup' ? {
      role: selectedOption.role,
      ownerType: selectedOption.ownerType
    } : undefined;

    const res = await signIn(preselect);
    if (res.success && onSuccess) {
      onSuccess();
    }
  };

  const handleDemoLogin = (role: UserRole, ownerType?: OwnerType | null) => {
    simulateRole(role, ownerType);
    const dest = role === 'admin' 
      ? '/dashboard/admin' 
      : role === 'owner' 
      ? '/dashboard/owner' 
      : '/dashboard/student';
    if (onSuccess) onSuccess(dest);
    else if (onNavigateDashboard) onNavigateDashboard(dest);
  };

  return (
    <div className={`auth-form-container ${variant === 'card' ? 'is-card' : variant === 'page' ? 'is-page' : 'is-modal'}`}>
      {/* Top Small Portal Pill as requested */}
      <div className="auth-top-portal-pill">
        <span>CampusNest Kolhapur Student Portal</span>
      </div>

      {/* Heading Group */}
      <div className="auth-form-header">
        <h2 className="auth-form-title">
          {mode === 'signin' && 'Welcome Back to CampusNest'}
          {mode === 'signup' && 'Create Your CampusNest Account'}
          {mode === 'forgot' && 'Reset Your Password'}
        </h2>
        <p className="auth-form-subtitle">
          {mode === 'signin' && 'Sign in to save your shortlist and compare stays.'}
          {mode === 'signup' && 'Join thousands of students and verified owners in Kolhapur.'}
          {mode === 'forgot' && 'Enter your registered email and we will send a reset link.'}
        </p>
      </div>

      {/* Segmented Tab Control: Sign In | Create Account */}
      {mode !== 'forgot' && (
        <div 
          className="auth-segmented-tabs" 
          role="tablist" 
          aria-label="Authentication Options"
        >
          <button
            type="button"
            role="tab"
            id="tab-signin"
            aria-selected={mode === 'signin'}
            aria-controls="panel-signin"
            className={`auth-segmented-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => handleToggleMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            id="tab-signup"
            aria-selected={mode === 'signup'}
            aria-controls="panel-signup"
            className={`auth-segmented-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => handleToggleMode('signup')}
          >
            Create Account
          </button>
        </div>
      )}

      {/* Unconfigured Firebase Alert Box */}
      {!isConfigured && (
        <div className="firebase-notice-box" role="alert">
          <Info className="firebase-notice-icon" size={18} />
          <div>
            <span className="firebase-notice-title">Firebase Configuration Required</span>
            <span className="firebase-notice-desc">
              Sign-in turns on once Firebase is configured with your project API keys in <code className="auth-code-pill">.env</code>.
            </span>
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="auth-alert-box error" role="alert">
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Firebase Auth Error Message */}
      {authError && (
        <div className="auth-alert-box error" role="alert">
          <AlertCircle size={16} />
          <span>{authError}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="auth-alert-box success" role="status">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Authentication Form */}
      <form 
        onSubmit={handleFormSubmit} 
        className="auth-main-form" 
        noValidate
        aria-labelledby={mode === 'signin' ? 'tab-signin' : 'tab-signup'}
      >
        {/* Full Name for Signup only */}
        {mode === 'signup' && (
          <div className="auth-input-group">
            <label className="auth-label" htmlFor={`auth-name-${variant}`}>
              Full Name *
            </label>
            <input
              id={`auth-name-${variant}`}
              type="text"
              name="name"
              autoComplete="name"
              disabled={!isConfigured || loading || isSubmitting}
              placeholder="e.g. Tanvi Patil"
              value={name}
              onChange={e => setName(e.target.value)}
              className="auth-input"
              minLength={2}
              maxLength={60}
              required
            />
          </div>
        )}

        {/* Email Address */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor={`auth-email-${variant}`}>
            Email Address *
          </label>
          <input
            id={`auth-email-${variant}`}
            type="email"
            name="email"
            autoComplete="email"
            disabled={!isConfigured || loading || isSubmitting}
            placeholder="e.g. student@kolhapur.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        {/* Password */}
        {mode !== 'forgot' && (
          <div className="auth-input-group">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor={`auth-pass-${variant}`}>
                Password *
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => handleToggleMode('forgot')}
                  className="auth-inline-link"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="auth-password-wrapper">
              <input
                id={`auth-pass-${variant}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                disabled={!isConfigured || loading || isSubmitting}
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input password-input"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="auth-eye-btn"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Required helper line for password */}
            <span className="auth-helper-line">
              Must be at least 8 characters.
            </span>
          </div>
        )}

        {/* PART 3: ROLE SELECTION 2x2 GRID (Create Account Tab) */}
        {mode === 'signup' && (
          <div className="auth-role-section">
            <div className="auth-role-heading-row">
              <span className="auth-role-header-title">SELECT YOUR ROLE</span>
            </div>

            <div 
              role="radiogroup" 
              aria-label="Select your role"
              className="auth-role-grid"
            >
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = selectedRoleCard === opt.id;
                const IconComponent = opt.icon;
                return (
                  <label
                    key={opt.id}
                    className={`auth-role-card ${isSelected ? 'is-selected' : ''}`}
                    htmlFor={`role-radio-${opt.id}`}
                  >
                    <input
                      id={`role-radio-${opt.id}`}
                      type="radio"
                      name="accountRole"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setSelectedRoleCard(opt.id)}
                      disabled={!isConfigured || loading || isSubmitting}
                      className="auth-radio-native"
                    />

                    <div className="auth-role-card-header">
                      <div className={`auth-role-icon-box ${isSelected ? 'active' : ''}`}>
                        <IconComponent size={16} />
                      </div>
                      {isSelected && (
                        <span className="auth-role-check-badge" aria-hidden="true">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="auth-role-card-content">
                      <span className="auth-role-card-name">{opt.title}</span>
                      <span className="auth-role-card-desc">{opt.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Truthful Role Policy Disclaimer */}
            <p className="auth-role-notice">
              Your role is set when you register. Only an admin can change it later. Owner accounts need admin approval before listings go live.
            </p>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={!isConfigured || loading || isSubmitting}
          className="auth-submit-btn"
        >
          {loading || isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={15} className="animate-spin" />
              <span>Please wait...</span>
            </span>
          ) : mode === 'signin' ? (
            'Sign In'
          ) : mode === 'signup' ? (
            'Create Account'
          ) : (
            'Send reset email'
          )}
        </button>
      </form>

      {/* Forgot Password back link */}
      {mode === 'forgot' && (
        <div className="auth-switch-row">
          <button
            type="button"
            onClick={() => handleToggleMode('signin')}
            className="auth-text-link"
          >
            ← Back to Sign In
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="auth-divider">
        <span className="auth-divider-line" />
        <span className="auth-divider-text">or</span>
        <span className="auth-divider-line" />
      </div>

      {/* Official Google Sign-In Button */}
      <div className="auth-google-wrapper">
        <GoogleSignInButton
          onClick={handleGoogleClick}
          loading={loading || isSubmitting}
          isConfigured={isConfigured}
          text="Continue with Google"
        />
      </div>

      {/* PART 6: QUICK DEMO ACCOUNTS (Safe in-memory version conditional on VITE_ENABLE_DEMO_LOGIN) */}
      {isDemoLoginEnabled && (
        <div className="auth-demo-section">
          <div className="auth-demo-divider">
            <span>Quick demo accounts (one-click sign in)</span>
          </div>
          <div className="auth-demo-buttons-grid">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="auth-demo-btn"
              title="Sign in as demo Student"
            >
              <GraduationCap size={13} />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner', 'pg')}
              className="auth-demo-btn"
              title="Sign in as demo PG Owner"
            >
              <Home size={13} />
              <span>PG Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner', 'hostel')}
              className="auth-demo-btn"
              title="Sign in as demo Hostel Owner"
            >
              <Building2 size={13} />
              <span>Hostel Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner', 'mess')}
              className="auth-demo-btn"
              title="Sign in as demo Mess Owner"
            >
              <UtensilsCrossed size={13} />
              <span>Mess Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="auth-demo-btn admin-demo"
              title="Sign in as demo Admin"
            >
              <ShieldCheck size={13} />
              <span>Admin</span>
            </button>
          </div>
          <p className="auth-demo-disclaimer">
            Demo mode creates an in-memory mock session with sample data. Nothing is saved to Firebase.
          </p>
        </div>
      )}
    </div>
  );
};
