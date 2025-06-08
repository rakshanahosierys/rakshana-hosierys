"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/utlis/firebaseConfig";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext"; // Assuming you have an AuthContext for user info

// Removed: import styles from './ProductReviews.module.scss';

export default function ProductReviews({ productId }) {
  const { user, isAuthenticated } = useAuth(); // Get current user from AuthContext
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState(null);

  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Function to fetch reviews for the current product
  const fetchReviews = async () => {
    setLoadingReviews(true);
    setReviewError(null);
    try {
      if (!db) {
        console.warn("Firestore 'db' instance is not available.");
        setLoadingReviews(false);
        return;
      }
      const reviewsRef = collection(db, "reviews");

      const subscribersRef = collection(db, "orders");
    const subscribersSnap = await getDocs(subscribersRef);

    subscribersSnap.forEach((doc) => {
      console.log(`ID: ${doc.id}`, doc.data());
    });

      // Query reviews for the specific productId, ordered by creation time
      const q = query(reviewsRef, where("productId", "==", productId), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to Date object for display
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewError("Failed to load reviews. Please try again.");
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch reviews when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]); // Re-fetch if productId changes

  // Handle new review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setSubmitError("");
    setSubmitSuccess("");

    if (!isAuthenticated || !user) {
      setSubmitError("You must be logged in to submit a review.");
      setSubmittingReview(false);
      return;
    }
    if (newReviewRating === 0) {
      setSubmitError("Please provide a rating.");
      setSubmittingReview(false);
      return;
    }
    if (newReviewText.trim() === "") {
      setSubmitError("Please write a comment for your review.");
      setSubmittingReview(false);
      return;
    }

    try {
      const reviewData = {
        productId: productId,
        userId: user.uid,
        userName: user.displayName || user.email || "Anonymous User", // Fallback name
        rating: newReviewRating,
        comment: newReviewText.trim(),
        createdAt: serverTimestamp(), // Use Firestore server timestamp
      };

      await addDoc(collection(db, "reviews"), reviewData);
      setSubmitSuccess("Review submitted successfully!");
      setNewReviewText(""); // Clear form
      setNewReviewRating(0); // Clear rating
      fetchReviews(); // Re-fetch reviews to show the new one
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitError("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="product-reviews-section">
      <h5 className="title mb-4">Customer Reviews ({reviews.length})</h5>

      {loadingReviews ? (
        <p>Loading reviews...</p>
      ) : reviewError ? (
        <p className="text-red-500">{reviewError}</p>
      ) : (
        <>
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="reviews-list space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="review-item border-b pb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <div className="font-semibold mr-2">{review.userName}</div>
                    {/* Display stars for existing reviews using direct class names */}
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          // Re-typed this line to ensure no hidden characters or syntax issues
                          className={`star ${review.rating >= star ? "filled" : "empty"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 ml-auto">
                      {review.createdAt?.toLocaleString('en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) || 'N/A'}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <h5 className="title mt-8 mb-4">Write a Review</h5>
      <form onSubmit={handleSubmitReview} className="review-form space-y-4">
        {submitError && <p className="text-red-500">{submitError}</p>}
        {submitSuccess && <p className="text-green-500">{submitSuccess}</p>}

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Your Rating:</label>
          <div className="flex space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                // Re-typed this line to ensure no hidden characters or syntax issues
                className={`star clickable-star ${newReviewRating >= star ? "filled" : "empty"}`}
                onClick={() => setNewReviewRating(star)} // Set rating on click
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">Your Review:</label>
          <textarea
            id="reviewText"
            className="w-full p-2 border rounded-md mt-1"
            rows="4"
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Write your review here..."
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center"
          disabled={submittingReview}
        >
          {submittingReview ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
