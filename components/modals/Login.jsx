// E:\Compete\rakshanahosierys\components\modals\Login.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utlis/firebaseConfig";

/**
 * Login Modal Component
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal, passed from ModalContext.
 * @param {function} props.onForgotPasswordClick - Function to open the ResetPass modal, passed from ModalContext.
 * @param {function} props.onRegisterClick - Function to open the Register modal, passed from ModalContext.
 */
export default function Login({ onClose, onForgotPasswordClick, onRegisterClick }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef(null);
  const bsModalRef = useRef(null);
  const isModalShownByBootstrap = useRef(false);

  // This ref will store the *intent* for what should happen *after* the modal hides.
  const pendingTransition = useRef(null); // e.g., 'forgotPassword', 'register', 'loginSuccess'

  const handleHiddenEvent = useCallback(() => {
    isModalShownByBootstrap.current = false;
    console.log("Login: 'hidden.bs.modal' event fired. pendingTransition:", pendingTransition.current); // DEBUG LOG

    // Execute the stored pending transition if any
    if (pendingTransition.current === 'forgotPassword') {
      console.log("Login: Executing forgotPassword transition (calling onForgotPasswordClick)."); // DEBUG LOG
      if (onForgotPasswordClick) onForgotPasswordClick(email);
    } else if (pendingTransition.current === 'register') {
      console.log("Login: Executing register transition (calling onRegisterClick)."); // DEBUG LOG
      if (onRegisterClick) onRegisterClick();
    } else if (pendingTransition.current === 'loginSuccess') {
      console.log("Login: Executing loginSuccess transition (redirecting)."); // DEBUG LOG
      const redirectUrl = searchParams.get("redirect");
      router.push(redirectUrl || "/my-account");
    } else {
        console.log("Login: No specific pending transition, defaulting to onClose()."); // DEBUG LOG
    }

    // Always call onClose. This signals ModalContext to potentially reset showLoginModal to false.
    if (onClose) {
      onClose();
    }

    // Reset the pending transition
    pendingTransition.current = null;
  }, [onClose, onForgotPasswordClick, onRegisterClick, email, router, searchParams]);


  const handleShownEvent = useCallback(() => {
    console.log("Login: 'shown.bs.modal' event fired."); // DEBUG LOG
    isModalShownByBootstrap.current = true;
  }, []);

  useEffect(() => {
    console.log("Login component mounted. Initializing Bootstrap modal."); // DEBUG LOG
    if (!modalRef.current) {
      console.warn("Login: modalRef.current is null on mount."); // DEBUG WARNING
      return;
    }

    let bootstrapModalInstance;

    import("bootstrap/dist/js/bootstrap.esm").then((bootstrap) => {
      if (!bsModalRef.current) {
        bootstrapModalInstance = new bootstrap.Modal(modalRef.current, {
          backdrop: 'static',
          keyboard: false
        });
        bsModalRef.current = bootstrapModalInstance;
        console.log("Login: Bootstrap Modal instance created."); // DEBUG LOG

        // Add event listeners
        modalRef.current.addEventListener('hidden.bs.modal', handleHiddenEvent);
        modalRef.current.addEventListener('shown.bs.modal', handleShownEvent);
        console.log("Login: Event listeners added."); // DEBUG LOG
      } else {
        bootstrapModalInstance = bsModalRef.current;
        console.log("Login: Bootstrap Modal instance already exists."); // DEBUG LOG
      }

      // Show the modal if it's not already visible
      if (modalRef.current && !isModalShownByBootstrap.current && !modalRef.current.classList.contains('show')) {
        bootstrapModalInstance.show();
        console.log("Login: bsModalRef.current.show() called on mount."); // DEBUG LOG
      } else {
        console.log("Login: Modal is already shown or in process of showing, skipping bsModalRef.current.show() on mount."); // DEBUG LOG
      }
    }).catch(err => console.error("Failed to load Bootstrap in Login modal:", err));

    return () => {
      console.log("Login: Component unmounting cleanup."); // DEBUG LOG
      // Remove event listeners before disposing
      if (modalRef.current && bsModalRef.current) {
          modalRef.current.removeEventListener('hidden.bs.modal', handleHiddenEvent);
          modalRef.current.removeEventListener('shown.bs.modal', handleShownEvent);
          console.log("Login: Event listeners removed during cleanup."); // DEBUG LOG
      }

      // Dispose the Bootstrap instance only when the component unmounts
      if (bsModalRef.current) {
        bsModalRef.current.dispose();
        bsModalRef.current = null;
        isModalShownByBootstrap.current = false;
        console.log("Login: Bootstrap Modal instance disposed during cleanup."); // DEBUG LOG
      }
    };
  }, [handleHiddenEvent, handleShownEvent]);

  useEffect(() => {
    const defaultEmail = searchParams.get('email');
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [searchParams]);

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
      console.log("Login successful!"); // DEBUG LOG

      // Set the pending transition for login success
      pendingTransition.current = 'loginSuccess';
      // --- ADD THIS SMALL DELAY ---
      // This is a diagnostic step. If the event doesn't fire, it might be a race condition.
      setTimeout(() => {
        if (bsModalRef.current) {
          console.log("Login: Calling bsModalRef.current.hide() for login success (after timeout)."); // DEBUG LOG
          bsModalRef.current.hide(); // This will trigger handleHiddenEvent
        }
      }, 50); // A small delay, e.g., 50ms, might help ensure event listener is ready.
      // --- END ADDITION ---
      // router.push is now handled in handleHiddenEvent
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
    console.log("Login: Forgot Password clicked. Setting pendingTransition to 'forgotPassword'."); // DEBUG LOG
    // Set the pending transition to 'forgotPassword'
    pendingTransition.current = 'forgotPassword';
    if (bsModalRef.current) {
      console.log("Login: Calling bsModalRef.current.hide() for forgot password."); // DEBUG LOG
      bsModalRef.current.hide(); // This will trigger handleHiddenEvent
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Login: Register clicked. Setting pendingTransition to 'register'."); // DEBUG LOG
    // Set the pending transition to 'register'
    pendingTransition.current = 'register';
    if (bsModalRef.current) {
      console.log("Login: Calling bsModalRef.current.hide() for register."); // DEBUG LOG
      bsModalRef.current.hide(); // This will trigger handleHiddenEvent
    }
  };

  return (
    <div
      className={`modal modalCentered fade form-sign-in modal-part-content`}
      id="login"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="loginModalLabel"
      ref={modalRef}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title" id="loginModalLabel">Log in</div>
            <span
              className="icon-close icon-close-popup"
              onClick={() => {
                console.log("Login: Close icon clicked. Calling bsModalRef.current.hide()."); // DEBUG LOG
                // For a simple close, we don't set a specific pendingTransition.
                // handleHiddenEvent will then default to just calling onClose().
                if (bsModalRef.current) {
                  bsModalRef.current.hide();
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