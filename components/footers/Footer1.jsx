"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";
import { db } from "@/utlis/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

import { aboutLinks, footerLinks, paymentImages } from "@/data/footerLinks";
export default function Footer1({ bgColor = "" }) {
  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-moblie");

    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");

      parent.classList.toggle("open");
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", toggleOpen);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", toggleOpen);
      });
    };
  }, []); // Empty dependency array means this will run only once on mount

  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    try {
      // Save the subscriber in Firestore
      await addDoc(collection(db, "subscribers"), {
        email,
        subscribedAt: Timestamp.now(),
        subStatus: true,
      });

      e.target.reset();
      setSuccess(true);
      handleShowMessage();
    } catch (error) {
      console.error("Firestore error:", error);
      setSuccess(false);
      handleShowMessage();
      e.target.reset();
    }
  };

  return (
    <footer id="footer" className={`footer md-pb-70 ${bgColor}`}>
      <div className="footer-wrap">
        <div className="footer-body">
          <div className="container">
            <div className="row">
              <div className="col-xl-3 col-md-6 col-12">
                <div className="footer-infor">
                  <div className="footer-logo">
                    <Link href={`/`}>
                      <Image
                        alt="image"
                        src="/images/logo/logo.svg"
                        width="169"
                        height="21"
                      />
                    </Link>
                  </div>
                  <ul>
                    <li>
                      <p>No 18, 2nd St Ext, Appachi Nagar, Kongu Nagar, Tiruppur, Tamil Nadu 641607</p>
                    </li>
                    <li>
                      <p>
                        Email: <a href="#">rakshanahosierys@gmail.com</a>
                      </p>
                    </li>
                    <li>
                      <p>
                        Phone: <a href="#">(+91) 94881 61177</a>
                      </p>
                    </li>
                  </ul>
                  <Link href={`/reach-out`} className="tf-btn btn-line">
                    Get direction
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                  <ul className="tf-social-icon d-flex gap-10">
                    <li>
                      <a
                        href="https://www.instagram.com/classyfox_india"
                        className="box-icon w_34 round social-instagram social-line"
                      >
                        <i className="icon fs-14 icon-instagram" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6>Help</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6>Help</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {footerLinks.map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} className="footer-menu_item">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-xl-3 col-md-6 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6>About us</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6>About us</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {aboutLinks.slice(0, 4).map((link, index) => (
                    <li key={index}>
                      <Link href={link.href} className="footer-menu_item">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-xl-3 col-md-6 col-12">
                <div className="footer-newsletter footer-col-block">
                  <div className="footer-heading footer-heading-desktop">
                    <h6>Sign up for updates</h6>
                  </div>
                  <div className="footer-heading footer-heading-moblie">
                    <h6>Sign up for updates</h6>
                  </div>
                  <div className="tf-collapse-content">
                    <div className="footer-menu_item">
                      Sign up to get first dibs on new arrival, sales,
                      exzclusive offers and more!
                    </div>
                    <div
                      className={`tfSubscribeMsg ${showMessage ? "active" : ""
                        }`}
                    >
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
                      className="form-newsletter subscribe-form"
                      action="#"
                      method="post"
                      acceptCharset="utf-8"
                      data-mailchimp="true"
                    >
                      <div className="subscribe-content">
                        <fieldset className="email">
                          <input
                            required
                            type="email"
                            name="email"
                            className="subscribe-email"
                            placeholder="Enter your email...."
                            tabIndex={0}
                            aria-required="true"
                            autoComplete="abc@xyz.com"
                          />
                        </fieldset>
                        <div className="button-submit">
                          <button
                            className="subscribe-button tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                            type="submit"
                          >
                            Subscribe
                            <i className="icon icon-arrow1-top-left" />
                          </button>
                        </div>
                      </div>
                      <div className="subscribe-msg" />
                    </form>
                    <div className="tf-cur">
                      <div className="tf-currencies">
                        <CurrencySelect />
                      </div>
                      <div className="tf-languages">
                        <LanguageSelect />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-bottom-wrap d-flex gap-20 flex-wrap justify-content-between align-items-center">
                  <div className="footer-menu_item">
                    © {new Date().getFullYear()} Rakshana Hosierys. All Rights
                    Reserved
                  </div>
                  <div className="tf-payment">
                    {paymentImages.map((image, index) => (
                      <Image
                        key={index}
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        alt={image.alt}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
