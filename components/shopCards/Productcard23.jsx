"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import Link from "next/link";

export default function Productcard23({ product }) {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const { setQuickViewItem } = useContextElement();
  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  return (
    <div className="card-product list-layout">
      <div className="card-product-wrapper">
         <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            alt="image-product"
            src={currentImage}
            width={720}
            height={1005}
          />
          <Image
            className="lazyload img-hover"
            alt="image-product"
            src={product.imgHoverSrc}
            width={720}
            height={1005}
          />
        </Link>
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <div className="tf-product-info-price">
          {product.discount > 0 ? (
            <>
              <div className="price">
                ₹ {(product.price - (product.price * product.discount) / 100).toFixed(2)}
              </div>
              <div className="compare-price">
                ₹ {product.price.toFixed(2)}
              </div>
            </>
          ) : (
            <div className="price">
              ₹ {product.price.toFixed(2)}
            </div>
          )}
        </div>
        <p className="description">
          {product.description}
        </p>
        {product.colors && (
          // Wrap color list with a div for onMouseLeave
          <div
            className="list-color-product-wrapper"
            onMouseLeave={() => setCurrentImage(product.imgSrc)}
          >
            <ul className="list-color-product">
              {product.colors.map((color) => (
                <li
                  className={`list-color-item color-swatch ${currentImage === color.imgSrc ? "active" : ""
                    } `}
                  onMouseOver={() => setCurrentImage(color.imgSrc)}
                  key={color.name}
                >
                  <span className="tooltip">{color.name}</span>
                  <span className={`swatch-value ${color.colorClass}`} />
                  <Image
                    className="lazyload"
                    data-src={color.imgSrc}
                    src={color.imgSrc}
                    alt="image-product"
                    width={720}
                    height={1005}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        {product.sizes && (
          <div className="size-list">
            {product.sizes.map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        )}
        {!product.isAvailable ? (
          <div className="sold-out">
            <span>Sold out</span>
          </div>
        ) : (
          <>
            <div className="list-product-btn">
              <a
                href="#quick_add"
                onClick={() => setQuickAddItem(product.id)}
                data-bs-toggle="modal"
                className="box-icon quick-add style-3 hover-tooltip"
              >
                <span className="icon icon-bag" />
                <span className="tooltip">Quick add</span>
              </a>
              <a
                onClick={() => addToWishlist(product.id)}
                className="box-icon wishlist style-3 hover-tooltip"
              >
                <span
                  className={`icon icon-heart ${isAddedtoWishlist(product.id) ? "added" : ""
                    }`}
                />
                <span className="tooltip">
                  {isAddedtoWishlist(product.id)
                    ? "Already Wishlisted"
                    : "Add to Wishlist"}
                </span>
              </a>

              <a
                href="#compare"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
                onClick={() => addToCompareItem(product.id)}
                className="box-icon compare style-3 hover-tooltip"
              >
                <span
                  className={`icon icon-compare ${isAddedtoCompareItem(product.id) ? "added" : ""
                    }`}
                />
                <span className="tooltip">
                  {" "}
                  {isAddedtoCompareItem(product.id)
                    ? "Already Compared"
                    : "Add to Compare"}
                </span>
              </a>
              <a
                href="#quick_view"
                onClick={() => setQuickViewItem(product)}
                data-bs-toggle="modal"
                className="box-icon quickview style-3 hover-tooltip"
              >
                <span className="icon icon-view" />
                <span className="tooltip">Quick view</span>
              </a>
            </div>
          </>)}
      </div>
    </div>
  );
}
