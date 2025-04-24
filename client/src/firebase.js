
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtC7Uwb5pGAsdmrH2T4Gqdk5Mga07jYPM", // Using the same API key from sesame_ai/config.py
  authDomain: "sesame-voice-ai.firebaseapp.com",
  projectId: "sesame-voice-ai",
  storageBucket: "sesame-voice-ai.appspot.com",
  messagingSenderId: "1072000975600",
  appId: "1:1072000975600:web:75b0bf3a9bb8d92e767835"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google sign in function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign in:", error);
    return null;
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error during sign out:", error);
    return false;
  }
};

export { auth };
