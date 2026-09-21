import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User
} from "firebase/auth";
import { getFirestore, doc, onSnapshot, collection, query, limit } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Provided Firebase configuration for techmain-3dc2a
export const firebaseConfig = {
  apiKey: "AIzaSyBA8GCNWAL3q-owrAC2R8NSfDgS7nhhxlg",
  authDomain: "techmain-3dc2a.firebaseapp.com",
  projectId: "techmain-3dc2a",
  storageBucket: "techmain-3dc2a.firebasestorage.app",
  messagingSenderId: "27211537518",
  appId: "1:27211537518:web:344458f2d758c2046f1a7f",
  measurementId: "G-VMR37204ND"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Analytics conditionally
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((e) => console.log("Firebase analytics not initialized:", e));
}

// ==========================================================
// Authentication Helper Functions
// ==========================================================

export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const setupRecaptcha = (containerId: string) => {
  if (typeof window === "undefined") return null;
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
    }
  });
};

export const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

// ==========================================================
// Real-time Firestore Listeners (Section 4 & 22)
// Minimal listeners for live alerts and profile events only
// ==========================================================
export const subscribeToNotifications = (callback: (notifications: any[]) => void) => {
  try {
    const q = query(collection(db, "notifications"), limit(10));
    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(notifs);
    }, (error) => {
      console.warn("Firestore realtime notifications listener error:", error);
    });
  } catch (err) {
    console.warn("Failed to subscribe to Firestore notifications:", err);
    return () => {};
  }
};

export const subscribeToEmployeeUpdates = (employeeId: string, callback: (employeeData: any) => void) => {
  try {
    const empRef = doc(db, "employees", employeeId);
    return onSnapshot(empRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    }, (error) => {
      console.warn("Firestore realtime employee listener error:", error);
    });
  } catch (err) {
    console.warn("Failed to subscribe to Firestore employee:", err);
    return () => {};
  }
};
