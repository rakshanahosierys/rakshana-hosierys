"use client"; // This component must be a Client Component to use hooks like useEffect and useRouter

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For Next.js App Router
// import { useRouter } from 'next/router'; // Use this if you are using Next.js Pages Router (pages/ directory)
import { useAuth } from '@/context/AuthContext'; // Adjust this path to your AuthContext

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth(); // Get auth state and loading status
  const router = useRouter();

  useEffect(() => {
    // Only proceed if authentication state has finished loading
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('User not authenticated. Redirecting to login and storing return URL...');
        // Encode the current path so it can be safely passed as a URL parameter
        // For App Router, window.location.pathname is usually sufficient for the base path
        // For Pages Router, router.asPath or router.pathname might be more appropriate depending on query params
        const currentPath = window.location.pathname + window.location.search; // Includes query params
        const redirectUrl = `/login?redirectFrom=${encodeURIComponent(currentPath)}`;
        
        // Use router.replace to prevent the protected page from being in the browser history
        // so the user can't hit back to it without being authenticated.
        router.replace(redirectUrl);
      }
    }
  }, [isAuthenticated, authLoading, router]); // Dependencies for useEffect

  // Display a loading message/spinner while authentication state is being determined
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '24px',
        color: '#555'
      }}>
        Loading authentication...
      </div>
    );
  }

  // If authenticated, render the children (the content of the protected page)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, we've already initiated a redirect,
  // so we return null to prevent rendering the protected content.
  return null;
};

export default AuthGuard;