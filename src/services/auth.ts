import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import type { 
  UserProfile, 
  UserRole, 
  OwnerType,
  OwnerStatus, 
  OwnerListingSubmission, 
  OwnerListingStatus 
} from '../types';

export interface AuthActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  isCancelled?: boolean;
}

const LOCAL_STORAGE_USERS_KEY = 'campusnest_users_profiles';
const LOCAL_STORAGE_OWNER_LISTINGS_KEY = 'campusnest_owner_listings';
const LOCAL_STORAGE_SHORTLIST_KEY = 'campusnest_guest_shortlist';

function getLocalUsers(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUser(profile: UserProfile): void {
  try {
    const users = getLocalUsers();
    users[profile.uid] = profile;
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save local user fallback:', err);
  }
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Prevents account enumeration by standardizing invalid credentials.
 */
export function mapFirebaseAuthError(err: unknown): string {
  const error = err as { code?: string; message?: string };
  const code = error.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with numbers or symbols.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact CampusNest support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled: The Google popup window was closed before completion.';
    case 'auth/popup-blocked':
      return 'Sign-in blocked: Your browser blocked the Google popup window. Please allow popups for this site and retry.';
    case 'auth/operation-not-allowed':
      console.error('[CampusNest Dev Alert] Firebase Auth operation-not-allowed:', error);
      return 'This sign-in method is not enabled in Firebase yet.';
    default:
      if (error.message) {
        return error.message;
      }
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Initiates Google Sign-In with popup using the official Firebase GoogleAuthProvider.
 */
export async function signInWithGoogle(): Promise<AuthActionResult<FirebaseUser>> {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Sign-in is available once Firebase environment keys are added to .env.'
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      data: result.user
    };
  } catch (err: unknown) {
    const error = err as { code?: string };
    const isCancelled = error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request';
    return {
      success: false,
      isCancelled,
      error: mapFirebaseAuthError(err)
    };
  }
}

/**
 * Signs in user with email and password via Firebase Auth.
 */
export async function signInWithEmail(email: string, pass: string): Promise<AuthActionResult<FirebaseUser>> {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Sign-in is available once Firebase environment keys are added to .env.'
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return {
      success: true,
      data: cred.user
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: mapFirebaseAuthError(err)
    };
  }
}

/**
 * Registration order:
 * 1. Create the auth user (createUserWithEmailAndPassword)
 * 2. Create the profile document in Firestore (uid, displayName, email, photoURL, role, ownerType, ownerStatus, createdAt)
 * 3. Send email verification
 */
export async function signUpWithEmail(
  name: string,
  email: string,
  pass: string,
  role: 'student' | 'owner',
  ownerType: OwnerType | null = null
): Promise<AuthActionResult<UserProfile>> {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Sign-in is available once Firebase environment keys are added to .env.'
    };
  }

  let credUser: FirebaseUser | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    credUser = cred.user;
    
    // Update displayName in auth
    try {
      await updateProfile(credUser, { displayName: name.trim() });
    } catch (profileErr) {
      console.warn('Could not update Firebase Auth profile name:', profileErr);
    }

    // Determine initial status based on role rules
    const ownerStatus: OwnerStatus = role === 'owner' ? 'pending' : 'none';
    const finalOwnerType = role === 'owner' ? (ownerType || 'pg') : null;

    // Step 2: Create user profile document in Firestore
    const profile = await createUserProfile(credUser, role, finalOwnerType, ownerStatus);

    // Step 3: Send verification email
    try {
      await firebaseSendEmailVerification(credUser);
    } catch (verifErr) {
      console.warn('Could not send initial verification email:', verifErr);
    }

    return {
      success: true,
      data: profile
    };
  } catch (err: unknown) {
    // If the auth user was created but profile write failed, give a friendly message
    return {
      success: false,
      error: mapFirebaseAuthError(err)
    };
  }
}

/**
 * Sends or resends email verification to the authenticated user.
 */
export async function sendUserEmailVerification(user: FirebaseUser): Promise<AuthActionResult> {
  try {
    await firebaseSendEmailVerification(user);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: mapFirebaseAuthError(err)
    };
  }
}

/**
 * Sends a password reset email via Firebase Auth.
 * Always answers with generic message to prevent account enumeration.
 */
export async function sendPasswordReset(email: string): Promise<AuthActionResult> {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Password reset is available once Firebase is configured.'
    };
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Please provide a valid email address.'
      };
    }
    // Neutral success response for any other error or not found
    return { success: true };
  }
}

/**
 * Signs out the currently authenticated user and clears session state.
 */
export async function signOutUser(): Promise<AuthActionResult> {
  if (!isFirebaseConfigured || !auth) {
    return { success: true };
  }

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return {
      success: false,
      error: error.message || 'Failed to sign out. Please try again.'
    };
  }
}

/**
 * Retrieves the user profile from Firestore or local fallback storage.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('[CampusNest] Firestore read profile failed, falling back to local store:', err);
    }
  }

  const localUsers = getLocalUsers();
  return localUsers[uid] || null;
}

/**
 * Creates or initializes a new user profile with selected role and ownerStatus.
 * Stores ONLY: uid, displayName, email, photoURL, role, ownerType, ownerStatus, createdAt.
 * Store nothing else personal.
 */
export async function createUserProfile(
  firebaseUser: FirebaseUser,
  role: 'student' | 'owner',
  ownerType: OwnerType | null = null,
  ownerStatus: OwnerStatus = role === 'owner' ? 'pending' : 'none'
): Promise<UserProfile> {
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'CampusNest User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    role,
    ownerType: role === 'owner' ? (ownerType || 'pg') : null,
    ownerStatus,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('[CampusNest] Firestore user creation failed, saved locally:', err);
    }
  }

  saveLocalUser(newProfile);
  return newProfile;
}

/**
 * One-time migration for existing owner accounts without ownerType:
 * Saves the selected ownerType while preserving role and ownerStatus.
 */
export async function updateOwnerProfileType(
  uid: string, 
  ownerType: OwnerType
): Promise<AuthActionResult> {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { ownerType });
    } catch (err) {
      console.warn('[CampusNest] Firestore updateOwnerProfileType failed:', err);
      return { success: false, error: mapFirebaseAuthError(err) };
    }
  }

  const users = getLocalUsers();
  if (users[uid]) {
    users[uid].ownerType = ownerType;
    saveLocalUser(users[uid]);
  }

  return { success: true };
}

/**
 * Subscribes to Firebase Auth state changes.
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// -------------------------------------------------------------
// STUDENT SHORTLIST SERVICE
// -------------------------------------------------------------
export async function getStudentShortlist(uid?: string): Promise<string[]> {
  if (uid && isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'users', uid, 'shortlist');
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.id);
    } catch (err) {
      console.warn('Firestore shortlist fetch fallback to local:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SHORTLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleStudentShortlist(listingId: string, uid?: string): Promise<string[]> {
  let list = await getStudentShortlist(uid);
  const exists = list.includes(listingId);
  const updated = exists ? list.filter(id => id !== listingId) : [...list, listingId];

  // Persist locally
  try {
    localStorage.setItem(LOCAL_STORAGE_SHORTLIST_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // Persist in Firestore if authenticated
  if (uid && isFirebaseConfigured && db) {
    try {
      const itemRef = doc(db, 'users', uid, 'shortlist', listingId);
      if (exists) {
        await deleteDoc(itemRef);
      } else {
        await setDoc(itemRef, {
          listingId,
          addedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Firestore shortlist update failed:', err);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// OWNER LISTINGS SERVICE
// -------------------------------------------------------------
export function getStoredOwnerListings(): OwnerListingSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_OWNER_LISTINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOwnerListings(listings: OwnerListingSubmission[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_OWNER_LISTINGS_KEY, JSON.stringify(listings));
  } catch (err) {
    console.error('Failed to save owner listings:', err);
  }
}

export async function submitOwnerListing(
  listing: Omit<OwnerListingSubmission, 'id' | 'status' | 'verificationBadge' | 'createdAt'>
): Promise<OwnerListingSubmission> {
  const newListing: OwnerListingSubmission = {
    ...listing,
    id: `owner-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'pending review',
    verificationBadge: 'owner-submitted, not verified',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const listingRef = doc(db, 'listings', newListing.id);
      await setDoc(listingRef, {
        ...newListing,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore listing submission failed, stored locally:', err);
    }
  }

  const all = getStoredOwnerListings();
  all.push(newListing);
  saveStoredOwnerListings(all);
  return newListing;
}

export async function updateOwnerListing(
  listingId: string,
  updates: Partial<OwnerListingSubmission>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore listing update failed:', err);
    }
  }

  const all = getStoredOwnerListings();
  const index = all.findIndex(l => l.id === listingId);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates, lastUpdated: new Date().toISOString() };
    saveStoredOwnerListings(all);
  }
}

// -------------------------------------------------------------
// ADMIN ACTIONS SERVICE (Approval of owners & listings)
// -------------------------------------------------------------
export async function adminApproveOwner(uid: string, approve: boolean): Promise<void> {
  const newStatus: OwnerStatus = approve ? 'approved' : 'rejected';

  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { ownerStatus: newStatus });
    } catch (err) {
      console.warn('Firestore adminApproveOwner failed:', err);
    }
  }

  const users = getLocalUsers();
  if (users[uid]) {
    users[uid].ownerStatus = newStatus;
    saveLocalUser(users[uid]);
  }
}

export async function adminUpdateListingStatus(
  listingId: string, 
  status: OwnerListingStatus
): Promise<void> {
  await updateOwnerListing(listingId, { status });
}
