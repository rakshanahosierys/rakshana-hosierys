// E:\Compete\rakshanahosierys\components\modals\Register.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation"; // Keep Link for now, but not directly used for modal toggling
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utlis/firebaseConfig";

/**
 * Register Modal Component
 * @param {object} props
 * @param {function} props.onClose - Function to close the modal, passed from ModalContext.
 * @param {function} props.onLoginClick - Function to open the Login modal, passed from ModalContext.
 */
export default function Register({ onClose, onLoginClick }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const modalRef = useRef(null); // Ref for the modal DOM element
  const bsModalRef = useRef(null); // Ref for the Bootstrap Modal instance
  const isModalShownByBootstrap = useRef(false); // Track if Bootstrap has shown it

  // This ref will store the intent for what should happen *after* the modal hides.
  const pendingTransition = useRef(null); // e.g., 'loginClick', 'registerSuccess'

  // Handler for 'hidden.bs.modal' event
  const handleHiddenEvent = useCallback(() => {
    isModalShownByBootstrap.current = false;
    console.log("Register: 'hidden.bs.modal' event fired. pendingTransition:", pendingTransition.current); // DEBUG LOG

    // Execute the stored pending transition if any
    if (pendingTransition.current === 'loginClick') {
      console.log("Register: Executing loginClick transition (calling onLoginClick)."); // DEBUG LOG
      if (onLoginClick) onLoginClick();
    } else if (pendingTransition.current === 'registerSuccess') {
        console.log("Register: Executing registerSuccess transition (redirecting)."); // DEBUG LOG
        router.push("/my-account"); // Redirect after successful registration
    } else {
      console.log("Register: No specific pending transition, defaulting to onClose()."); // DEBUG LOG
    }

    // Always call onClose. This signals ModalContext to reset showRegisterModal to false.
    if (onClose) {
      onClose();
    }
    pendingTransition.current = null; // Reset
  }, [onClose, onLoginClick, router]); // Added router to dependencies

  // Handler for 'shown.bs.modal' event
  const handleShownEvent = useCallback(() => {
    console.log("Register: 'shown.bs.modal' event fired."); // DEBUG LOG
    isModalShownByBootstrap.current = true;
  }, []);

  // Effect to initialize and manage Bootstrap Modal lifecycle
  useEffect(() => {
    console.log("Register component mounted. Initializing Bootstrap modal."); // DEBUG LOG
    if (!modalRef.current) {
      console.warn("Register: modalRef.current is null on mount."); // DEBUG WARNING
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
        console.log("Register: Bootstrap Modal instance created."); // DEBUG LOG

        // Add event listeners
        modalRef.current.addEventListener('hidden.bs.modal', handleHiddenEvent);
        modalRef.current.addEventListener('shown.bs.modal', handleShownEvent);
        console.log("Register: Event listeners added."); // DEBUG LOG
      } else {
        bootstrapModalInstance = bsModalRef.current;
        console.log("Register: Bootstrap Modal instance already exists."); // DEBUG LOG
      }

      // Show the modal if it's not already visible
      if (modalRef.current && !isModalShownByBootstrap.current && !modalRef.current.classList.contains('show')) {
        bootstrapModalInstance.show();
        console.log("Register: bsModalRef.current.show() called on mount."); // DEBUG LOG
      } else {
        console.log("Register: Modal is already shown or in process of showing, skipping bsModalRef.current.show() on mount."); // DEBUG LOG
      }
    }).catch(err => console.error("Failed to load Bootstrap in Register modal:", err));

    // Cleanup function: This runs when the component unmounts
    return () => {
      console.log("Register: Component unmounting cleanup."); // DEBUG LOG
      // Remove event listeners before disposing
      if (modalRef.current && bsModalRef.current) {
          modalRef.current.removeEventListener('hidden.bs.modal', handleHiddenEvent);
          modalRef.current.removeEventListener('shown.bs.modal', handleShownEvent);
          console.log("Register: Event listeners removed during cleanup."); // DEBUG LOG
      }

      // Dispose the Bootstrap instance only when the component unmounts
      if (bsModalRef.current) {
        bsModalRef.current.dispose();
        bsModalRef.current = null;
        isModalShownByBootstrap.current = false;
        console.log("Register: Bootstrap Modal instance disposed during cleanup."); // DEBUG LOG
      }
    };
  }, [handleHiddenEvent, handleShownEvent]); // Dependencies


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Set loading state

    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      console.log("Registration successful!"); // DEBUG LOG
      // Set pending transition to redirect after modal hides
      pendingTransition.current = 'registerSuccess';
      if (bsModalRef.current) {
        console.log("Register: Calling bsModalRef.current.hide() for successful registration."); // DEBUG LOG
        bsModalRef.current.hide();
      }
      // router.push("/my-account"); // This is now handled in handleHiddenEvent
    } catch (err) {
      console.error("Registration error:", err); // Log full error
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please try logging in or use a different email.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed. An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log("Register: 'Already have account' clicked. Setting pendingTransition to 'loginClick'."); // DEBUG LOG
    pendingTransition.current = 'loginClick';
    if (bsModalRef.current) {
      bsModalRef.current.hide(); // This will trigger handleHiddenEvent
    }
  };

  return (
    <div
      className="modal modalCentered fade form-sign-in modal-part-content"
      id="register"
      tabIndex="-1" // Added for accessibility
      role="dialog"
      aria-labelledby="registerModalLabel" // Added for accessibility
      ref={modalRef} // Assign the ref to the modal div
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title" id="registerModalLabel">Register</div> {/* Added ID for aria-labelledby */}
            <span
              className="icon-close icon-close-popup"
              onClick={() => {
                console.log("Register: Close icon clicked. Calling bsModalRef.current.hide()."); // DEBUG LOG
                if (bsModalRef.current) {
                  bsModalRef.current.hide(); // This will trigger handleHiddenEvent (and then onClose)
                }
              }}
              style={{ cursor: 'pointer' }} // Add style for visual cue
              aria-label="Close" // Add for accessibility
            />
          </div>
          <div className="tf-login-form">
            <form onSubmit={handleSubmit} id="register-form">
              <div className="tf-field style-1">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={isLoading} // Disable input during loading
                />
                <label className="tf-field-label" htmlFor="">
                  First name
                </label>
              </div>
              <div className="tf-field style-1">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={isLoading} // Disable input during loading
                />
                <label className="tf-field-label" htmlFor="">
                  Last name
                </label>
              </div>
              <div className="tf-field style-1">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading} // Disable input during loading
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
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading} // Disable input during loading
                />
                <label className="tf-field-label" htmlFor="">
                  Password *
                </label>
              </div>
              {error && (
                <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
              )}
              <div className="bottom">
                <div className="w-100">
                  <button
                    type="submit"
                    className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                    disabled={isLoading} // Disable button during loading
                  >
                    <span>{isLoading ? "Registering..." : "Register"}</span>
                  </button>
                </div>
                <div className="w-100">
                  <a
                    href="#" // Change to # or remove if not navigating
                    onClick={handleLoginClick} // Use new handler
                    className="btn-link fw-6 w-100 link"
                  >
                    Already have an account? Log in here
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