"use client";

import useSWR from "swr"; // Import useSWR
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCard } from "@/components/shopCards/ProductCard"; // Adjust path as needed
import { Navigation, Pagination } from "swiper/modules";
import { getRecentlyViewedProducts } from "@/utlis/localStorageHelper"; // Import your helper

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// SWR Fetcher function for localStorage
// This function will be called by SWR when it needs to fetch the data.
const localStorageFetcher = (key) => {
  // The key here is 'recentlyViewedProducts' (or whatever you pass to useSWR)
  // We don't actually use the key within getRecentlyViewedProducts,
  // but SWR requires a key to identify the cached data.
  if (typeof window === "undefined") {
    return []; // Ensure it works safely during SSR
  }
  return getRecentlyViewedProducts();
};

export default function RecentProducts() {
  // useSWR takes a key and a fetcher function
  // The key 'recentlyViewedProducts-carousel' is just a unique string for SWR's cache.
  // We use the localStorageFetcher to retrieve the data.
  const { data: recentProducts, error, isLoading } = useSWR(
    "recentlyViewedProducts-carousel", // Unique key for this SWR hook instance
    localStorageFetcher,
    {
      // Optional SWR configurations:
      // revalidateOnFocus: true, // Default: revalidate when window regains focus
      // revalidateIfStale: true, // Default: revalidate even if data is stale
      // revalidateOnReconnect: true, // Default: revalidate when network comes back online
      // refreshInterval: 0, // No auto-polling needed for localStorage
      // dedupingInterval: 2000, // Debounce requests with the same key
      fallbackData: [], // Provide initial data while loading (optional, but good for local storage)
    }
  );

  if (isLoading) {
    return (
      <section className="flat-spacing-4 pt_0">
        <div className="container">
          <div className="flat-title">
            <span className="title">Recently Viewed</span>
          </div>
          <p>Loading your recently viewed products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing-4 pt_0">
        <div className="container">
          <div className="flat-title">
            <span className="title">Recently Viewed</span>
          </div>
          <p style={{ color: 'red' }}>Error loading recently viewed products: {error.message}</p>
        </div>
      </section>
    );
  }

  if (!recentProducts || recentProducts.length === 0) {
    return (
      <section className="flat-spacing-4 pt_0">
        <div className="container">
          <div className="flat-title">
            <span className="title">Recently Viewed</span>
          </div>
          <p>You haven't viewed any products recently.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing-4 pt_0">
      <div className="container">
        <div className="flat-title">
          <span className="title">Recently Viewed</span>
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
              prevEl: ".snbp308",
              nextEl: ".snbn308",
            }}
            pagination={{ clickable: true, el: ".spd308" }}
          >
            {recentProducts.map((product) => (
              <SwiperSlide key={product.id} className="swiper-slide">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-recent box-icon w_46 round snbp308">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-recent box-icon w_46 round snbn308">
            <span className="icon icon-arrow-right" />
          </div>
          <div className="sw-dots style-2 sw-pagination-recent justify-content-center spd308" />
        </div>
      </div>
    </section>
  );
}