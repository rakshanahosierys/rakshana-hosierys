// components/modals/QuickAdd.jsx
'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Quantity from "../shopDetails/Quantity";
import { useContextElement } from "@/context/Context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig";
import { openCartModal } from "@/utlis/openCartModal";

export default function QuickAdd() {
  const {
    quickAddItem, // This is the ID passed from context
    addProductToCart,
    updateQuantity,
    isAddedToCartProducts,
    addToCompareItem,
    isAddedtoCompareItem,
    addToWishlist,
    isAddedtoWishlist,
  } = useContextElement();

  const [quantity, setQuantity] = useState(1);

  const [item, setItem] = useState(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [currentColor, setCurrentColor] = useState(null);
  const [currentSize, setCurrentSize] = useState(null);

  // Effect to fetch the specific product when quickAddItem (ID) changes
  useEffect(() => {
    const fetchProduct = async () => {
      // --- CRITICAL FIX HERE ---
      // Ensure quickAddItem is a non-empty string before proceeding
      if (typeof quickAddItem !== 'string' || quickAddItem.trim() === '') {
        console.warn("QuickAdd: Invalid product ID received. Type:", typeof quickAddItem, "Value:", quickAddItem);
        setItem(null); // Reset item if ID is invalid
        setIsLoadingItem(false); // Stop loading state
        return; // Exit the effect if the ID is invalid
      }
      // --- END CRITICAL FIX ---

      setIsLoadingItem(true);
      try {
        const productRef = doc(db, 'products', quickAddItem); // This line requires quickAddItem to be a string
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = { id: productSnap.id, ...productSnap.data() };
          setItem(productData);

          if (productData.colors && productData.colors.length > 0) {
            setCurrentColor(productData.colors[0]);
          } else {
            setCurrentColor(null);
          }
          if (productData.sizes && productData.sizes.length > 0) {
            setCurrentSize(productData.sizes[0]);
          } else {
            setCurrentSize(null);
          }
        } else {
          console.warn(`QuickAdd: Product with ID ${quickAddItem} not found in Firestore.`);
          setItem(null);
        }
      } catch (error) {
        console.error(`QuickAdd: Error fetching product ${quickAddItem}:`, error);
        setItem(null);
      } finally {
        setIsLoadingItem(false);
      }
    };

    fetchProduct();
  }, [quickAddItem]); // Rerun effect whenever quickAddItem changes

  // Render a loading state or nothing if item is not yet loaded or not found
  if (isLoadingItem) {
    return (
      <div className="modal fade modalDemo" id="quick_add">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="header">
              <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
            </div>
            <div className="wrap text-center py-5">Loading product details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="modal fade modalDemo" id="quick_add">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="header">
              <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
            </div>
            <div className="wrap text-center py-5">Product not found.</div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate display price including discount
  const calculateDisplayPrice = (price, discount) => {
    if (typeof price !== 'number') return { current: '0.00', original: null, hasDiscount: false };

    if (typeof discount === 'number' && discount > 0 && discount < 100) {
      const discountedPrice = price * (1 - discount / 100);
      return { current: discountedPrice.toFixed(2), original: price.toFixed(2), hasDiscount: true };
    }
    return { current: price.toFixed(2), original: null, hasDiscount: false };
  };

  const prices = calculateDisplayPrice(item.price, item.discount);
  const mainImageSrc = item.imgSrc || '/images/placeholder.jpg';

  return (
    <div className="modal fade modalDemo" id="quick_add">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="wrap">
            <div className="tf-product-info-item">
              <div className="image">
                <Image
                  alt={item.title || "product image"}
                  style={{ objectFit: "contain" }}
                  src={mainImageSrc}
                  width={720}
                  height={1005}
                />
              </div>
              <div className="content">
                <Link href={`/product-detail/${item.id}`}>{item.title || "Untitled Product"}</Link>
                <div className="tf-product-info-price">
                  {prices.hasDiscount ? (
                    <>
                      <div className="compare-at-price">
                        ₹{prices.original}
                      </div>
                      <div className="price-on-sale fw-6">
                        ₹{prices.current}
                      </div>
                    </>
                  ) : (
                    <div className="price fw-6">
                      ₹{prices.current}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="tf-product-info-variant-picker mb_15">
              {/* Color Variant Picker */}
              {item.colors && item.colors.length > 0 && (
                <div className="variant-picker-item">
                  <div className="variant-picker-label">
                    Color:
                    <span className="fw-6 variant-picker-label-value">
                      {currentColor?.name || 'Select Color'}
                    </span>
                  </div>
                  <form className="variant-picker-values">
                    {item.colors.map((color, index) => (
                      <React.Fragment key={color.name || index}>
                        <input
                          type="radio"
                          name="color1"
                          readOnly
                          checked={currentColor?.name === color.name}
                        />
                        <label
                          onClick={() => setCurrentColor(color)}
                          className="hover-tooltip radius-60"
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

              {/* Size Variant Picker */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="variant-picker-item">
                  <div className="variant-picker-label">
                    Size:{" "}
                    <span className="fw-6 variant-picker-label-value">
                      {currentSize || 'Select Size'}
                    </span>
                  </div>
                  <form className="variant-picker-values">
                    {item.sizes.map((size, index) => (
                      <React.Fragment key={size || index}>
                        <input
                          type="radio"
                          name="size1"
                          readOnly
                          checked={currentSize === size}
                        />
                        <label
                          onClick={() => setCurrentSize(size)}
                          className="style-text"
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
            <div className="tf-product-info-quantity mb_15">
              <div className="quantity-title fw-6">Quantity</div>
              <Quantity setQuantity={setQuantity} />
            </div>
            <div className="fw-6 variant-picker-label-value">
              <span className="tf-qty-price">
                Estimate: &nbsp; ₹ {(
                  ((item.price - (item.price * item.discount) / 100) || item.price) * quantity
                ).toFixed(2)}
              </span>
            </div>
            <br />
            <div className="tf-product-info-buy-button">
              <form onSubmit={(e) => e.preventDefault()}>
                {item.isAvailable ? (
                  <>
                    <a
                      onClick={() => {
                        const status = isAddedToCartProducts(item, currentColor, currentSize, quantity);
                        if (status === false) {
                          addProductToCart(item, currentColor, currentSize, quantity || 1);
                          openCartModal();
                        } else if (status === "update") {
                          updateQuantity(item, currentColor, currentSize, quantity);
                          openCartModal();
                        }
                      }}
                      className={`tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn ${isAddedToCartProducts(item, currentColor, currentSize, quantity) === "same" ? "disabled" : ""
                        }`}
                    >
                      <span className="mr-2">
                        {isAddedToCartProducts(item, currentColor, currentSize, quantity) === false
                          ? "Add to Cart"
                          : isAddedToCartProducts(item, currentColor, currentSize, quantity) === "update"
                            ? "Update Quantity"
                            : "Already in Cart"}
                      </span>
                    </a>

                    <a
                      onClick={() => addToWishlist(item.id)}
                      className="tf-product-btn-wishlist hover-tooltip box-icon bg_white wishlist btn-icon-action"
                    >
                      <span className={`icon icon-heart ${isAddedtoWishlist(item.id) ? "added" : ""}`} />
                      <span className="tooltip">
                        {isAddedtoWishlist(item.id)
                          ? "Already Wishlisted"
                          : "Add to Wishlist"}
                      </span>
                      <span className="icon icon-delete" />
                    </a>

                    <a
                      href="#compare"
                      data-bs-toggle="offcanvas"
                      onClick={() => addToCompareItem(item.id)}
                      aria-controls="offcanvasLeft"
                      className="tf-product-btn-wishlist hover-tooltip box-icon bg_white compare btn-icon-action"
                    >
                      <span className={`icon icon-compare ${isAddedtoCompareItem(item.id) ? "added" : ""}`} />
                      <span className="tooltip">
                        {isAddedtoCompareItem(item.id)
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
          </div>
        </div>
      </div>
    </div>
  );
}