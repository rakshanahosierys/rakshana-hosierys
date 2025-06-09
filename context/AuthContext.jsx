"use client"; // This directive is important for client-side functionality in Next.js App Router

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import { auth } from "@/utlis/firebaseConfig"; // Ensure this path is correct
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged, // Firebase's observer for auth state
} from 'firebase/auth';

// 1. Create the Auth Context
const AuthContext = createContext(null);

// 2. Create the Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase User object or null
  const [loading, setLoading] = useState(true); // True while Firebase is checking auth status
  const router = useRouter();

  // Firebase's built-in observer for authentication state changes
  useEffect(() => {
    // Ensure 'auth' instance is available before subscribing to auth state changes
    if (!auth) {
      console.error("Firebase Auth instance is undefined. AuthContext cannot initialize.");
      setLoading(false); // Make sure to stop loading even if auth is not available
      return; // Exit if auth is not ready
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // firebaseUser will be null if not logged in
      setLoading(false); // Auth state determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // --- AUTHENTICATION FUNCTIONS (Firebase specific) ---

  const register = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // userCredential.user contains the Firebase User object
      setUser(userCredential.user);
      // You might want to save additional user data to Firestore/Database here
      // e.g., await setDoc(doc(db, "users", userCredential.user.uid), { email: userCredential.user.email, /* other fields */ });
      return userCredential.user;
    } catch (error) {
      console.error("Firebase Registration Error:", error.message);
      throw error; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Firebase Login Error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null); // Clear user state
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Firebase Logout Error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // The value provided to consumers of this context
  const contextValue = {
    user,
    loading,
    isAuthenticated: !!user, // Convenience boolean for easy check
    register,
    login,
    logout,
    // Add other Firebase auth methods you might need, like signInWithGoogle, resetPassword, etc.
  };

  // Render children only after auth state is determined to avoid flickering
  if (loading) {
    // You can render a loading spinner or skeleton here
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom Hook to consume the Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}