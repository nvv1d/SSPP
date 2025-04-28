
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH3_H6dA-Wp_yMrV0hSvyZOtbO4vzGuwY",
  authDomain: "sspp-b3a48.firebaseapp.com",
  projectId: "sspp-b3a48",
  storageBucket: "sspp-b3a48.appspot.com",
  messagingSenderId: "1057298517910",
  appId: "1:1057298517910:web:75b0bf3a9bb8d92e767835" // You might need to update this with the correct appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google sign in function
export const signInWithGoogle = async () => {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    console.log("Initiating Google sign in...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Sign in successful:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign in:", error.code, error.message);
    alert("Google sign in failed: " + error.message);
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
