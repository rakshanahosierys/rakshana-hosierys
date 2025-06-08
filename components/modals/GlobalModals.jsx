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
    showLoginModal, closeLoginModal, openLoginModal,
    showRegisterModal, closeRegisterModal, openRegisterModal,
    showResetPassModal, closeResetPassModal, openResetPassModal, resetPassEmail
  } = useModal();

  // Ref to track the previous pathname for route change detection
  const previousPathname = useRef(pathname);

  // Effect to close modals and offcanvases on route change
  useEffect(() => {
    // Only run the closing logic if the pathname actually changed from its previous value
    if (previousPathname.current !== pathname) {
      const closeAllModalsAndOffcanvas = async () => {
        if (typeof window !== "undefined") {
          try {
            const bootstrap = await import("bootstrap");
            document.querySelectorAll(".modal.show").forEach((modalElement) => {
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              if (modalInstance) {
                modalInstance.hide();
              } else {
                // Fallback for modals that might be 'show' but not fully initialized Bootstrap
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                modalElement.setAttribute('aria-hidden', 'true');
              }
            });
            document.querySelectorAll(".offcanvas.show").forEach((offcanvasElement) => {
              const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
              if (offcanvasInstance) {
                offcanvasInstance.hide();
              }
            });
          } catch (error) {
            console.error("GlobalModals: Error hiding Bootstrap modals/offcanvas:", error); // Keep errors
          }
        }
      };

      closeAllModalsAndOffcanvas();
      closeLoginModal();
      closeRegisterModal();
      closeResetPassModal();
    } else {
      console.log("GlobalModals: Pathname is the same. No full modal reset on route change."); // DEBUG LOG
    }

    // Update the ref for the next render cycle
    previousPathname.current = pathname;

  }, [pathname, closeLoginModal, closeRegisterModal, closeResetPassModal]);

  return (
    <>
      {showLoginModal && (
        <>
          {/* Debug log only, not rendered content */}
          <Login
            onClose={closeLoginModal}
            onForgotPasswordClick={openResetPassModal}
            onRegisterClick={openRegisterModal}
          />
        </>
      )}
      {showRegisterModal && (
        <>
          <Register
            onClose={closeRegisterModal}
            onLoginClick={openLoginModal}
          />
        </>
      )}
      {showResetPassModal && (
        <>
          <ResetPass
            onClose={closeResetPassModal}
            initialEmail={resetPassEmail}
            onLoginClick={openLoginModal}
          />
        </>
      )}
    </>
  );
}