// E:\Compete\rakshanahosierys\components\modals\ResetPass.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/utlis/firebaseConfig";

/**
 * ResetPass Modal Component
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal, passed from ModalContext.
 * @param {string} [props.initialEmail] - Optional initial email to pre-fill.
 * @param {function} props.onLoginClick - Function to open the Login modal, passed from ModalContext.
 */
export default function ResetPass({ onClose, initialEmail = "", onLoginClick }) {
  const [email, setEmail] = useState(initialEmail); // Use initialEmail prop
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef(null); // Ref for the modal DOM element
  const bsModalRef = useRef(null); // Ref for the Bootstrap Modal instance
  const isModalShownByBootstrap = useRef(false); // Track if Bootstrap has shown it

  // This ref will store the intent for what should happen *after* the modal hides.
  const pendingTransition = useRef(null); // e.g., 'loginClick'

  // Handler for 'hidden.bs.modal' event
  const handleHiddenEvent = useCallback(() => {
    isModalShownByBootstrap.current = false;
    console.log("ResetPass: 'hidden.bs.modal' event fired. pendingTransition:", pendingTransition.current); // DEBUG LOG

    // Execute the stored pending transition if any
    if (pendingTransition.current === 'loginClick') {
      console.log("ResetPass: Executing loginClick transition (calling onLoginClick)."); // DEBUG LOG
      if (onLoginClick) onLoginClick();
    } else {
      console.log("ResetPass: No specific pending transition, defaulting to onClose()."); // DEBUG LOG
    }

    // Always call onClose. This signals ModalContext to reset showResetPassModal to false.
    if (onClose) {
      onClose();
    }
    pendingTransition.current = null; // Reset
  }, [onClose, onLoginClick]);

  // Handler for 'shown.bs.modal' event
  const handleShownEvent = useCallback(() => {
    console.log("ResetPass: 'shown.bs.modal' event fired."); // DEBUG LOG
    isModalShownByBootstrap.current = true;
  }, []);

  // Effect to initialize and manage Bootstrap Modal lifecycle
  useEffect(() => {
    console.log("ResetPass component mounted. Initializing Bootstrap modal."); // DEBUG LOG
    if (!modalRef.current) {
      console.warn("ResetPass: modalRef.current is null on mount."); // DEBUG WARNING
      return;
    }

    let bootstrapModalInstance;

    // Dynamically import Bootstrap
    import("bootstrap/dist/js/bootstrap.esm").then((bootstrap) => {
      if (!bsModalRef.current) {
        bootstrapModalInstance = new bootstrap.Modal(modalRef.current, {
          backdrop: 'static', // Keep backdrop
          keyboard: false     // Prevent closing with Esc key
        });
        bsModalRef.current = bootstrapModalInstance;
        console.log("ResetPass: Bootstrap Modal instance created."); // DEBUG LOG

        // Add event listeners
        modalRef.current.addEventListener('hidden.bs.modal', handleHiddenEvent);
        modalRef.current.addEventListener('shown.bs.modal', handleShownEvent);
        console.log("ResetPass: Event listeners added."); // DEBUG LOG
      } else {
        bootstrapModalInstance = bsModalRef.current;
        console.log("ResetPass: Bootstrap Modal instance already exists."); // DEBUG LOG
      }

      // Show the modal if it's not already visible
      if (modalRef.current && !isModalShownByBootstrap.current && !modalRef.current.classList.contains('show')) {
        bootstrapModalInstance.show();
        console.log("ResetPass: bsModalRef.current.show() called on mount."); // DEBUG LOG
      } else {
        console.log("ResetPass: Modal is already shown or in process of showing, skipping bsModalRef.current.show() on mount."); // DEBUG LOG
      }
    }).catch(err => console.error("Failed to load Bootstrap in ResetPass modal:", err));

    // Cleanup function: This runs when the component unmounts
    return () => {
      console.log("ResetPass: Component unmounting cleanup."); // DEBUG LOG
      // Remove event listeners before disposing
      if (modalRef.current && bsModalRef.current) {
          modalRef.current.removeEventListener('hidden.bs.modal', handleHiddenEvent);
          modalRef.current.removeEventListener('shown.bs.modal', handleShownEvent);
          console.log("ResetPass: Event listeners removed during cleanup."); // DEBUG LOG
      }

      // Dispose the Bootstrap instance only when the component unmounts
      if (bsModalRef.current) {
        bsModalRef.current.dispose();
        bsModalRef.current = null;
        isModalShownByBootstrap.current = false;
        console.log("ResetPass: Bootstrap Modal instance disposed during cleanup."); // DEBUG LOG
      }
    };
  }, [handleHiddenEvent, handleShownEvent]); // Dependencies

  // Effect to update email if initialEmail prop changes (e.g., from Login modal)
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      console.log("ResetPass: Initial email set from prop:", initialEmail); // DEBUG LOG
    }
  }, [initialEmail]);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true); // Set loading state

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
      console.log("ResetPass: Password reset email sent for:", email); // DEBUG LOG
      // Optional: You might want to close the modal after sending the email
      // if (bsModalRef.current) {
      //   bsModalRef.current.hide();
      // }
    } catch (err) {
      console.error("Firebase Password Reset Error:", err); // Log full error
      if (err.code === "auth/user-not-found") {
        setError("No user found with that email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset email. Please try again later.");
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    console.log("ResetPass: Cancel link clicked. Setting pendingTransition to 'loginClick'."); // DEBUG LOG
    pendingTransition.current = 'loginClick';
    if (bsModalRef.current) {
      bsModalRef.current.hide(); // This will trigger handleHiddenEvent
    }
  };

  return (
    <div
      className="modal modalCentered fade form-sign-in modal-part-content"
      id="forgotPassword" // Make sure this ID is unique if you use it for direct Bootstrap JS access
      tabIndex="-1" // Added for accessibility
      role="dialog"
      aria-labelledby="forgotPasswordModalLabel" // Added for accessibility
      ref={modalRef} // Assign the ref to the modal div
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title" id="forgotPasswordModalLabel">Reset your password</div> {/* Add ID for aria-labelledby */}
            <span
              className="icon-close icon-close-popup"
              onClick={() => {
                console.log("ResetPass: Close icon clicked. Calling bsModalRef.current.hide()."); // DEBUG LOG
                if (bsModalRef.current) {
                  bsModalRef.current.hide(); // This will trigger handleHiddenEvent (and then onClose)
                }
              }}
              style={{ cursor: 'pointer' }} // Add style for visual cue
              aria-label="Close" // Add for accessibility
            />
          </div>
          <div className="tf-login-form">
            <form onSubmit={handleReset}>
              <div>
                <p>
                  Enter your email address below, and we'll send you a link to reset your password.
                </p>
              </div>
              <div className="tf-field style-1">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading} // Disable input during loading
                />
                <label className="tf-field-label" htmlFor="">
                  Email *
                </label>
              </div>
              {message && <p className="text-success mt-2">{message}</p>}
              {error && <p className="text-danger mt-2">{error}</p>}
              <div>
                <a
                  href="#" // Change to # or remove if not navigating
                  onClick={handleCancelClick} // Use new handler
                  className="btn-link link"
                >
                  Cancel
                </a>
              </div>
              <div className="bottom">
                <div className="w-100">
                  <button
                    type="submit"
                    className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                    disabled={isLoading} // Disable button during loading
                  >
                    <span>{isLoading ? "Sending..." : "Reset password"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}