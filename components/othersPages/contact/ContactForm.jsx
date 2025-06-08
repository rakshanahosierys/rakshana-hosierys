"use client";
import { socialLinksWithBorder } from "@/data/socials";
import React, { useRef, useState } from "react";
import { db } from "@/utlis/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function ContactForm() {
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
    <section className="flat-spacing-21">
      <div className="container">
        <div className="tf-grid-layout gap30 lg-col-2">
          <div className="tf-content-left">
            <h5 className="mb_20">Visit Our Store</h5>
            <div className="mb_20">
              <p className="mb_15">
                <strong>Address</strong>
              </p>
              <p>No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, Tiruppur, Tamil Nadu 641607</p>
            </div>
            <div className="mb_20">
              <p className="mb_15">
                <strong>Phone</strong>
              </p>
              <p>(+91) 94881 61177</p>
            </div>
            <div className="mb_20">
              <p className="mb_15">
                <strong>Email</strong>
              </p>
              <p>rakshanahosierys@gmail.com</p>
            </div>
            <div className="mb_36">
              <p className="mb_15">
                <strong>Hours</strong>
              </p>
              <p className="mb_15">Mon - Fri 9am - 8:30pm</p>
              <p>Sat - Sun Closed</p>
            </div>
            <div>
              <ul className="tf-social-icon d-flex gap-20 style-default">
                {socialLinksWithBorder.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className={`box-icon link round ${link.className} ${link.borderClass}`}
                    >
                      <i
                        className={`icon ${link.iconSize} ${link.iconClass}`}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="tf-content-right">
            <h5 className="mb_20">Get in Touch</h5>
            <p className="mb_24">
              If you're passionate about what you do and looking to grow your career with us, we'd love to hear from you.
            </p>
            <div>
              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMail();
                }}
                className="form-contact"
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
                <div
                  className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}
                >
                  {success ? (
                    <p style={{ color: "rgb(52, 168, 83)" }}>
                      Message has been sent successfully.
                    </p>
                  ) : (
                    <p style={{ color: "red" }}>Something went wrong</p>
                  )}
                </div>
                <div className="send-wrap">
                  <button
                    type="submit"
                    className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
