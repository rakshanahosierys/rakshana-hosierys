// components/modals/QuickView.jsx
'use client';

import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Quantity from "../shopDetails/Quantity";
import React, { useState, useEffect, useCallback } from "react"; // Import useEffect and useCallback
import { openCartModal } from "@/utlis/openCartModal";

// REMOVE THESE LOCAL IMPORTS:
// import { colors, sizeMonths } from "@/data/singleProductOptions";

export default function QuickView() {
  const {
    quickViewItem, // This should be the full product object from context
    addProductToCart,
    updateQuantity,
    isAddedToCartProducts,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

    const [quantity, setQuantity] = useState(1);
  
  // Initialize currentColor and currentSize based on quickViewItem
  // Use useEffect to update these when quickViewItem changes
  const [currentColor, setCurrentColor] = useState(null);
  const [currentSize, setCurrentSize] = useState(null);

  useEffect(() => {
    if (quickViewItem) {
      if (quickViewItem.colors && quickViewItem.colors.length > 0) {
        setCurrentColor(quickViewItem.colors[0]);
      } else {
        setCurrentColor(null);
      }
      if (quickViewItem.sizes && quickViewItem.sizes.length > 0) {
        setCurrentSize(quickViewItem.sizes[0]);
      } else {
        setCurrentSize(null);
      }
    } else {
      // Reset if quickViewItem becomes null (e.g., modal closes or unsets)
      setCurrentColor(null);
      setCurrentSize(null);
    }
  }, [quickViewItem]); // Re-run this effect when quickViewItem changes

  // Helper to safely format numbers to fixed decimals
  const toFixedSafe = useCallback((num, decimals = 2) => {
    if (typeof num === 'number' && !isNaN(num)) {
      return num.toFixed(decimals);
    }
    return '0.00';
  }, []);

  // Helper to calculate a single item's price considering discounts
  const calculateDisplayPrice = useCallback((product) => {
    if (!product || typeof product.price !== 'number' || isNaN(product.price)) {
      return { current: '0.00', original: null, hasDiscount: false };
    }

    let price = product.price;
    if (typeof product.discount === 'number' && product.discount > 0 && product.discount < 100) {
      const discountedPrice = price * (1 - product.discount / 100);
      return { current: discountedPrice.toFixed(2), original: price.toFixed(2), hasDiscount: true };
    }
    return { current: price.toFixed(2), original: null, hasDiscount: false };
  }, []);

  const openModalSizeChoice = async () => {
    // Dynamically import Bootstrap only when needed
    const bootstrap = await import("bootstrap");
    var myModal = new bootstrap.Modal(document.getElementById("find_size"), {
      keyboard: false,
    });

    myModal.show();
    document
      .getElementById("find_size")
      .addEventListener("hidden.bs.modal", () => {
        myModal.hide();
      });
    const backdrops = document.querySelectorAll(".modal-backdrop");
    if (backdrops.length > 1) {
      // Apply z-index to the last backdrop
      const lastBackdrop = backdrops[backdrops.length - 1];
      lastBackdrop.style.zIndex = "1057";
    }
  };

  // Render nothing or a loading state if quickViewItem is not available
  if (!quickViewItem) {
    return (
      <div className="modal fade modalDemo" id="quick_view">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="header">
              <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
            </div>
            <div className="wrap text-center py-5">
              <p>Loading product details...</p>
              {/* Or "No product selected for quick view." if it's not expected to load */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const prices = calculateDisplayPrice(quickViewItem);
  const mainImageSrc = quickViewItem.imgSrc || '/images/placeholder.jpg';
  const hoverImageSrc = quickViewItem.imgHoverSrc || quickViewItem.imgSrc || '/images/placeholder.jpg';

  return (
    <div className="modal fade modalDemo" id="quick_view">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="wrap">
            <div className="tf-product-media-wrap">
              <Swiper
                dir="ltr"
                modules={[Navigation]}
                navigation={{
                  prevEl: ".snbqvp",
                  nextEl: ".snbqvn",
                }}
                className="swiper tf-single-slide"
              >
                {/* Use quickViewItem.imgSrc and quickViewItem.imgHoverSrc directly */}
                {[
                  quickViewItem.imgSrc,
                  quickViewItem.imgHoverSrc || quickViewItem.imgSrc, // Fallback to main image if hover is missing
                ].map((imageSrc, index) => (
                  <SwiperSlide className="swiper-slide" key={index}>
                    <div className="item">
                      <Image
                        alt={quickViewItem.title || "product image"}
                        src={imageSrc || '/images/placeholder.jpg'} // Fallback for image src
                        width={720}
                        height={1045}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </SwiperSlide>
                ))}

                <div className="swiper-button-next button-style-arrow single-slide-prev snbqvp" />
                <div className="swiper-button-prev button-style-arrow single-slide-next snbqvn" />
              </Swiper>
            </div>
            <div className="tf-product-info-wrap position-relative">
              <div className="tf-product-info-list">
                <div className="tf-product-info-title">
                  <h5>
                    <Link
                      className="link"
                      href={`/product-detail/${quickViewItem.id}`}
                    >
                      {quickViewItem.title || "Untitled Product"}
                    </Link>
                  </h5>
                </div>
                <div className="tf-product-info-badges">
                  {/* Conditionally render badges based on Firestore data */}
                  {quickViewItem.isBestSeller && <div className="badges text-uppercase">Best seller</div>}
                  {quickViewItem.isNewArrival && <div className="badges text-uppercase">New Arrival</div>}
                  {quickViewItem.discount && typeof quickViewItem.discount === 'number' && quickViewItem.discount > 0 && (
                    <div className="badges text-uppercase">Sale</div>
                  )}
                  {quickViewItem.isAvailable === false && <div className="badges text-uppercase">Sold Out</div>}

                  {quickViewItem.isBestSeller ? 
                    <div className="product-status-content">
                      <i className="icon-lightning" />
                      <p className="fw-6">
                        Selling fast! Many people have this in their carts.
                      </p>
                    </div>
                   : ''}
                </div>
                <div className="tf-product-info-price">
                  {prices.hasDiscount ? (
                    <>
                      <div className="compare-at-price">₹{prices.original}</div>
                      <div className="price-on-sale fw-6">₹{prices.current}</div>
                    </>
                  ) : (
                    <div className="price">₹{prices.current}</div>
                  )}
                </div>
                <div className="tf-product-description">
                  <p>
                    {quickViewItem.description || "Adorn your little one in charm with Tinkle’s classy frocks and dresses. Perfect for every occasion, blending comfort with timeless style."}
                  </p>
                </div>
                <div className="tf-product-info-variant-picker">
                  {/* Color Variant Picker - Use quickViewItem.colors */}
                  {quickViewItem.colors && quickViewItem.colors.length > 0 && (
                    <div className="variant-picker-item">
                      <div className="variant-picker-label">
                        Color:
                        <span className="fw-6 variant-picker-label-value">
                          {currentColor?.name || 'Select Color'}
                        </span>
                      </div>
                      <form className="variant-picker-values">
                        {quickViewItem.colors.map((color, index) => (
                          <React.Fragment key={color.name || index}>
                            <input
                              id={`color-${color.name || index}`}
                              type="radio"
                              name="color1"
                              readOnly
                              checked={currentColor?.name === color.name}
                            />
                            <label
                              onClick={() => setCurrentColor(color)}
                              className="hover-tooltip radius-60"
                              htmlFor={`color-${color.name || index}`}
                              data-value={color.name}
                            >
                              <span className={`btn-checkbox ${color.colorClass || ''}`} />
                              <span className="tooltip">{color.name}</span>
                            </label>
                          </React.Fragment>
                        ))}
                      </form>
                    </div>
                  )}

                  {/* Size Variant Picker - Use quickViewItem.sizes */}
                  {quickViewItem.sizes && quickViewItem.sizes.length > 0 && (
                    <div className="variant-picker-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="variant-picker-label">
                          Size:
                          <span className="fw-6 variant-picker-label-value">
                            {currentSize || 'Select Size'}
                          </span>
                        </div>
                        <div
                          className="find-size btn-choose-size fw-6"
                          onClick={() => openModalSizeChoice()}
                        >
                          Find your size
                        </div>
                      </div>
                      <form className="variant-picker-values">
                        {quickViewItem.sizes.map((size, index) => (
                          <React.Fragment key={size || index}>
                            <input
                              type="radio"
                              name="size1"
                              id={`size-${size || index}`}
                              readOnly
                              checked={currentSize === size}
                            />
                            <label
                              onClick={() => setCurrentSize(size)}
                              className="style-text"
                              htmlFor={`size-${size || index}`}
                              data-value={size}
                            >
                              <p>{size}</p>
                            </label>
                          </React.Fragment>
                        ))}
                      </form>
                    </div>
                  )}
                </div>
                <div className="tf-product-info-quantity">
                  <div className="quantity-title fw-6">Quantity</div>
                  <Quantity setQuantity={setQuantity} />
                </div>
                <div className="fw-6 variant-picker-label-value">
              <span className="tf-qty-price">
                Estimate: &nbsp; ₹ {(
                  ((quickViewItem.price - (quickViewItem.price * quickViewItem.discount) / 100) || quickViewItem.price) * quantity
                ).toFixed(2)}
              </span>
            </div>
                <div className="tf-product-info-buy-button">
                  <form onSubmit={(e) => e.preventDefault()}>
                    {quickViewItem.isAvailable ? (
                      <>
                        <a
                          onClick={() => {
                            const status = isAddedToCartProducts(quickViewItem, currentColor, currentSize, quantity);
                            if (status === false) {
                              addProductToCart(quickViewItem, currentColor, currentSize, quantity || 1);
                              openCartModal();
                            } else if (status === "update") {
                              updateQuantity(quickViewItem, currentColor, currentSize, quantity);
                              openCartModal();
                            }
                          }}
                          className={`tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn ${isAddedToCartProducts(quickViewItem, currentColor, currentSize, quantity) === "same" ? "disabled" : ""
                            }`}
                        >
                          <span className="mr-2">
                            {isAddedToCartProducts(quickViewItem, currentColor, currentSize, quantity) === false
                              ? "Add to Cart"
                              : isAddedToCartProducts(quickViewItem, currentColor, currentSize, quantity) === "update"
                                ? "Update Quantity"
                                : "Already in Cart"}
                          </span>
                        </a>

                        <a
                          onClick={() => addToWishlist(quickViewItem.id)}
                          className="tf-product-btn-wishlist hover-tooltip box-icon bg_white wishlist btn-icon-action"
                        >
                          <span className={`icon icon-heart ${isAddedtoWishlist(quickViewItem.id) ? "added" : ""}`} />
                          <span className="tooltip">
                            {isAddedtoWishlist(quickViewItem.id)
                              ? "Already Wishlisted"
                              : "Add to Wishlist"}
                          </span>
                          <span className="icon icon-delete" />
                        </a>

                        <a
                          href="#compare"
                          data-bs-toggle="offcanvas"
                          onClick={() => addToCompareItem(quickViewItem.id)}
                          aria-controls="offcanvasLeft"
                          className="tf-product-btn-wishlist hover-tooltip box-icon bg_white compare btn-icon-action"
                        >
                          <span className={`icon icon-compare ${isAddedtoCompareItem(quickViewItem.id) ? "added" : ""}`} />
                          <span className="tooltip">
                            {isAddedtoCompareItem(quickViewItem.id)
                              ? "Already Compared"
                              : "Add to Compare"}
                          </span>
                          <span className="icon icon-check" />
                        </a>
                      </>
                    ) : (
                      <div className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn disabled">
                        Sold Out
                      </div>
                    )}
                  </form>
                </div>
                <div>
                  <Link
                    href={`/product-detail/${quickViewItem.id}`}
                    className="tf-btn fw-6 btn-line"
                  >
                    View full details
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}