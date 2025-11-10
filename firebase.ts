// Fix: Changed firebase imports to use scoped packages (@firebase/*)
// to resolve potential module resolution issues.
import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';

// --- ACTION REQUIRED --------------------------------------------------
// This configuration has been updated with your project keys.
// Your app is now connected to your Firebase project.
// ----------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: "AIzaSyAU_BIaLU6J6zYEyA5RBdyT_cJnNmGnStc",
  authDomain: "comfnet-solutions-progress.firebaseapp.com",
  projectId: "comfnet-solutions-progress",
  storageBucket: "comfnet-solutions-progress.firebasestorage.app",
  messagingSenderId: "1064054649181",
  appId: "1:1064054649181:web:331fe68a4c2a8383b1f8b4",
  measurementId: "G-8580L0TWS0"
};

// A simple check to see if the config has been filled out.
// In your case, this is now true.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase only if the config is provided.
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Export Firebase services to be used in the app.
// They will be null if the firebaseConfig is not provided.
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;