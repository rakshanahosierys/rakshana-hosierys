"use client";

import React, { useState, useEffect } from "react"; // Import useState, useEffect
import { db } from "@/utlis/firebaseConfig"; // Ensure db is correctly imported
import { collection, getDocs, query, where } from "firebase/firestore"; // Import Firestore functions
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
// Removed: import { recentCollections } from "@/data/categories"; // No longer using local data

export default function BannerCollection() {
  const [midCollections, setMidCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMidCollections = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!db) {
          console.warn("Firestore 'db' instance is not available.");
          setError("Firestore not initialized. Please check your Firebase configuration.");
          setLoading(false);
          return;
        }

        const collectionsRef = query(collection(db, "midCollections"), where("active", "==", true));        
        const querySnapshot = await getDocs(collectionsRef);
        const fetchedCollections = querySnapshot.docs.map(doc => ({
          id: doc.id, // Include document ID
          ...doc.data(), // Include all other fields like imgSrc, imgAlt, heading
        }));
        setMidCollections(fetchedCollections);
      } catch (err) {
        console.error("Error fetching midCollections:", err);
        setError(`Failed to load collections: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMidCollections();
  }, [db]); // Depend on 'db' to ensure it's initialized

  if (loading) {
    return (
      <section className="flat-spacing-10 pb_0 flex items-center justify-center h-64">
        <p>Loading collections...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing-10 pb_0 text-center flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (midCollections.length === 0) {
    return (
      <section className="flat-spacing-10 pb_0 text-center flex items-center justify-center h-64">
        <p>No collections found at the moment.</p>
      </section>
    );
  }

  return (
    <section className="flat-spacing-10 pb_0">
      <div className="container">
        <Swiper
          dir="ltr"
          slidesPerView={2}
          spaceBetween={15}
          pagination={{ clickable: true }} // Fixed duplicate 'clickable' prop
          breakpoints={{
            0: { slidesPerView: 1 },
            700: { slidesPerView: 2 },
            992: { slidesPerView: 2 },
          }}
          className="tf-sw-recent"
        >
          {midCollections.map((item, index) => ( // Use fetched midCollections data
            <SwiperSlide key={item.id || index}> {/* Use item.id for unique key */}
              <div className="collection-item-v4 hover-img">
                <div className="collection-inner">
                  <Link
                    href={`/shop-default`}
                    className="collection-image img-style radius-10"
                  >
                    <Image
                      // Removed lazyload and data-src as next/image handles lazy loading automatically
                      src={item.imgSrc || "https://placehold.co/800x746/eeeeee/cccccc?text=Collection+Image"} // Use imgSrc from Firestore
                      alt={item.imgAlt || "Collection Image"} // Use imgAlt from Firestore
                      width={800} // Keep original dimensions
                      height={746} // Keep original dimensions
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/800x746/cccccc/eeeeee?text=Image+Error";
                        e.currentTarget.alt = "Image failed to load";
                      }}
                    />
                  </Link>
                  <div
                    className="collection-content wow fadeInUp"
                    data-wow-delay="0s"
                  >
                    <h5 className="heading text_white">{item.heading}</h5> {/* Heading from Firestore */}
                    <Link
                      href={`/shop-default`}
                      className="tf-btn style-3 fw-6 btn-light-icon rounded-full animate-hover-btn"
                    >
                      <span>Shop now</span>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
