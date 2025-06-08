"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup, // Import signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import for Firestore operations in Google Login
import { auth, db } from "@/utlis/firebaseConfig"; // Ensure this path is correct and db is imported

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingLogin, setIsLoadingLogin] = useState(false); // Login form loading

  // State for Password Reset Form
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isLoadingReset, setIsLoadingReset] = useState(false); // Password reset form loading

  // State to toggle between login and password reset forms
  const [showLoginForm, setShowLoginForm] = useState(true);

  // Optional: Listen for auth state changes to auto-redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Get potential redirect URL from query params
        const redirectUrl = searchParams.get("redirect");
        router.push(redirectUrl || "/my-account");
      }
    });
    return () => unsubscribe();
  }, [router, searchParams]); // Dependencies

  // Handle Login Submission (Email/Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(""); // Clear previous errors
    setIsLoadingLogin(true); // Start loading

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const redirectUrl = searchParams.get("redirect");
      router.push(redirectUrl || "/my-account");
    } catch (err) {
      console.error("Login error:", err);
      if (
        err.code === "auth/invalid-email" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setLoginError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setLoginError("Too many login attempts. Please try again later.");
      } else {
        setLoginError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoadingLogin(false); // End loading
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLoginError(""); // Clear any previous login errors
    setIsLoadingLogin(true); // Use login loading state for this too

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user data already exists in Firestore (for returning Google users)
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // If it's a new Google user, create their document in Firestore
        // This also handles cases where an email/password user logs in with Google for the first time
        // and doesn't have a Firestore record yet.
        await setDoc(userDocRef, {
          firstName: user.displayName ? user.displayName.split(" ")[0] : "",
          lastName: user.displayName
            ? user.displayName.split(" ").slice(1).join(" ")
            : "",
          email: user.email,
          createdAt: new Date(),
          signInMethod: "google", // Specify sign-in method
          photoURL: user.photoURL || null, // Store Google profile picture
        });
      }
      // If userDocSnap.exists() is true, it means the user's Firestore document already exists.
      // In this case, they are already logged in via Google.

      const redirectUrl = searchParams.get("redirect");
      router.push(redirectUrl || "/my-account"); // Redirect both new and existing users
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setLoginError("Google login was cancelled.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setLoginError("Another Google login pop-up is already open.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
         setLoginError('An account with this email already exists using a different sign-in method. Please log in with that method.');
      }
      else {
        setLoginError("Google login failed. Please try again.");
      }
    } finally {
      setIsLoadingLogin(false); // End loading
    }
  };

  // Handle Password Reset Submission
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError(""); // Clear previous errors
    setResetMessage(""); // Clear previous messages
    setIsLoadingReset(true); // Start loading

    if (!resetEmail) {
      setResetError("Please enter your email address.");
      setIsLoadingReset(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setResetEmail(""); // Clear email field after sending
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/invalid-email") {
        setResetError("Please enter a valid email address.");
      } else if (err.code === "auth/user-not-found") {
        setResetError("No user found with that email address.");
      } else {
        setResetError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoadingReset(false); // End loading
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="tf-grid-layout lg-col-2 tf-login-wrap">
          {/* Main Login/Reset Form Container */}
          <div className="tf-login-form">
            {showLoginForm ? (
              // Login Section
              <div id="login">
                <h5 className="mb_36">Log in</h5>
                <form onSubmit={handleLogin}>
                  <div className="tf-field style-1 mb_15">
                    <input
                      required
                      className="tf-field-input tf-input"
                      placeholder=""
                      type="email"
                      autoComplete="email"
                      id="loginEmail"
                      name="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="loginEmail"
                    >
                      Email *
                    </label>
                  </div>
                  <div className="tf-field style-1 mb_30">
                    <input
                      required
                      className="tf-field-input tf-input"
                      placeholder=""
                      type="password"
                      id="loginPassword"
                      name="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="loginPassword"
                    >
                      Password *
                    </label>
                  </div>
                  {loginError && (
                    <p style={{ color: "red", marginBottom: "10px" }}>
                      {loginError}
                    </p>
                  )}
                  <div className="mb_20">
                    <a
                      href="#" // Use # or prevent default, and onClick
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLoginForm(false); // Toggle to reset form
                      }}
                      className="tf-btn btn-line"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="mb_20">
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                      disabled={isLoadingLogin}
                    >
                      {isLoadingLogin ? "Logging in..." : "Log in"}
                    </button>
                  </div>

                  {/* Google Login Button for Login Page */}
                  <div className="mb_20">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="tf-btn w-100 radius-3 btn-line animate-hover-btn justify-content-center"
                      style={{
                        backgroundColor: "#DB4437",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 15px",
                        border: "none",
                        cursor: "pointer",
                        opacity: isLoadingLogin ? 0.7 : 1,
                      }}
                      disabled={isLoadingLogin}
                    >
                      <img
                        src="https://img.icons8.com/color/24/000000/google-logo.png"
                        alt="Google icon"
                        style={{ width: "24px", height: "24px" }}
                      />
                      {isLoadingLogin ? "Redirecting..." : "Log in with Google"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Password Reset Section
              <div id="recover">
                <h5 className="mb_24">Reset your password</h5>
                <p className="mb_30">
                  We will send you an email to reset your password
                </p>
                <form onSubmit={handlePasswordReset}>
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=""
                      required
                      type="email"
                      autoComplete="email"
                      id="resetEmail"
                      name="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="resetEmail"
                    >
                      Email *
                    </label>
                  </div>
                  {resetError && (
                    <p style={{ color: "red", marginBottom: "10px" }}>
                      {resetError}
                    </p>
                  )}
                  {resetMessage && (
                    <p style={{ color: "green", marginBottom: "10px" }}>
                      {resetMessage}
                    </p>
                  )}
                  <div className="mb_20">
                    <a
                      href="#" // Use # or prevent default, and onClick
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLoginForm(true); // Toggle back to login form
                        setResetError(""); // Clear reset errors on cancel
                        setResetMessage(""); // Clear reset messages on cancel
                      }}
                      className="tf-btn btn-line"
                    >
                      Cancel
                    </a>
                  </div>
                  <div className="">
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                      disabled={isLoadingReset}
                    >
                      {isLoadingReset ? "Sending..." : "Reset password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* New Customer / Register Section (always visible) */}
          <div className="tf-login-content">
            <h5 className="mb_36">I'm new here</h5>
            <p className="mb_20">
              Sign up for early Sale access plus tailored new arrivals, trends
              and promotions. To opt out, click unsubscribe in our emails.
            </p>
            <Link href={`/register`} className="tf-btn btn-line">
              Register
              <i className="icon icon-arrow1-top-left" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}