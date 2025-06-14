"use client";
"use client";
import React, { useRef, useState } from "react";
import { db } from "@/utlis/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function ContactForm2() {
  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const sendMail = async () => {
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        reviewedStatus: false,
        createdAt: Timestamp.now(),
      });
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error adding document: ", error);
      setSuccess(false);
    }
    handleShowMessage();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  return (
    <section className="bg_grey-7 flat-spacing-9">
      <div className="container">
        <div className="flat-title">
          <span className="title">Get in Touch</span>
          <p className="sub-title text_black-2">
            If you're passionate about what you do and looking to grow your career with us, we'd love to hear from you.
          </p>
        </div>
        <div>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              sendMail();
            }}
            className="mw-705 mx-auto text-center form-contact"
          >
            <div className="d-flex gap-15 mb_15">
              <fieldset className="w-100">
                <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="Name *"
                      value={formData.name}
                      onChange={handleChange}
                    />
              </fieldset>
              <fieldset className="w-100">
               <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      autoComplete="abc@xyz.com"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleChange}
                    />
              </fieldset>
            </div>
            <div className="mb_15">
              <textarea
                    name="message"
                    id="message"
                    required
                    placeholder="Message"
                    cols={30}
                    rows={10}
                    value={formData.message}
                    onChange={handleChange}
                  />
            </div>
            <div className="send-wrap">
              <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
                {success ? (
                  <p style={{ color: "rgb(52, 168, 83)" }}>
                    Message has been sent successfully.
                  </p>
                ) : (
                  <p style={{ color: "red" }}>Something went wrong</p>
                )}
              </div>
              <button
                type="submit"
                className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
