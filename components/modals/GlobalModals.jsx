// E:\Compete\rakshanahosierys\components\modals/GlobalModals.jsx
"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useModal } from "@/context/ModalContext";
import Login from "@/components/modals/Login";
import Register from "@/components/modals/Register";
import ResetPass from "@/components/modals/ResetPass";

export default function GlobalModals() {
  const pathname = usePathname();
  const {
    showLoginModal, closeLoginModal, openLoginModal, // keep openLoginModal if needed by other modals
    showRegisterModal, closeRegisterModal, openRegisterModal,
    showResetPassModal, closeResetPassModal, openResetPassModal, resetPassEmail
  } = useModal();

  // Ref to track the previous pathname for route change detection
  const previousPathname = useRef(pathname);

  // Effect to close modals and offcanvases on route change
  useEffect(() => {
    // Only run the closing logic if the pathname actually changed from its previous value
    if (previousPathname.current !== pathname) {
      console.log("GlobalModals: Pathname changed. Initiating modal/offcanvas cleanup.");

      // --- Handle Offcanvas specifically if you still need to close them on route change ---
      // Offcanvas usually don't have a React component managing their state like modals.
      // So, directly interacting with Bootstrap for them is often necessary and correct.
      if (typeof window !== "undefined") {
        import("bootstrap").then((bootstrap) => {
          document.querySelectorAll(".offcanvas.show").forEach((offcanvasElement) => {
            const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (offcanvasInstance) {
              offcanvasInstance.hide();
            }
          });
        }).catch(error => {
          console.error("GlobalModals: Error hiding Bootstrap offcanvas on route change:", error);
        });
      }

      // --- CRITICAL: Close all modals by setting their context state to false. ---
      // The individual modal components (Login, Register, ResetPass) are now
      // responsible for calling Bootstrap's .hide() and then notifying the context
      // via their own `onClose` prop (which they receive from here).
      // If a modal component is currently mounted, setting its state to false will
      // trigger its unmount, and its useEffect cleanup will ensure Bootstrap dispose.
      // If a modal is not mounted, these calls do nothing, which is fine.
      closeLoginModal();
      closeRegisterModal();
      closeResetPassModal();

      // IMPORTANT: After `closeLoginModal()` is called, Login.jsx *will be unmounted*.
      // Thus, its `bsModalRef.current.hide()` won't be called from a global
      // route change effect. This is why the Login.jsx needs to handle its
      // own `hide()` call based on user interaction.
      // For a route change, simply setting the React state to `false` is the correct
      // way to "close" it from the `GlobalModals` perspective.

    } else {
      console.log("GlobalModals: Pathname is the same. No full modal reset on route change.");
    }

    // Update the ref for the next render cycle
    previousPathname.current = pathname;

  }, [pathname, closeLoginModal, closeRegisterModal, closeResetPassModal]); // Add all close functions to dependency array

  return (
    <>
      {showLoginModal && (
        <Login
          onClose={closeLoginModal}
          onForgotPasswordClick={openResetPassModal}
          onRegisterClick={openRegisterModal}
        />
      )}
      {showRegisterModal && (
        <Register
          onClose={closeRegisterModal}
          onLoginClick={openLoginModal}
        />
      )}
      {showResetPassModal && (
        <ResetPass
          onClose={closeResetPassModal}
          initialEmail={resetPassEmail}
          onLoginClick={openLoginModal}
        />
      )}
    </>
  );
}