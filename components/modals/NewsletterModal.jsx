"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig";
export default function NewsletterModal() {
  const pathname = usePathname();
  const formRef = useRef();
  const modalElement = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const markModalDismissed = () => {
    localStorage.setItem("newsletterDismissedAt", Date.now().toString());
  };

  const sendEmail = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const email = e.target.email.value;

    try {
      // Save to Firestore
      await addDoc(collection(db, "subscribers"), {
        email,
        subscribedAt: Timestamp.now(),
        subStatus: true,
      });

      e.target.reset();
      setSuccess(true);
      handleShowMessage();
      markModalDismissed(); // Mark as dismissed
      const modal = window.bootstrap.Modal.getInstance(modalElement.current);
      modal?.hide();
    } catch (error) {
      console.error("Error:", error.response?.data || "An error occurred");
      setSuccess(false); // Set error state
      handleShowMessage();
      e.target.reset(); // Reset the form
    }
  };

  useEffect(() => {
    const showModal = async () => {
      const dismissedAt = localStorage.getItem("newsletterDismissedAt");
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Don't show if dismissed within last 24 hours
      if (dismissedAt && now - parseInt(dismissedAt) < oneDay) return;

      if (pathname === "/") {
        const bootstrap = await import("bootstrap"); // dynamically import bootstrap
        if (!modalElement.current) return;
        const myModal = new bootstrap.Modal(modalElement.current, {
          keyboard: true, // allow Esc to close
          backdrop: true, // allow clicking outside to close
        });

        // Show the modal after a delay using a promise
        await new Promise((resolve) => setTimeout(resolve, 2000));
        myModal.show();

        // Close buttons inside modal
        const hideButtons = modalElement.current.querySelectorAll(".btn-hide-popup");
        const cleanup = [];

        hideButtons.forEach((btn) => {
          const handler = () => {
            markModalDismissed();
            myModal.hide();
          };
          btn.addEventListener("click", handler);
          cleanup.push(() => btn.removeEventListener("click", handler));
        });

        // Catch all modal dismissals (backdrop, Esc, buttons)
        const modalHiddenHandler = () => {
          markModalDismissed();
        };
        modalElement.current.addEventListener("hidden.bs.modal", modalHiddenHandler);
        cleanup.push(() =>
          modalElement.current?.removeEventListener("hidden.bs.modal", modalHiddenHandler)
        );

        // Clean up on unmount
        return () => {
          cleanup.forEach((fn) => fn());
        };
      }
    };

    showModal();
  }, [pathname]);

  return (
    <div
      ref={modalElement}
      className="modal modalCentered fade auto-popup modal-newleter"
      id="newsletterPopup"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-top">
            <Image
              className="lazyload"
              data-src="/images/item/banner-newleter.jpg"
              alt="home-01"
              width={938}
              height={538}
              src="/images/item/banner-newleter.jpg"
            />
            <span
              className="icon icon-close btn-hide-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="modal-bottom">
            <h4 className="text-center">Don’t miss out</h4>
            <h6 className="text-center">
              Be the first one to get the new product at early bird prices.
            </h6>
            <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
              {success ? (
                <p style={{ color: "rgb(52, 168, 83)" }}>
                  You have successfully subscribed.
                </p>
              ) : (
                <p style={{ color: "red" }}>Something went wrong</p>
              )}
            </div>
            <form
              ref={formRef}
              onSubmit={sendEmail}
              className="form-newsletter"
              method="post"
              acceptCharset="utf-8"
              data-mailchimp="true"
            >
              <div id="subscribe-content">
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Email *"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="tf-btn btn-fill radius-3 animate-hover-btn w-100 justify-content-center"
                >
                  Keep me updated
                </button>
              </div>
              <div id="subscribe-msg" />
            </form>
            <div className="text-center">
              <a
                href="#"
                data-bs-dismiss="modal"
                className="tf-btn btn-line fw-6 btn-hide-popup"
              >
                Not interested
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
