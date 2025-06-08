"use client";
import React, { useState } from "react";

import Image from "next/image";
import CountdownComponent from "../common/Countdown";
import {
  paymentImages,
} from "@/data/singleProductOptions";
import Quantity from "./Quantity";

import Slider1ZoomOuter from "./sliders/Slider1ZoomOuter";
import { useContextElement } from "@/context/Context";
import { openCartModal } from "@/utlis/openCartModal";
import { useCampareProductModal } from "@/store/useCampareProductModal";


export default function DetailsOuterZoom({ product }) {
  const { setSelectedCampareProduct } = useCampareProductModal();
  const [currentColor, setCurrentColor] = useState(
    product.colors?.[0] || null
  );
  const [currentSize, setCurrentSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);

  const handleColor = (color) => {
    const updatedColor = product.colors.filter(
      (elm) => elm.name.toLowerCase() == color.toLowerCase()
    )[0];
    if (updatedColor) {
      setCurrentColor(updatedColor);
    }
  };

  const {
    addProductToCart,
    updateQuantity,
    isAddedToCartProducts,
    addToCompareItem,
    isAddedtoCompareItem,
    addToWishlist,
    isAddedtoWishlist,
  } = useContextElement();
  return (
    <section
      className="flat-spacing-4 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div
        className="tf-main-product section-image-zoom"
        style={{ maxWidth: "100vw", overflow: "clip" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="thumbs-slider">
                  <Slider1ZoomOuter
                    handleColor={handleColor}
                    currentColor={currentColor.name}
                    firstImage={product.imgSrc}
                    images={product.colors.map((color, index) => ({
                      src: color.imgSrc,
                      dataValue: color.name,
                      id: index + 1,
                      width: 720, // or actual image width
                      height: 1005, // or actual image height
                    }))}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h5>
                      {product.title ? product.title : "Product Title"}
                    </h5>
                  </div>
                  {product.isBestSeller ? <div className="tf-product-info-badges">
                    <div className="badges">Best seller</div>
                    <div className="product-status-content">
                      <i className="icon-lightning" />
                      <p className="fw-6">
                        Selling fast! Many people have this in their carts.
                      </p>
                    </div>
                  </div> : ''}
                  <div className="tf-product-info-price">
                    {product.discount > 0 ? (
                      <>
                        <div className="price-on-sale">
                          ₹ {(product.price - (product.price * product.discount) / 100).toFixed(2)}
                        </div>
                        <div className="compare-at-price">
                          ₹ {product.price.toFixed(2)}
                        </div>
                        <div className="badges-on-sale">
                          <span>{product.discount}</span>% OFF
                        </div>
                      </>
                    ) : (
                      <div className="price-on-sale">
                        ₹ {product.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {product.viewCount > 0 && (
                    <div className="tf-product-info-liveview">
                      <div className="liveview-count">{product.viewCount}</div>
                      <p className="fw-6">People are viewing this right now</p>
                    </div>
                  )}
                  {product.countdown && new Date(product.countdown) > new Date() && (
                    <div className="tf-product-info-countdown">
                      <div className="countdown-wrap">
                        <div className="countdown-title">
                          <i className="icon-time tf-ani-tada" />
                          {new Date(product.countdown) < new Date() ? <p>SALE ENDED</p> : <p>HURRY UP! SALE ENDS IN:</p>}
                        </div>
                        <div className="tf-countdown style-1">
                          <div className="js-countdown">
                            <CountdownComponent
                              targetDate={new Date(product.countdown)}
                              labels="Days :,Hours :,Mins :,Secs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="tf-product-info-variant-picker">
                    <div className="variant-picker-item">
                      <div className="variant-picker-label">
                        Color: &nbsp;
                        <span className="fw-6 variant-picker-label-value">
                          {currentColor.name}
                        </span>
                      </div>
                      <form className="variant-picker-values">
                        {product.colors.map((color, i) => (
                          <React.Fragment key={i}>
                            <input
                              id={i}
                              type="radio"
                              name="color1"
                              readOnly
                              checked={currentColor == color}
                              onChange={() => setCurrentColor(color)}
                            />
                            <label
                              onClick={() => setCurrentColor(color)}
                              className="hover-tooltip radius-60"
                              htmlFor={i}
                              data-value={color.name}
                            >
                              <span
                                className={`btn-checkbox ${color.colorClass}`}
                              />
                              <span className="tooltip">{color.name}</span>
                            </label>
                          </React.Fragment>
                        ))}
                      </form>
                    </div>
                    <div className="variant-picker-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="variant-picker-label">
                          Size: &nbsp;
                          <span className="fw-6 variant-picker-label-value">
                            {currentSize}
                          </span>
                        </div>
                        <a
                          href="#find_size"
                          data-bs-toggle="modal"
                          className="find-size fw-6"
                        >
                          Find your size
                        </a>
                      </div>
                      <form className="variant-picker-values">
                        {product.sizes.map((size, i) => (
                          <React.Fragment key={i}>
                            <input
                              type="radio"
                              name={size}
                              id={size + i}
                              readOnly
                              checked={currentSize == size}
                            />
                            <label
                              onClick={() => setCurrentSize(size)}
                              className="style-text"
                              htmlFor={size + i}
                              data-value={size}
                            >
                              <p>{size}</p>
                            </label>
                          </React.Fragment>
                        ))}
                      </form>
                    </div>
                  </div>
                  {product.isAvailable && (
                    <div className="tf-product-info-quantity">
                      <div className="quantity-title fw-6">Quantity</div>
                      <Quantity setQuantity={setQuantity} />
                    </div>
                  )}
                  <div className="fw-6 variant-picker-label-value">
                    <span className="tf-qty-price">
                      Estimate: &nbsp; ₹ {(
                        ((product.price - (product.price * product.discount) / 100) || product.price) * quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="tf-product-info-buy-button">
                    <form onSubmit={(e) => e.preventDefault()}>
                      {product.isAvailable ? (
                        <>
                          <a
                            onClick={() => {
                              const status = isAddedToCartProducts(product, currentColor, currentSize, quantity);
                              if (status === false) {
                                addProductToCart(product, currentColor, currentSize,  quantity || 1);
                                openCartModal();
                              } else if (status === "update") {
                                updateQuantity(product, currentColor, currentSize, quantity);
                                openCartModal();
                              }
                            }}
                            className={`tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn ${isAddedToCartProducts(product, currentColor, currentSize, quantity) === "same" ? "disabled" : ""
                              }`}
                          >
                            <span className="mr-2">
                              {isAddedToCartProducts(product, currentColor, currentSize, quantity) === false
                                ? "Add to Cart"
                                : isAddedToCartProducts(product, currentColor, currentSize, quantity) === "update"
                                  ? "Update Quantity"
                                  : "Already in Cart"}
                            </span>
                          </a>

                          <a
                            onClick={() => addToWishlist(product.id)}
                            className="tf-product-btn-wishlist hover-tooltip box-icon bg_white wishlist btn-icon-action"
                          >
                            <span className={`icon icon-heart ${isAddedtoWishlist(product.id) ? "added" : ""}`} />
                            <span className="tooltip">
                              {isAddedtoWishlist(product.id)
                                ? "Already Wishlisted"
                                : "Add to Wishlist"}
                            </span>
                            <span className="icon icon-delete" />
                          </a>

                          <a
                            href="#compare"
                            data-bs-toggle="offcanvas"
                            onClick={() => addToCompareItem(product.id)}
                            aria-controls="offcanvasLeft"
                            className="tf-product-btn-wishlist hover-tooltip box-icon bg_white compare btn-icon-action"
                          >
                            <span className={`icon icon-compare ${isAddedtoCompareItem(product.id) ? "added" : ""}`} />
                            <span className="tooltip">
                              {isAddedtoCompareItem(product.id)
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

                  <div className="tf-product-info-extra-link">
                    <a
                      href="#compare_color"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                      onClick={() => setSelectedCampareProduct(product)}
                    >
                      <div className="icon">
                        <Image
                          alt="image"
                          src="/images/item/compare.svg"
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="text fw-6">Compare color</div>
                    </a>
                    <a
                      href="#ask_question"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                    >
                      <div className="icon">
                        <i className="icon-question" />
                      </div>
                      <div className="text fw-6">Ask a question</div>
                    </a>
                    <a
                      href="#delivery_return"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                    >
                      <div className="icon">
                        <svg
                          className="d-inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          width={22}
                          height={18}
                          viewBox="0 0 22 18"
                          fill="currentColor"
                        >
                          <path d="M21.7872 10.4724C21.7872 9.73685 21.5432 9.00864 21.1002 8.4217L18.7221 5.27043C18.2421 4.63481 17.4804 4.25532 16.684 4.25532H14.9787V2.54885C14.9787 1.14111 13.8334 0 12.4255 0H9.95745V1.69779H12.4255C12.8948 1.69779 13.2766 2.07962 13.2766 2.54885V14.5957H8.15145C7.80021 13.6052 6.85421 12.8936 5.74468 12.8936C4.63515 12.8936 3.68915 13.6052 3.33792 14.5957H2.55319C2.08396 14.5957 1.70213 14.2139 1.70213 13.7447V2.54885C1.70213 2.07962 2.08396 1.69779 2.55319 1.69779H9.95745V0H2.55319C1.14528 0 0 1.14111 0 2.54885V13.7447C0 15.1526 1.14528 16.2979 2.55319 16.2979H3.33792C3.68915 17.2884 4.63515 18 5.74468 18C6.85421 18 7.80021 17.2884 8.15145 16.2979H13.423C13.7742 17.2884 14.7202 18 15.8297 18C16.9393 18 17.8853 17.2884 18.2365 16.2979H21.7872V10.4724ZM16.684 5.95745C16.9494 5.95745 17.2034 6.08396 17.3634 6.29574L19.5166 9.14894H14.9787V5.95745H16.684ZM5.74468 16.2979C5.27545 16.2979 4.89362 15.916 4.89362 15.4468C4.89362 14.9776 5.27545 14.5957 5.74468 14.5957C6.21392 14.5957 6.59575 14.9776 6.59575 15.4468C6.59575 15.916 6.21392 16.2979 5.74468 16.2979ZM15.8298 16.2979C15.3606 16.2979 14.9787 15.916 14.9787 15.4468C14.9787 14.9776 15.3606 14.5957 15.8298 14.5957C16.299 14.5957 16.6809 14.9776 16.6809 15.4468C16.6809 15.916 16.299 16.2979 15.8298 16.2979ZM18.2366 14.5957C17.8853 13.6052 16.9393 12.8936 15.8298 12.8936C15.5398 12.8935 15.252 12.943 14.9787 13.04V10.8511H20.0851V14.5957H18.2366Z" />
                        </svg>
                      </div>
                      <div className="text fw-6">Delivery &amp; Return</div>
                    </a>
                    <a
                      href="#share_social"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                    >
                      <div className="icon">
                        <i className="icon-share" />
                      </div>
                      <div className="text fw-6">Share</div>
                    </a>
                  </div>
                  <div className="tf-product-info-delivery-return">
                    <div className="row">
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery">
                          <div className="icon">
                            <i className="icon-delivery-time" />
                          </div>
                          <p>
                            Estimate delivery times:&nbsp;
                            <span className="fw-7">3-7 days </span>
                            <span className="fw-7">*Business days</span>
                          </p>
                        </div>
                      </div>
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery mb-0">
                          <div className="icon">
                            <i className="icon-return-order" />
                          </div>
                          <p>
                            Return within <span className="fw-7">48 hours</span>{" "}
                            of delivery. Duties &amp; taxes are non-refundable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tf-product-info-trust-seal">
                    <div className="tf-product-trust-mess">
                      <i className="icon-safe" />
                      <p className="fw-6">
                        Guarantee Safe <br />
                        Checkout
                      </p>
                    </div>
                    <div className="tf-payment">
                      {paymentImages.map((image, index) => (
                        <Image
                          key={index}
                          alt={image.alt}
                          src={image.src}
                          width={image.width}
                          height={image.height}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
    </section>
  );
}
