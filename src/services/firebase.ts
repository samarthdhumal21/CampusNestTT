import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

// Check if credentials are meaningfully provided (not placeholder strings or empty)
export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes('your_firebase_api_key') &&
  !projectId.includes('your-project-id')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId
    };

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('[CampusNest] Firebase initialization deferred:', error);
    auth = null;
    db = null;
    googleProvider = null;
  }
}

export const FIRESTORE_COLLECTIONS = {
  COLLEGES: 'colleges',
  ACCOMMODATIONS: 'accommodations',
  MESS_LISTINGS: 'messListings',
  USERS: 'users',
  OWNER_LISTINGS: 'ownerListings',
  SHORTLISTS: 'shortlists'
} as const;

export { app, auth, db, googleProvider };
