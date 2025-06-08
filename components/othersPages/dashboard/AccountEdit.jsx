// components/othersPages/dashboard/AccountEdit.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/utlis/firebaseConfig"; // Ensure db is imported

export default function AccountEdit() {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth User object
  const [firestoreUserData, setFirestoreUserData] = useState(null); // Data from Firestore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states for name and email
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // States to hold the original values for comparison
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false); // General loading for save changes button

  // --- Derived state: Check if any changes have been made to name fields ---
  const hasNameChanges =
    firstName !== originalFirstName || lastName !== originalLastName;


  // --- Fetch user data on component mount and auth state change ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setEmail(user.email || ""); // Set email from auth user

        // Fetch custom user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFirestoreUserData(data);
            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            // Set original values here for comparison
            setOriginalFirstName(data.firstName || "");
            setOriginalLastName(data.lastName || "");
          } else {
            // Fallback for users without a Firestore doc (e.g., very old Google logins)
            console.warn("Firestore user document not found for UID:", user.uid);
            const displayFName = user.displayName ? user.displayName.split(' ')[0] : '';
            const displayLName = user.displayName ? user.displayName.slice(user.displayName.indexOf(' ') + 1) : '';
            
            setFirestoreUserData({
              firstName: displayFName,
              lastName: displayLName,
              email: user.email,
              signInMethod: user.providerData[0]?.providerId || 'unknown', // Default to first provider or 'unknown'
            });
            setFirstName(displayFName);
            setLastName(displayLName);
            setOriginalFirstName(displayFName);
            setOriginalLastName(displayLName);
          }
        } catch (err) {
          console.error("Error fetching Firestore user data:", err);
          setError("Failed to load user profile.");
        }
      } else {
        // User is logged out, clear states
        setCurrentUser(null);
        setFirestoreUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Handle saving name and email changes ---
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsUpdating(true); // Start loading

    if (!currentUser || !firestoreUserData) {
      setError("User data not loaded.");
      setIsUpdating(false);
      return;
    }

    // Only proceed if there are actual changes to name
    if (!hasNameChanges) {
        setSuccessMessage("No changes to save.");
        setIsUpdating(false);
        return;
    }

    try {
      // 1. Update Firebase Auth profile (displayName)
      const fullName = `${firstName} ${lastName}`.trim();
      if (currentUser.displayName !== fullName) { // Only update if display name changed
        await updateProfile(currentUser, { displayName: fullName });
      }

      // 2. Update Firestore document (firstName, lastName)
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        firstName: firstName,
        lastName: lastName,
      });

      // Update original values to reflect the new saved state
      setOriginalFirstName(firstName);
      setOriginalLastName(lastName);

      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false); // End loading
    }
  };

  // --- Handle password change ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess("");
    setIsUpdating(true); // Use general loading state for password change too

    if (!currentUser) {
      setPasswordChangeError("User not authenticated.");
      setIsUpdating(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New passwords do not match.");
      setIsUpdating(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError("New password must be at least 6 characters long.");
      setIsUpdating(false);
      return;
    }

    try {
      // Re-authenticate user before changing password for security
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Now update the password
      await updatePassword(currentUser, newPassword);
      setPasswordChangeSuccess("Password updated successfully!");
      // Clear password fields after successful update
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.code === 'auth/wrong-password') {
        setPasswordChangeError('Incorrect current password.');
      } else if (err.code === 'auth/requires-recent-login') {
        setPasswordChangeError('Please re-enter your current password and try again.');
      } else if (err.code === 'auth/weak-password') {
        setPasswordChangeError('The new password is too weak. Please choose a stronger one.');
      } else {
        setPasswordChangeError("Failed to change password. Please try again.");
      }
    } finally {
      setIsUpdating(false); // End loading
    }
  };

  if (loading) {
    return (
      <div className="my-account-content account-edit text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Determine the sign-in method
  const userSignInMethod = firestoreUserData?.signInMethod || currentUser?.providerData[0]?.providerId || 'email-password';


  return (
    <div className="my-account-content account-edit">
      {successMessage && (
        <div style={{ color: "green", marginBottom: "15px", textAlign: "center" }}>
          {successMessage}
        </div>
      )}
      {error && (
        <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
          {error}
        </div>
      )}

      {/* Profile Information */}
      <h5 className="mb_24">Profile Information</h5>
      <p className="mb_20">
        <strong>Login Type:</strong>{" "}
        {userSignInMethod.charAt(0).toUpperCase() + userSignInMethod.slice(1).replace('-', ' ')}
      </p>

      <form onSubmit={handleSaveChanges} className="" id="form-profile-edit">
        <div className="tf-field style-1 mb_15">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            id="firstName"
            required
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="firstName">
            First name
          </label>
        </div>
        <div className="tf-field style-1 mb_15">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            required
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="lastName">
            Last name
          </label>
        </div>
        <div className="tf-field style-1 mb_15">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="email"
            autoComplete="email"
            id="email"
            name="email"
            value={email}
            disabled // Email is usually not changeable from here directly
          />
          <label className="tf-field-label fw-4 text_black-2" htmlFor="email">
            Email
          </label>
        </div>
        <div className="mb_20">
          <button
            type="submit"
            className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
            // Button is disabled if:
            // 1. An update is already in progress (`isUpdating`)
            // 2. Or, there are no changes to save (`!hasNameChanges`)
            disabled={isUpdating || !hasNameChanges}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* --- Password Change Section (Conditional) --- */}
      {userSignInMethod === "email-password" && (
        <div className="mt-8">
          <h6 className="mb_20">Password Change</h6>
          <form onSubmit={handleChangePassword} className="" id="form-password-change">
            {passwordChangeSuccess && (
              <p style={{ color: "green", marginBottom: "10px" }}>{passwordChangeSuccess}</p>
            )}
            {passwordChangeError && (
              <p style={{ color: "red", marginBottom: "10px" }}>{passwordChangeError}</p>
            )}
            <div className="tf-field style-1 mb_30">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="password"
                required
                autoComplete="current-password"
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="currentPassword">
                Current password
              </label>
            </div>
            <div className="tf-field style-1 mb_30">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="password"
                id="newPassword"
                required
                autoComplete="new-password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="newPassword">
                New password
              </label>
            </div>
             <div className="tf-field style-1 mb_30">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="password"
                id="confirmNewPassword"
                required
                autoComplete="new-password"
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)} // <-- Only this line should remain
              />
              <label className="tf-field-label fw-4 text_black-2" htmlFor="confirmNewPassword">
                Confirm new password
              </label>
            </div>
            <div className="mb_20">
              <button
                type="submit"
                className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}