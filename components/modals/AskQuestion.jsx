"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/utlis/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function AskQuestion() {
  const pathname = usePathname();
  const productId = pathname.split("/").pop(); // e.g. KCyQw6PfHST9SytzhCJ0

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      await addDoc(collection(db, "queries"), {
        ...formData,
        productId,
        status: false,
        createdAt: Timestamp.now(),
      });

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Error submitting question:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal modalCentered fade modalDemo tf-product-modal modal-part-content"
      id="ask_question"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Ask a question</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <fieldset>
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </fieldset>

              <fieldset>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </fieldset>

              <fieldset>
                <label>Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </fieldset>

              <fieldset>
                <label>Message *</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </fieldset>

              <button
                type="submit"
                className="tf-btn w-100 btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                disabled={submitting}
              >
                <span>{submitting ? "Sending..." : "Send"}</span>
              </button>

              {success && (
                <p className="text-success text-center mt-2">
                  Message sent successfully!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}