"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/utlis/firebaseConfig";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        createdAt: new Date(),
        signInMethod: "email-password",
      });

      router.push("/my-account");
    } catch (err) {
      console.error("Firebase registration error:", err);
      // *** Enhanced Error Handling for Email Already In Use ***
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in, or use a different email address to register.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError("Registration failed. Please check your details and try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError(""); // Clear previous errors
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user data already exists in Firestore (for returning Google users)
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // If it's a new Google user, create their document in Firestore
        await setDoc(userDocRef, {
          firstName: user.displayName ? user.displayName.split(' ')[0] : '',
          lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
          email: user.email,
          createdAt: new Date(),
          signInMethod: "google",
        });
      }

      router.push("/my-account");
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google login was cancelled.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Another Google login pop-up is already open.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account with this email already exists using a different sign-in method. Please log in with that method (e.g., email/password).');
      }
      else {
        setError("Google login failed. Please try again.");
      }
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0 mb_30 px-0">
            <h5 className="mb_18">Register</h5>
            <p className="text_black-2">
              Sign up for early Sale access plus tailored new arrivals, trends
              and promotions. To opt out, click unsubscribe in our emails
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} id="register-form">
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  id="property1"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property1"
                >
                  First name
                </label>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  id="property2"
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property2"
                >
                  Last name
                </label>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  autoComplete="email"
                  id="property3"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property3"
                >
                  Email *
                </label>
              </div>
              <div className="tf-field style-1 mb_30">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="password"
                  id="property4"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property4"
                >
                  Password *
                </label>
              </div>
              {error && (
                <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
              )}
              <div className="mb_20">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                >
                  Register
                </button>
              </div>

              {/* Google Login Button */}
              <div className="mb_20">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="tf-btn w-100 radius-3 btn-line animate-hover-btn justify-content-center"
                  style={{
                    backgroundColor: '#DB4437', // Google Red
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 15px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src="https://img.icons8.com/color/24/000000/google-logo.png"
                    alt="Google icon"
                    style={{ width: '24px', height: '24px' }}
                  />
                  Register with Google
                </button>
              </div>


              <div className="text-center">
                <Link href={`/login`} className="tf-btn btn-line">
                  Already have an account? Log in here
                  <i className="icon icon-arrow1-top-left" />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}