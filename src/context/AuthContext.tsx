import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithGoogle as authSignInWithGoogle, 
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  sendPasswordReset as authSendPasswordReset,
  sendUserEmailVerification,
  signOutUser, 
  getUserProfile, 
  createUserProfile, 
  updateOwnerProfileType,
  onAuthChange 
} from '../services/auth';
import { isFirebaseConfigured } from '../services/firebase';
import type { UserProfile, UserRole, OwnerType, OwnerStatus } from '../types';

export const isDemoLoginEnabled = import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  demoRole: string | null;
  authError: string | null;
  clearAuthError: () => void;
  emailNeedsVerification: boolean;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  checkEmailVerified: () => Promise<boolean>;
  verificationCooldown: number;
  signIn: (preselectedRole?: { role: 'student' | 'owner'; ownerType: OwnerType | null }) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    name: string, 
    email: string, 
    pass: string, 
    role: 'student' | 'owner', 
    ownerType: OwnerType | null
  ) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  showRoleModal: boolean;
  chooseRole: (role: 'student' | 'owner', ownerType: OwnerType | null) => Promise<void>;
  pendingFirebaseUser: FirebaseUser | null;
  showMigrationModal: boolean;
  completeMigration: (ownerType: OwnerType) => Promise<void>;
  signedOutNotice: string | null;
  clearSignedOutNotice: () => void;
  simulateRole: (role: UserRole | null, ownerType?: OwnerType | null) => void;
  intendedPath: string | null;
  setIntendedPath: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<FirebaseUser | null>(null);
  const [showMigrationModal, setShowMigrationModal] = useState<boolean>(false);
  const [signedOutNotice, setSignedOutNotice] = useState<string | null>(null);
  const [intendedPath, setIntendedPath] = useState<string | null>(null);
  const [verificationCooldown, setVerificationCooldown] = useState<number>(0);

  // Verification cooldown timer
  useEffect(() => {
    if (verificationCooldown <= 0) return;
    const interval = setInterval(() => {
      setVerificationCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [verificationCooldown]);

  // Restore simulated/demo user from sessionStorage if enabled
  useEffect(() => {
    if (isDemoLoginEnabled) {
      const savedDemo = sessionStorage.getItem('campusnest_demo_user');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo) as UserProfile;
          setUser(parsed);
          setIsDemoMode(true);
          setDemoRole(parsed.role === 'owner' ? `${parsed.ownerType || 'pg'} owner` : parsed.role);
          setLoading(false);
          return;
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Subscribe to real Firebase Auth when configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      if (!isDemoMode) {
        setLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthChange(async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
            setShowRoleModal(false);
            setPendingFirebaseUser(null);

            // PART 1 Migration check: if owner has no ownerType
            if (profile.role === 'owner' && !profile.ownerType) {
              setShowMigrationModal(true);
            } else {
              setShowMigrationModal(false);
            }
          } else {
            // New user without profile
            setPendingFirebaseUser(fbUser);
            setShowRoleModal(true);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setAuthError('Could not load user profile. Please try refreshing.');
        }
      } else {
        if (!isDemoMode) {
          setFirebaseUser(null);
          setUser(null);
          setShowRoleModal(false);
          setPendingFirebaseUser(null);
          setShowMigrationModal(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // Google sign in with role handling
  const signIn = async (preselectedRole?: { role: 'student' | 'owner'; ownerType: OwnerType | null }) => {
    setAuthError(null);
    setSignedOutNotice(null);

    if (!isFirebaseConfigured) {
      setAuthError('Sign-in is available once Firebase is configured with your API keys.');
      return { success: false, error: 'Firebase not configured' };
    }

    setLoading(true);
    const result = await authSignInWithGoogle();
    if (!result.success) {
      setLoading(false);
      if (!result.isCancelled) {
        setAuthError(result.error || 'Failed to sign in with Google.');
      }
      return { success: false, error: result.error };
    }

    if (result.data) {
      const fbUser = result.data;
      setFirebaseUser(fbUser);
      const existingProfile = await getUserProfile(fbUser.uid);

      if (existingProfile) {
        setUser(existingProfile);
        setShowRoleModal(false);
        if (existingProfile.role === 'owner' && !existingProfile.ownerType) {
          setShowMigrationModal(true);
        }
        setLoading(false);
        return { success: true, isNewUser: false };
      } else {
        // If a role was preselected on Create Account tab, create profile directly
        if (preselectedRole) {
          try {
            const newProfile = await createUserProfile(
              fbUser,
              preselectedRole.role,
              preselectedRole.ownerType,
              preselectedRole.role === 'owner' ? 'pending' : 'none'
            );
            setUser(newProfile);
            setShowRoleModal(false);
            setLoading(false);
            return { success: true, isNewUser: true };
          } catch (e) {
            console.error('Error creating profile for Google user:', e);
          }
        }
        // Otherwise prompt role selection modal
        setPendingFirebaseUser(fbUser);
        setShowRoleModal(true);
        setLoading(false);
        return { success: true, isNewUser: true };
      }
    }

    setLoading(false);
    return { success: false };
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setSignedOutNotice(null);
    setLoading(true);

    const result = await authSignInWithEmail(email, pass);
    if (!result.success) {
      setLoading(false);
      setAuthError(result.error || 'Failed to sign in.');
      return { success: false, error: result.error };
    }

    if (result.data) {
      const fbUser = result.data;
      setFirebaseUser(fbUser);
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        setUser(profile);
        if (profile.role === 'owner' && !profile.ownerType) {
          setShowMigrationModal(true);
        }
      } else {
        // Half-created account recovery: user has auth but no profile document
        setPendingFirebaseUser(fbUser);
        setShowRoleModal(true);
      }
    }

    setLoading(false);
    return { success: true };
  };

  const signUpWithEmail = async (
    name: string, 
    email: string, 
    pass: string, 
    role: 'student' | 'owner', 
    ownerType: OwnerType | null
  ) => {
    setAuthError(null);
    setSignedOutNotice(null);
    setLoading(true);

    const result = await authSignUpWithEmail(name, email, pass, role, ownerType);
    if (!result.success) {
      setLoading(false);
      setAuthError(result.error || 'Failed to create account.');
      return { success: false, error: result.error };
    }

    if (result.data) {
      setUser(result.data);
    }

    setLoading(false);
    return { success: true };
  };

  const resendVerificationEmail = async () => {
    if (!firebaseUser) return { success: false, error: 'No user signed in' };
    if (verificationCooldown > 0) {
      return { success: false, error: `Please wait ${verificationCooldown}s before resending.` };
    }

    const res = await sendUserEmailVerification(firebaseUser);
    if (res.success) {
      setVerificationCooldown(60);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    if (!firebaseUser) return false;
    try {
      await firebaseUser.reload();
      return !!firebaseUser.emailVerified;
    } catch {
      return false;
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    const result = await authSendPasswordReset(email);
    if (!result.success) {
      setAuthError(result.error || 'Failed to send password reset email.');
      return { success: false, error: result.error };
    }
    return { success: true };
  };

  const chooseRole = async (role: 'student' | 'owner', ownerType: OwnerType | null) => {
    if (!pendingFirebaseUser) return;
    setLoading(true);
    try {
      const ownerStatus: OwnerStatus = role === 'owner' ? 'pending' : 'none';
      const profile = await createUserProfile(pendingFirebaseUser, role, ownerType, ownerStatus);
      setUser(profile);
      setShowRoleModal(false);
      setPendingFirebaseUser(null);
    } catch (err) {
      console.error('Failed to create user profile:', err);
      setAuthError('Could not complete role setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeMigration = async (ownerType: OwnerType) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await updateOwnerProfileType(user.uid, ownerType);
      if (res.success) {
        setUser({ ...user, ownerType });
        setShowMigrationModal(false);
      } else {
        setAuthError(res.error || 'Failed to save owner type.');
      }
    } catch (err) {
      console.error('Migration error:', err);
      setAuthError('Could not update profile type. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isDemoMode) {
      setIsDemoMode(false);
      setDemoRole(null);
      sessionStorage.removeItem('campusnest_demo_user');
    } else {
      await signOutUser();
    }
    setUser(null);
    setFirebaseUser(null);
    setSignedOutNotice('You have been signed out.');
    setLoading(false);
  };

  // Safe in-memory demo login conditional on VITE_ENABLE_DEMO_LOGIN
  const simulateRole = (role: UserRole | null, ownerType?: OwnerType | null) => {
    if (!role) {
      setUser(null);
      setIsDemoMode(false);
      setDemoRole(null);
      sessionStorage.removeItem('campusnest_demo_user');
      setSignedOutNotice('You have been signed out.');
      return;
    }

    const type = role === 'owner' ? (ownerType || 'pg') : null;
    let name = 'Kolhapur Student';
    if (role === 'admin') name = 'CampusNest Admin';
    else if (role === 'owner') {
      if (type === 'pg') name = 'Sanjay Kadam (PG Owner)';
      else if (type === 'hostel') name = 'Vijay Shinde (Hostel Owner)';
      else name = 'Sunita Bhosale (Mess Owner)';
    }

    const mockProfile: UserProfile = {
      uid: `demo-${role}-${type || 'user'}`,
      displayName: name,
      email: `${role}.${type || 'user'}.demo@kolhapur.edu`,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=1e3a8a&textColor=ffffff`,
      role,
      ownerType: type,
      ownerStatus: role === 'owner' ? 'approved' : 'none',
      createdAt: new Date().toISOString()
    };

    setUser(mockProfile);
    setIsDemoMode(true);
    setDemoRole(role === 'owner' ? `${type?.toUpperCase()} Owner` : role.charAt(0).toUpperCase() + role.slice(1));
    sessionStorage.setItem('campusnest_demo_user', JSON.stringify(mockProfile));
    setSignedOutNotice(null);
  };

  const clearAuthError = () => setAuthError(null);
  const clearSignedOutNotice = () => setSignedOutNotice(null);

  const emailNeedsVerification = Boolean(
    firebaseUser && 
    !firebaseUser.emailVerified && 
    !isDemoMode && 
    isFirebaseConfigured
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isConfigured: isFirebaseConfigured,
        isDemoMode,
        demoRole,
        authError,
        clearAuthError,
        emailNeedsVerification,
        resendVerificationEmail,
        checkEmailVerified,
        verificationCooldown,
        signIn,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
        showRoleModal,
        chooseRole,
        pendingFirebaseUser,
        showMigrationModal,
        completeMigration,
        signedOutNotice,
        clearSignedOutNotice,
        simulateRole,
        intendedPath,
        setIntendedPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
