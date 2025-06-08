"use client";

import { useEffect, useState } from "react";
import { db } from "@/utlis/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);     // Add error state

  useEffect(() => {
    const fetchSlides = async () => {
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

        const q = query(collection(db, "heroSlides"), where("active", "==", true));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Use doc.id as a unique key
          ...doc.data(),
        }));
        setSlides(items);
      } catch (err) {
        console.error("Error fetching active hero slides:", err);
        setError("Failed to load hero slides. Please try again.");
      } finally {
        setLoading(false); // Set loading to false when fetching completes
      }
    };

    fetchSlides();
  }, []); // Empty dependency array means this effect runs once on mount

  // Display loading state or error message
  if (loading) {
    return (
      <div className="tf-slideshow slider-women slider-effect-fade position-relative flex items-center justify-center h-96">
        <p>Loading hero slides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tf-slideshow slider-women slider-effect-fade position-relative flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // If no slides are found after loading
  if (slides.length === 0) {
    return (
      <div className="tf-slideshow slider-women slider-effect-fade position-relative flex items-center justify-center h-96">
        <p>No active hero slides found.</p>
      </div>
    );
  }

  return (
    <div className="tf-slideshow slider-women slider-effect-fade position-relative">
      <Swiper
        dir="ltr"
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={false}
        loop={true}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        speed={1000}
        className="tf-sw-slideshow"
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true, el: ".spd300" }}
      >
        {slides.map((slide) => ( // Use slide.id for key
          <SwiperSlide key={slide.id}>
            <div className="wrap-slider">
              <Image
                // Removed data-src as Next.js Image component handles lazy loading
                alt={slide.imgAlt || "Hero Slide Image"} // Provide a fallback alt text
                src={slide.imgSrc}
                width={2000}
                height={732}
                priority // Mark as priority for LCP optimization
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/2000x732/eeeeee/cccccc?text=Image+Error'; // Fallback image on error
                  e.currentTarget.alt = 'Image failed to load';
                }}
              />
              <div className="box-content">
                <div className="container">
                  <h1 className="fade-item fade-item-1">{slide.heading}</h1>
                  <p className="fade-item fade-item-2">{slide.description}</p>
                  <Link
                    href={slide.buttonLink || "#"} // Fallback for buttonLink
                    className="fade-item fade-item-3 tf-btn btn-fill animate-hover-btn btn-xl radius-60"
                  >
                    <span>{slide.buttonText || "Shop Now"}</span> {/* Fallback for buttonText */}
                    <i className="icon icon-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sw-pagination-slider justify-content-center spd300" />
        </div>
      </div>
    </div>
  );
}
