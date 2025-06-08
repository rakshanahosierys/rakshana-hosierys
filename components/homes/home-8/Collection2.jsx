"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/utlis/firebaseConfig"; // Ensure db is correctly imported
import { collection, getDocs, query, where, limit } from "firebase/firestore";

export default function Collection2() {
  const [collectionItem, setCollectionItem] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);     // Add error state

  useEffect(() => {
    const fetchCollectionItem = async () => {
      setLoading(true); // Set loading to true when fetching starts
      setError(null);   // Clear previous errors
      try {
        // Ensure db is initialized before querying
        if (!db) {
          console.warn("Firestore 'db' instance is not available.");
          setError("Firestore not initialized.");
          setLoading(false);
          return;
        }

        // Query for one active document from the 'topCollections' collection
        const q = query(
          collection(db, "topCollections"),
          where("active", "==", true),
          limit(1) // Limit to only one document
        );
        const snapshot = await getDocs(q);
        const doc = snapshot.docs[0]; // Get the first document if it exists

        if (doc) {
          setCollectionItem({ id: doc.id, ...doc.data() });
        } else {
          // If no active collection item is found
          setCollectionItem(null);
          setError("No active collection item found.");
        }
      } catch (err) {
        console.error("Error fetching top collection:", err);
        setError(`Failed to load collection: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false); // Set loading to false when fetching completes
      }
    };

    fetchCollectionItem();
  }, []); // Empty dependency array means this effect runs once on mount

  // Display loading state
  if (loading) {
    return (
      <section className="pt_0 flex items-center justify-center h-64">
        <p>Loading collection details...</p>
      </section>
    );
  }

  // Display error state
  if (error) {
    return (
      <section className="pt_0 flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  // If no collection item is found after loading (and no error)
  if (!collectionItem) {
    return (
      <section className="pt_0 flex items-center justify-center h-64">
        <p>No collection content available.</p>
      </section>
    );
  }

  return (
    <section className="pt_0">
      <div className="container">
        <div className="tf-grid-layout md-col-2 tf-img-with-text style-1">
          <div className="tf-image-wrap wow fadeInUp" data-wow-delay="0s">
            <Image
              // Removed data-src as Next.js Image component handles lazy loading
              alt={collectionItem.imgAlt || "Collection Image"} // Fallback alt text
              src={collectionItem.imgSrc}
              width={600}
              height={448}
              // priority // Consider adding priority if this image is above the fold
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x448/eeeeee/cccccc?text=Image+Error'; // Fallback image on error
                e.currentTarget.alt = 'Image failed to load';
              }}
            />
          </div>
          <div
            className="tf-content-wrap text-center w-100 wow fadeInUp"
            data-wow-delay="0s"
          >
            <span className="sub-heading text-uppercase fw-7">
              {collectionItem.subHeading || "WELCOME TO"} {/* Fallback text */}
            </span>
            <div className="heading">{collectionItem.heading || "Our Collection"}</div> {/* Fallback text */}
            <p className="description">
              {/* Process description to handle newlines */}
              {collectionItem.description ? (
                collectionItem.description.replace(/\\n/g, "\n").split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))
              ) : (
                "No description available." // Fallback text for description
              )}
            </p>
            <Link
              href={collectionItem.buttonLink || "/about-us"} // Fallback link
              className="tf-btn style-2 btn-fill radius-3 animate-hover-btn"
            >
              {collectionItem.buttonText || "About Us"} {/* Fallback text */}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
