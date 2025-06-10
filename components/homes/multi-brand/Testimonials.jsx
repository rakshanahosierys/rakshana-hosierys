// components/Testimonials.jsx
'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig"; // Ensure this path is correct

export default function Testimonials() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [productSlides, setProductSlides] = useState([]); // State for images in the thumbs swiper

  useEffect(() => {
    const fetchTestimonialsAndProducts = async () => {
      setIsLoadingTestimonials(true);
      try {
        // Step 1: Fetch featured reviews
        const reviewsCollectionRef = collection(db, 'reviews');
        const featuredReviewsQuery = query(reviewsCollectionRef, where('isFeatured', '==', true));
        const reviewSnapshot = await getDocs(featuredReviewsQuery);

        const reviewsData = reviewSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const productsDataMap = new Map();
        const productIdsToFetch = new Set(reviewsData.map(review => review.productId));

        // Step 2: Fetch corresponding product details for all unique productIds
        // This avoids redundant fetches if multiple reviews link to the same product
        if (productIdsToFetch.size > 0) {
          await Promise.all(
            Array.from(productIdsToFetch).map(async (productId) => {
              const productDocRef = doc(db, 'products', productId);
              const productDocSnap = await getDoc(productDocRef);
              if (productDocSnap.exists()) {
                productsDataMap.set(productId, { id: productDocSnap.id, ...productDocSnap.data() });
              } else {
                console.warn(`Product with ID ${productId} not found for a featured review.`);
              }
            })
          );
        }

        // Step 3: Combine review and product data
        const combinedTestimonials = reviewsData.map(review => {
          const product = productsDataMap.get(review.productId);
          return {
            ...review,
            // Add product image and title data to the testimonial object
            productImgSrc: product?.imgSrc || '/images/placeholder.jpg', // Fallback image
            productImgHoverSrc: product?.imgHoverSrc || '/images/placeholder-hover.jpg', // Fallback hover image
            productTitle: product?.title || 'Unknown Product',
            // Default dimensions, adjust as needed or fetch from product doc
            imgWidth: product?.imgWidth || 450,
            imgHeight: product?.imgHeight || 513,
          };
        }).filter(t => t.productImgSrc !== '/images/placeholder.jpg'); // Filter out testimonials without a found product (if placeholder is not desired)

        setFeaturedTestimonials(combinedTestimonials);

        // Step 4: Prepare slides for the thumbs swiper
        // This creates arrays of 3 images for each slide in the bottom swiper
        const imagesForSlides = combinedTestimonials.map(t => ({
          src: t.productImgSrc,
          alt: t.productTitle,
          width: t.imgWidth,
          height: t.imgHeight,
          // You might also want imgHoverSrc here if your layout uses it directly
        }));

        const groupedSlides = [];
        const imagesPerSlide = 3; // Or 4, based on your original `slides` structure
        for (let i = 0; i < imagesForSlides.length; i += imagesPerSlide) {
          groupedSlides.push({ images: imagesForSlides.slice(i, i + imagesPerSlide) });
        }
        setProductSlides(groupedSlides);

      } catch (error) {
        console.error("Error fetching testimonials or products:", error);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    fetchTestimonialsAndProducts();
  }, []); // Run once on component mount

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(<i key={i} className="icon-start active" />); // Assuming 'active' makes it filled
      } else {
        stars.push(<i key={i} className="icon-start" />); // Empty star
      }
    }
    return stars;
  };


  if (isLoadingTestimonials) {
    return (
      <section className="flat-testimonial-v2 py-0">
        <div className="container">
          <p>Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (featuredTestimonials.length === 0) {
    return (
      <section className="flat-testimonial-v2 py-0">
        <div className="container">
          <p>No featured testimonials available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flat-testimonial-v2 py-0 wow fadeInUp"
      data-wow-delay="0s"
    >
      <div className="container">
        <div className="wrapper-thumbs-testimonial-v2 type-1 flat-thumbs-testimonial">
          <div className="box-left">
            <Swiper
              dir="ltr"
              slidesPerView={1}
              spaceBetween={30}
              className="tf-sw-tes-2"
              breakpoints={{
                992: { spaceBetween: 40 },
                768: { spaceBetween: 30 },
              }}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Navigation, Pagination, Thumbs]}
              navigation={{
                prevEl: ".snbp302",
                nextEl: ".snbn302",
              }}
              pagination={{ clickable: true, el: ".spd302" }}
            >
              {featuredTestimonials.map((testimonial, index) => (
                <SwiperSlide key={testimonial.id || index}> {/* Use testimonial.id for key if available */}
                  <div className="testimonial-item lg lg-2">
                    <div className="icon">
                      <Image
                        className="lazyloaded"
                        data-src="/images/item/quote.svg"
                        src="/images/item/quote.svg"
                        alt="quote icon"
                        width={37}
                        height={25}
                      />
                    </div>
                    <div className="heading fs-12 mb_18">
                      PEOPLE ARE TALKING
                    </div>
                    <div className="rating">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text">
                      "{testimonial.comment}"
                    </p>
                    <div className="author box-author">
                      <div className="box-img d-md-none rounded-0">
                        {testimonial.productImgSrc && (
                          <Image
                            className="lazyload img-product"
                            data-src={testimonial.productImgSrc}
                            alt={testimonial.productTitle}
                            src={testimonial.productImgSrc}
                            width={testimonial.imgWidth}
                            height={testimonial.imgHeight}
                          />
                        )}
                      </div>
                      <div className="content">
                        <div className="name">{testimonial.userName}</div>
                        {testimonial.productId && ( // Only show link if productId exists
                          <Link
                            href={`/product-detail/${testimonial.productId}`}
                            className="metas link"
                          >
                            Purchase item :{" "}
                            <span>{testimonial.productTitle}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="d-md-flex d-none box-sw-navigation">
              <div className="nav-sw nav-next-slider nav-next-tes-2 snbp302">
                <span className="icon icon-arrow-left" />
              </div>
              <div className="nav-sw nav-prev-slider nav-prev-tes-2 snbn302">
                <span className="icon icon-arrow-right" />
              </div>
            </div>
            <div className="d-md-none sw-dots style-2 sw-pagination-tes-2 spd302" />
          </div>
          <div className="box-right">
            <Swiper
              dir="ltr"
              slidesPerView={1}
              spaceBetween={30}
              className="tf-thumb-tes"
              onSwiper={setThumbsSwiper}
              modules={[Thumbs]}
            >
              {productSlides.map((slide, index) => (
                <SwiperSlide key={index}>
                  <div className="grid-img-group style-ter-1">
                    {slide.images.map((image, idx) => (
                      <div
                        className={`box-img item-${idx + 1} hover-img testimonial-hover-skincare`}
                        key={idx}
                      >
                        <div className="img-style">
                          {image.src && (
                            <Image
                              className="lazyload"
                              data-src={image.src}
                              alt={image.alt}
                              src={image.src}
                              width={image.width}
                              height={image.height}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}