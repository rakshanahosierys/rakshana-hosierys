// components/othersPages/dashboard/MyAccount.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  collectionGroup, // Import collectionGroup for reviews count
} from "firebase/firestore";
import { auth, db } from "@/utlis/firebaseConfig"; // Ensure db is imported from your firebaseConfig

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [firestoreUserData, setFirestoreUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderCount, setOrderCount] = useState(0); // State for order count
  const [reviewCount, setReviewCount] = useState(0); // State for review count

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        setUser(null);
        setFirestoreUserData(null);
        return;
      }
      setUser(currentUser);

      try {
        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setFirestoreUserData(docSnap.data());
        } else {
          console.warn("Firestore user document not found for UID:", currentUser.uid);
          setFirestoreUserData({
            firstName: currentUser.displayName ? currentUser.displayName.split(' ')[0] : '',
            lastName: currentUser.displayName ? currentUser.displayName.slice(currentUser.displayName.indexOf(' ') + 1) : '',
            email: currentUser.email,
            signInMethod: currentUser.providerData[0]?.providerId || 'unknown',
          });
        }

        // --- Fetch Order Count ---
        const ordersCollectionRef = collection(db, "orders");
        const ordersQuery = query(ordersCollectionRef, where("userId", "==", currentUser.uid));
        const ordersSnapshot = await getDocs(ordersQuery);
        setOrderCount(ordersSnapshot.size);

        // --- Fetch Reviews Count ---
        // Assuming reviews are in subcollections named 'reviews' under products
        const reviewsQuery = query(
          collectionGroup(db, "reviews"), // Query across all 'reviews' subcollections
          where("userId", "==", currentUser.uid) // Filter by current user's ID
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        setReviewCount(reviewsSnapshot.size); // Set the count of reviews

      } catch (err) {
        console.error("Error loading user data, orders, or reviews:", err);
        setError("Failed to load account data. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="my-account-content account-dashboard text-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-account-content account-dashboard text-center">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  // Determine the display name
  const displayFirstName = firestoreUserData?.firstName || "";
  const displayLastName = firestoreUserData?.lastName || "";
  const greetingName =
    (displayFirstName || displayLastName) ? `${displayFirstName} ${displayLastName}`.trim() : "Awesome User";

  return (
    <div className="my-account-content account-dashboard">
      <div className="mb_60">
        <h5 className="fw-5 mb_20">Hello, {greetingName}!</h5> {/* Personalized greeting */}
        <p>
          From your account dashboard you can view your{" "}
          <Link className="text_primary" href={`/my-account-orders`}>
            recent orders
          </Link>
          , manage your{" "}
          <Link className="text_primary" href={`/my-account-edit`}>
            shipping and billing addresses
          </Link>
          , and{" "}
          <Link className="text_primary" href={`/my-account-edit`}>
            edit your password and account details
          </Link>
          .
        </p>
      </div>

      {/* --- Account Stats Section --- */}
      <div className="tf-grid-layout lg-col-3 tf-account-stats">
        {/* Total Orders Card */}
        <div className="tf-card style-1">
          <div className="icon">
            <i className="fas fa-box"></i>
          </div>
          <div className="content">
            <h6 className="title mb_5">Total Orders</h6>
            <div className="count">{orderCount}</div>
          </div>
        </div>

        {/* Reviews Given Card */}
        <div className="tf-card style-1">
          <div className="icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="content">
            <h6 className="title mb_5">Reviews Given</h6>
            <div className="count">{reviewCount}</div> {/* Display actual review count */}
          </div>
        </div>
        
        {/* End of Placeholder Stats */}
      </div>
    </div>
  );
}