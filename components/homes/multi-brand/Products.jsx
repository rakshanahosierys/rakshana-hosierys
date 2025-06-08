"use client";

import React, { useEffect, useState } from "react"; // Import useState and useEffect
import { db } from "@/utlis/firebaseConfig"; // Import db from your Firebase config
import { collection, query, where, getDocs } from "firebase/firestore"; // Import Firestore functions
import { ProductCard } from "@/components/shopCards/ProductCard";
// Removed: import { products1 } from "@/data/products"; // No longer using local data
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);     // Add error state

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true); // Set loading to true when fetching starts
      setError(null);   // Clear any previous errors
      try {
        // Ensure db is initialized before querying
        if (!db) {
          console.warn("Firestore 'db' instance is not available.");
          setError("Firestore not initialized. Please check your Firebase configuration.");
          setLoading(false);
          return;
        }

        // Query the 'products' collection for documents where 'isFeatured' is true
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("isFeatured", "==", true));
        const querySnapshot = await getDocs(q);

        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id, // Include document ID as 'id'
          ...doc.data(), // Spread all other fields
        }));
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError(`Failed to load featured products: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false); // Set loading to false when fetching completes
      }
    };

    fetchFeaturedProducts();
  }, []); // Empty dependency array means this effect runs once on mount

  // Render loading state without skeleton shimmer effect
  if (loading) {
    return (
      <section className="flat-spacing-15 pb_0 text-center flex items-center justify-center h-64">
        <p>Loading products...</p>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section className="flat-spacing-15 pb_0 text-center flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  // Render if no featured products are found after loading
  if (products.length === 0) {
    return (
      <section className="flat-spacing-15 pb_0 text-center flex items-center justify-center h-64">
        <p>No featured products found at the moment.</p>
      </section>
    );
  }

  return (
    <section className="flat-spacing-15 pb_0">
      <div className="container">
        <div className="flat-title wow fadeInUp" data-wow-delay="0s">
          <span className="title">Classy’s Favorites</span>
          <p className="sub-title">
            Tailored for Women & Kids Who Dress to Impress.
          </p>
        </div>
        <div className="hover-sw-nav hover-sw-3">
          <Swiper
            dir="ltr"
            className="swiper tf-sw-product-sell wrap-sw-over"
            slidesPerView={4} // Equivalent to data-preview={4}
            spaceBetween={30} // Equivalent to data-space-lg={30}
            breakpoints={{
              1024: { slidesPerView: 4 },
              640: { slidesPerView: 3 },
              0: { slidesPerView: 2, spaceBetween: 15 },
            }}
            modules={[Navigation]}
            navigation={{
              prevEl: ".snbp301",
              nextEl: ".snbn301",
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="swiper-slide"> {/* Use product.id for key */}
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-product box-icon w_46 round snbp301">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-product box-icon w_46 round snbn301">
            <span className="icon icon-arrow-right" />
          </div>
        </div>
      </div>
    </section>
  );
}
