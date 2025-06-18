"use client";

import { useEffect, useState } from "react";
import { db } from "@/utlis/firebaseConfig"; // Ensure db is correctly imported
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore"; // Import necessary Firestore functions, including doc and getDoc
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";

export default function Categories2() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);     // Add error state

  useEffect(() => {
    const fetchCategories = async () => {
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

        // Reference to the 'productFilter' document within the 'metadata' collection
        const productFilterDocRef = doc(db, "metadata", "productFilters"); // Corrected to "productFilters" based on previous context
        const productFilterSnap = await getDoc(productFilterDocRef);

        let fetchedCategories = [];
        if (productFilterSnap.exists()) {
          const data = productFilterSnap.data();
          const filteredFirestoreCategories = (data.categories || []).filter(cat => cat.name !== "Men");
          // Assuming the categories are stored in a field named 'categories' within this document
          // And that 'categories' is an array of objects with id, image, link, name
          fetchedCategories = filteredFirestoreCategories.map(cat => ({
            id: cat.id,
            imgSrc: cat.image, // Map Firestore 'image' to component 'imgSrc'
            link: cat.link,
            title: cat.name,   // Map Firestore 'name' to component 'title'
            alt: cat.alt || cat.name || "Category Image" // Use 'alt' if available, otherwise 'name'
          }));
        } else {
          console.warn("Product filter metadata not found. Displaying only default categories.");
          setError("Product filter metadata not found. Showing default entries.");
        }

        // Add "New Arrival" as the last category
        const newArrivalCategory = {
          id: "new-arrival", // Unique ID for New Arrival
          imgSrc: "/images/shop/cate/new-arrivals.jpg", // Placeholder image for New Arrival
          link: `/shop-default?filter=${encodeURIComponent("New Arrivals")}`, // Link to a New Arrival page/filter
          title: "New Arrival",
          alt: "Discover the latest fashion and newest arrivals"
        };
        fetchedCategories.push(newArrivalCategory);

        // Optional: If you need to sort them, you can do it here in memory
        // fetchedCategories.sort((a, b) => (a.order || 0) - (b.order || 0)); // Re-add 'order' field if you use it

        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Error fetching categories from metadata:", err);
        setError(`Failed to load categories: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false); // Set loading to false when fetching completes
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this effect runs once on mount

  // Display loading state
  if (loading) {
    return (
      <section className="flat-spacing-5 pb_0 flex items-center justify-center h-64">
        <p>Loading categories...</p>
      </section>
    );
  }

  // Display error state
  if (error) {
    return (
      <section className="flat-spacing-5 pb_0 flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  // If no categories are found after loading (should not happen with "New Arrival" added)
  if (categories.length === 0) {
    return (
      <section className="flat-spacing-5 pb_0 flex items-center justify-center h-64">
        <p>No categories found.</p>
      </section>
    );
  }

  return (
    <section className="flat-spacing-5 pb_0">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp" data-wow-delay="0s">
            Categories you might like
          </span>
        </div>
        <div className="hover-sw-nav">
          <Swiper
            dir="ltr"
            slidesPerView={4}
            spaceBetween={15}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            loop={true} // This enables infinite looping for the carousel
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            speed={1000} // Added speed for smoother transitions
            className="tf-sw-collection"
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: ".snbp299",
              nextEl: ".snbn299",
            }}
            pagination={{ clickable: true, el: ".spd299" }}
          >
            {categories.map((collectionItem) => (
              <SwiperSlide key={collectionItem.id}> {/* Use collectionItem.id for key */}
                <div className="collection-item style-2 hover-img">
                  <div className="collection-inner">
                    <Link
                      href={collectionItem.link || `/shop-default`} // Use collectionItem.link from Firestore, fallback to /shop-default
                      className="collection-image img-style"
                    >
                      <Image
                        className="lazyload"
                        alt={collectionItem.alt || collectionItem.title || "Category Image"} // Fallback alt text
                        src={collectionItem.imgSrc}
                        width={360}
                        height={432}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/360x432/eeeeee/cccccc?text=Image+Error'; // Fallback image on error
                          e.currentTarget.alt = 'Image failed to load';
                        }}
                      />
                    </Link>
                    <div className="collection-content">
                      <Link
                        href={collectionItem.link || `/shop-default`} // Use collectionItem.link from Firestore, fallback to /shop-default
                        className="tf-btn collection-title hover-icon fs-15 rounded-full"
                      >
                        <span>{collectionItem.title}</span>
                        <i className="icon icon-arrow1-top-left" />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-collection box-icon w_46 round snbp299">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-collection box-icon w_46 round snbn299">
            <span className="icon icon-arrow-right" />
          </div>
          <div className="sw-dots style-2 sw-pagination-collection justify-content-center spd299" />
        </div>
      </div>
    </section>
  );
}
