"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy, // Import orderBy
} from "firebase/firestore";
import { auth, db } from "@/utlis/firebaseConfig"; // Ensure auth and db are imported

export default function MyReviews() {
  const [user, setUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Listen for Firebase authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        setUser(null);
        setUserReviews([]);
        // Optionally redirect to login if AuthGuard doesn't handle it
        return;
      }
      setUser(currentUser);
      // Fetch reviews once the user is authenticated
      fetchUserReviews(currentUser.uid);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribeAuth();
  }, []); // Empty dependency array means this effect runs once on mount

  // Function to fetch reviews for the authenticated user
  const fetchUserReviews = async (uid) => {
    setLoading(true);
    setError("");
    try {
      // 1. Query for all reviews by this user using a Collection Group Query
      // This assumes your reviews are stored in a subcollection named 'reviews'
      // under each product document (e.g., /products/{productId}/reviews/{reviewId}).
      // If your reviews are in a top-level collection, adjust the query accordingly.
      const reviewsQuery = query(
        collectionGroup(db, "reviews"), // Target all collections named 'reviews' across the database
        where("userId", "==", uid),     // Filter reviews belonging to the current user
        orderBy("createdAt", "desc")    // Order by creation date, most recent first
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);

      const reviewsData = [];
      const productIdsToFetch = new Set(); // Use a Set to store unique product IDs to avoid redundant fetches

      reviewsSnapshot.forEach((reviewDoc) => {
        const review = { id: reviewDoc.id, ...reviewDoc.data() };
        reviewsData.push(review);
        productIdsToFetch.add(review.productId); // Collect product IDs associated with these reviews
      });

      // 2. Fetch associated product details in parallel for efficiency
      const productsMap = new Map();
      if (productIdsToFetch.size > 0) {
        const productPromises = Array.from(productIdsToFetch).map(async (productId) => {
          const productDocRef = doc(db, "products", productId); // Reference to the product document
          const productSnap = await getDoc(productDocRef);
          if (productSnap.exists()) {
            // Store product data in a Map for quick lookup
            productsMap.set(productId, { id: productSnap.id, ...productSnap.data() });
          }
        });
        await Promise.all(productPromises); // Wait for all product fetches to complete
      }

      // 3. Combine review data with product data
      const combinedReviews = reviewsData.map((review) => ({
        ...review,
        product: productsMap.get(review.productId), // Attach the fetched product data to each review
      }));

      setUserReviews(combinedReviews);
    } catch (err) {
      console.error("Error fetching user reviews:", err);
      setError("Failed to load your reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="my-account-content my-reviews text-center">
        <p>Loading your reviews...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="my-account-content my-reviews text-center">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  // Main component render
  return (
    <div className="my-account-content my-reviews">
      <h5 className="fw-5 mb_20">My Reviews</h5>
      {userReviews.length === 0 ? (
        // Message if no reviews are found
        <p>You haven't submitted any reviews yet.</p>
      ) : (
        // Display the list of reviews
        <div className="review-list">
          {userReviews.map((review) => (
            <div key={review.id} className="review-item mb_30 p_10 border radius-10">
              {review.product ? (
                // Display product info if found
                <div className="product-info mb_10">
                  <Link href={`/product-detail/${review.product.id}`} className="d-flex align-items-center">
                    {/* Use product.imgSrc from the product data, fallback to product.imageUrl if needed */}
                    {review.product.imgSrc && (
                      <img
                        src={review.product.imgSrc} // Assuming imgSrc is the correct field for product image
                        alt={review.product.title || review.product.name || "Product Image"} // Use product.title or product.name
                        className="me_10"
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                      />
                    )}
                    <h6 className="product-name">{review.product.title || review.product.name}</h6> {/* Use product.title or product.name */}
                  </Link>
                </div>
              ) : (
                // Message if product details are not found for a review
                <p className="mb_10">**Product Not Found**</p>
              )}

              <div className="rating mb_5">
                {/* Render star rating based on review.rating */}
                {[...Array(5)].map((_, i) => (
                  <span // Changed from <i> to <span> for consistency with ProductReviews component
                    key={i}
                    // Use direct class names for star styling
                    className={`star ${i < review.rating ? "filled" : "empty"}`}
                    style={{ fontSize: '1.2rem', cursor: 'default' }} // Inline styles for display consistency
                  >
                    ★
                  </span>
                ))}
              </div>
              {/* Display review title if available, otherwise hide */}
              {review.title && <h6 className="review-title mb_5">{review.title}</h6>}
              <p className="review-comment text-muted mb_10">{review.comment}</p>
              <span className="review-date text-sm text-muted">
                {/* Format date to "Wednesday, 4 June 2025 05:30 PM" */}
                {review.createdAt?.toDate().toLocaleString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
