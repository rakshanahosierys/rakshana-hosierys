// E:\Compete\rakshanahosierys\context/ModalContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [resetPassEmail, setResetPassEmail] = useState("");

  const openLoginModal = useCallback(() => {
    // Ensure only one modal is open at a time
    setShowRegisterModal(false);
    setShowResetPassModal(false);
    setShowLoginModal(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setShowLoginModal(false); // Close Login if it's open
    setShowResetPassModal(false); // Close ResetPass if it's open
    setShowRegisterModal(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setShowRegisterModal(false);
  }, []);

  const openResetPassModal = useCallback((email = "") => {
    setShowLoginModal(false); // Close Login if it's open
    setShowRegisterModal(false); // Close Register if it's open
    setResetPassEmail(email);
    setShowResetPassModal(true);
  }, []);

  const closeResetPassModal = useCallback(() => {
    setShowResetPassModal(false);
    setResetPassEmail(""); // Clear email on close
  }, []);

  const value = {
    showLoginModal, openLoginModal, closeLoginModal,
    showRegisterModal, openRegisterModal, closeRegisterModal,
    showResetPassModal, openResetPassModal, closeResetPassModal, resetPassEmail
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}