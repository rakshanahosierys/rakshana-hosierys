"use client";

import { useState, useEffect } from "react"; // Import useState and useEffect
import { db } from "@/utlis/firebaseConfig"; // Import your Firestore instance
import { collection, getDocs, query, limit } from "firebase/firestore"; // Import Firestore functions
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard } from "../shopCards/ProductCard";
import { Navigation, Pagination } from "swiper/modules";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellerProducts = async () => {
      try {
        const productsCollectionRef = collection(db, "products"); // 'products' is your Firestore collection name
        const q = query(
          productsCollectionRef,
          where("isBestSeller", "==", true), // Query for best sellers
          limit(8) // Limit to 8 products
        );
        const querySnapshot = await getDocs(q);

        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id, // Firestore document ID
          ...doc.data() // All other fields from the document
        }));
        setProducts(productsData);
      } catch (err) {
        setError("Failed to fetch best seller products. Please check your Firestore connection and rules.");
        console.error("Error fetching best seller products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellerProducts();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <section className="flat-spacing-1 pt_0"><div className="container">Loading products...</div></section>;
  }

  if (error) {
    return <section className="flat-spacing-1 pt_0"><div className="container" style={{ color: 'red' }}>{error}</div></section>;
  }

  return (
    <section className="flat-spacing-1 pt_0">
      <div className="container">
        <div className="flat-title">
          <span className="title">People Also Bought</span>
        </div>
        <div className="hover-sw-nav hover-sw-2">
          <Swiper
            dir="ltr"
            className="swiper tf-sw-product-sell wrap-sw-over"
            slidesPerView={4}
            spaceBetween={30}
            breakpoints={{
              1024: {
                slidesPerView: 4,
              },
              640: {
                slidesPerView: 3,
              },
              0: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
            }}
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: ".snbp3070",
              nextEl: ".snbn3070",
            }}
            pagination={{ clickable: true, el: ".spd307" }}
          >
            {products.map((product, i) => ( // Use the fetched 'products' state
              <SwiperSlide key={product.id || i} className="swiper-slide"> {/* Use product.id as key if available, fallback to i */}
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-product box-icon w_46 round snbp3070">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-product box-icon w_46 round snbn3070">
            <span className="icon icon-arrow-right" />
          </div>
          <div className="sw-dots style-2 sw-pagination-product justify-content-center spd307" />
        </div>
      </div>
    </section>
  );
}