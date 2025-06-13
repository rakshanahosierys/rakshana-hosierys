// E:\Compete\rakshanahosierys\components\modals\Login.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utlis/firebaseConfig";

export default function Login({ onClose, onForgotPasswordClick, onRegisterClick }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef(null);
  const bsModalRef = useRef(null); // Stores the Bootstrap Modal instance

  // This ref will store the action to perform after the modal is completely hidden
  const pendingTransition = useRef(null);

  /**
   * Callback for Bootstrap's 'hidden.bs.modal' event.
   * This event fires AFTER the modal and its backdrop have completed their hide animations
   * and the backdrop has been removed from the DOM.
   */
  const handleHiddenEvent = useCallback(() => {
    console.log("Login: 'hidden.bs.modal' event fired. Initiating post-hide actions.");

    // Now, execute the stored pending transition
    if (pendingTransition.current === 'forgotPassword') {
      if (onForgotPasswordClick) onForgotPasswordClick(email);
    } else if (pendingTransition.current === 'register') {
      if (onRegisterClick) onRegisterClick();
    } else if (pendingTransition.current === 'loginSuccess') {
      const redirectUrl = searchParams.get("redirect");
      router.push(redirectUrl || "/my-account");
    } else {
      console.log("Login: No specific pending transition, simply closing.");
    }

    pendingTransition.current = null; // Reset for next time

    // CRITICAL: Call onClose() here. At this point, Bootstrap has fully
    // cleaned up the modal and its backdrop from the DOM. React can now
    // safely unmount the Login component.
    if (onClose) {
      console.log("Login: Calling onClose() from handleHiddenEvent to trigger React unmount.");
      onClose();
    }

  }, [onClose, onForgotPasswordClick, onRegisterClick, email, router, searchParams]);

  /**
   * Callback for Bootstrap's 'shown.bs.modal' event.
   * Useful for knowing when the modal is fully visible.
   */
  const handleShownEvent = useCallback(() => {
    console.log("Login: 'shown.bs.modal' event fired.");
  }, []);

  // --- useEffect for Bootstrap Modal Lifecycle Management ---
  useEffect(() => {
    // Ensure modalRef.current is available and hasn't been unmounted prematurely
    if (!modalRef.current) {
      console.log("Login: modalRef.current is null on useEffect mount, returning.");
      return;
    }

    console.log("Login: Initializing Bootstrap Modal instance on mount.");

    let bootstrapModalInstance;

    // Dynamically import Bootstrap JS to ensure it runs client-side
    import("bootstrap/dist/js/bootstrap.esm").then((bootstrap) => {
        // Double-check if the ref is still valid after the async import
        // (important for strict mode/fast unmounts in dev)
        if (!modalRef.current) {
            console.warn("Login: modalRef.current became null during Bootstrap import. Skipping initialization.");
            return;
        }

        // Create a new Bootstrap Modal instance
        bootstrapModalInstance = new bootstrap.Modal(modalRef.current, {
            backdrop: 'static', // Prevents clicking outside from closing the modal directly
            keyboard: false // Prevents ESC key from closing the modal directly
        });
        bsModalRef.current = bootstrapModalInstance; // Store the instance in ref

        // Attach event listeners to the DOM element
        modalRef.current.addEventListener('hidden.bs.modal', handleHiddenEvent);
        modalRef.current.addEventListener('shown.bs.modal', handleShownEvent);

        // Show the modal after initialization and listeners are attached
        bsModalRef.current.show();
        console.log("Login: Bootstrap Modal instance created and shown on mount.");

    }).catch(err => console.error("Failed to load Bootstrap in Login modal:", err));

    // --- Cleanup function for when the component unmounts ---
    return () => {
      console.log("Login: Component unmounting cleanup.");

      // Remove event listeners from the DOM element
      if (modalRef.current) {
        modalRef.current.removeEventListener('hidden.bs.modal', handleHiddenEvent);
        modalRef.current.removeEventListener('shown.bs.modal', handleShownEvent);
        console.log("Login: Event listeners removed during cleanup.");
      }

      // Dispose the Bootstrap instance if it exists.
      // We don't call .hide() here because the component unmounts *after*
      // Bootstrap's `hide()` (and `handleHiddenEvent`) has already run.
      if (bsModalRef.current) {
        bsModalRef.current.dispose(); // Dispose to prevent memory leaks
        bsModalRef.current = null; // Clear the ref
        console.log("Login: Bootstrap Modal instance disposed during cleanup.");
      }
    };
  }, [handleHiddenEvent, handleShownEvent]); // Dependencies for useCallback functions

  // Effect to pre-fill email if provided via URL search params
  useEffect(() => {
    const defaultEmail = searchParams.get('email');
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [searchParams]);

  // --- Event Handlers (Triggering Bootstrap's hide method) ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful!");

      // Set the pending transition for post-hide actions
      pendingTransition.current = 'loginSuccess';

      // CRITICAL: Initiate Bootstrap's hide.
      // onClose() will be called by handleHiddenEvent *after* hide completes.
      if (bsModalRef.current) {
        console.log("Login: Calling bsModalRef.current.hide() for login success.");
        bsModalRef.current.hide();
      } else {
        // Fallback: If Bootstrap instance isn't available for some reason (rare)
        console.error("Login: bsModalRef.current is null on login success. Forcing React close.");
        if (onClose) onClose(); // Force React to unmount
        const redirectUrl = searchParams.get("redirect");
        router.push(redirectUrl || "/my-account");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-email" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Login failed. An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log("Login: Forgot Password clicked. Setting pendingTransition to 'forgotPassword'.");
    pendingTransition.current = 'forgotPassword';
    if (bsModalRef.current) {
      console.log("Login: Calling bsModalRef.current.hide() for forgot password.");
      bsModalRef.current.hide();
    } else {
      console.warn("Login: bsModalRef.current is null for forgot password. Forcing React close.");
      if (onClose) onClose();
      if (onForgotPasswordClick) onForgotPasswordClick(email);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Login: Register clicked. Setting pendingTransition to 'register'.");
    pendingTransition.current = 'register';
    if (bsModalRef.current) {
      console.log("Login: Calling bsModalRef.current.hide() for register.");
      bsModalRef.current.hide();
    } else {
      console.warn("Login: bsModalRef.current is null for register. Forcing React close.");
      if (onClose) onClose();
      if (onRegisterClick) onRegisterClick();
    }
  };

  return (
    <div
      className={`modal modalCentered fade form-sign-in modal-part-content`}
      id="login"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="loginModalLabel"
      ref={modalRef} // Attach the ref to the modal DOM element
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title" id="loginModalLabel">Log in</div>
            <span
              className="icon-close icon-close-popup"
              onClick={() => {
                console.log("Login: Close icon clicked. Setting pendingTransition to null and calling hide.");
                pendingTransition.current = null; // No specific follow-up action
                if (bsModalRef.current) {
                  bsModalRef.current.hide();
                } else {
                  console.warn("Login: bsModalRef.current is null for close icon. Calling onClose directly.");
                  if (onClose) onClose(); // Fallback for direct close
                }
              }}
              style={{ cursor: 'pointer' }}
              aria-label="Close"
            />
          </div>
          <div className="tf-login-form">
            <form onSubmit={handleLogin}>
              <div className="tf-field style-1">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                />
                <label className="tf-field-label" htmlFor="">
                  Email *
                </label>
              </div>
              <div className="tf-field style-1">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <label className="tf-field-label" htmlFor="">
                  Password *
                </label>
              </div>
              {error && (
                <p style={{ color: "red", marginBottom: "10px", fontSize: "0.9em" }}>{error}</p>
              )}
              <div>
                <a
                  href="#"
                  className="btn-link link"
                  onClick={handleForgotPassword}
                >
                  Forgot your password?
                </a>
              </div>
              <div className="bottom">
                <div className="w-100">
                  <button
                    type="submit"
                    className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? "Logging in..." : "Log in"}</span>
                  </button>
                </div>
                <div className="w-100">
                  <a
                    href="#"
                    className="btn-link fw-6 w-100 link"
                    onClick={handleRegister}
                  >
                    New customer? Create your account
                    <i className="icon icon-arrow1-top-left" />
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}