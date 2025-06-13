"use client";
import { useContextElement } from "@/context/Context";
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/utlis/firebaseConfig"; // Your Firestore instance
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Compare() {
  const { setQuickViewItem } = useContextElement();
  const { setQuickAddItem } = useContextElement();

  const { removeFromCompareItem, compareItem } = useContextElement(); // Assuming wishList is an array of product IDs
  const [allFirestoreProducts, setAllFirestoreProducts] = useState([]); // To store all products from Firestore
  const [isLoadingProducts, setIsLoadingProducts] = useState(true); // Loading state for products
  const [campareListItems, setCompareItem] = useState([]); // Filtered wishlist items

  // 1. Effect to fetch ALL products from Firestore once
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const productsCol = collection(db, 'products'); // Your Firestore collection name
        const productSnapshot = await getDocs(productsCol);
        const productsList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllFirestoreProducts(productsList);
      } catch (error) {
        console.error("Error fetching all products for Wishlist:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchAllProducts();
  }, []); // Empty dependency array: runs only once on mount

  // 2. Effect to filter wishlist items whenever wishList or allFirestoreProducts changes
  useEffect(() => {
    if (compareItem && allFirestoreProducts.length > 0) {
      const filtered = allFirestoreProducts.filter((product) =>
        compareItem.includes(product.id)
      );
      setCompareItem(filtered);
    } else if (compareItem && compareItem.length > 0 && !isLoadingProducts) {
      // If wishlist has items but products haven't loaded or no matches found,
      // it means the product might not exist or still loading.
      // You might want a different message or retry logic here.
      setCompareItem([]); // Clear if products not loaded or no matches
    } else if (!compareItem || compareItem.length === 0) {
      // If wishlist is empty, ensure wishListItems is also empty
      setCompareItem([]);
    }
  }, [compareItem, allFirestoreProducts, isLoadingProducts]); // Depend on wishList and allFirestoreProducts

  if (campareListItems.length === 0) {
    return (
      <section className="flat-spacing-12">
        <div className="container">
          <div className="flat-title my-0"
          >
            <span className="title">No products added to compare</span>
            <br />
            <div className="col-lg-3 col-md-6"><Link href="/shop-default" className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center">Browse Products</Link></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing-12">
      <div className="container">
        {isLoadingProducts ? (
          <div className="text-center py-5">Loading campare products...</div>
        ) : campareListItems.length <= 1 ? (<>
          <div className="container">
            <div className="flat-title my-0"
          >
            <span className="title">Add one more product to compare</span>
            <br />
            <div className="col-lg-3 col-md-6"><Link href="/shop-default" className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center">Browse Products</Link></div>
          </div>
          </div>
        </>
        ) : (
          <>
            <div>
              <div className="tf-compare-table">
                <div className="tf-compare-row tf-compare-grid">
                  <div className="tf-compare-col d-md-block d-none" />

                  {campareListItems.map((elm, i) => (
                    <div key={i} className="tf-compare-col">
                      <div className="tf-compare-item">
                        <div
                          className="tf-compare-remove link"
                          onClick={() => removeFromCompareItem(elm.id)}
                        >
                          Remove
                        </div>
                        <Link
                          className="tf-compare-image"
                          href={`/product-detail/${elm.id}`}
                        >
                          <Image
                            className="lazyload"
                            data-src={elm.imgSrc}
                            alt="img-compare"
                            width={713}
                            height={1070}
                            src={elm.imgSrc}
                          />
                        </Link>
                        <Link
                          className="tf-compare-title"
                          href={`/product-detail/${elm.id}`}
                        >
                          {elm.title}
                        </Link>
                        {elm.discount > 0 ? (
                          <>
                            <div className="price">
                              <span className="price-on-sale">₹ {(elm.price - (elm.price * elm.discount) / 100).toFixed(2)}</span>
                            </div>
                            <div className="compare-price">
                              ₹ {elm.price.toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="price">
                            <span className="price-on-sale">₹ {elm.price.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="tf-compare-group-btns d-flex gap-10">
                          <a
                            href="#quick_view"
                            data-bs-toggle="modal"
                            className="tf-btn btn-outline-dark radius-3"
                            onClick={() => setQuickViewItem(elm)}
                          >
                            <i className="icon icon-view" />
                            <span>QUICK VIEW</span>
                          </a>
                          <a
                            href="#quick_add"
                            data-bs-toggle="modal"
                            className="tf-btn btn-outline-dark radius-3"
                            onClick={() => setQuickAddItem(elm.id)}
                          >
                            <i className="icon icon-bag" />
                            <span>QUICK ADD</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tf-compare-row tf-compare-grid">
                  <div className="tf-compare-col tf-compare-field d-md-block d-none">
                    <h6>Availability</h6>
                  </div>
                  {campareListItems.map((elm, i) => (
                    <div
                      key={`availability-${elm.id}`}
                      className="tf-compare-col tf-compare-field tf-compare-stock"
                      style={{ flex: 1 }}
                    >
                      {elm.isAvailable === true || elm.isAvailable === "In Stock" ? (
                        <>
                          <div className="icon">
                            <i className="icon-check" />
                          </div>
                          <span className="fw-5">In Stock</span>
                        </>
                      ) : (
                        <span className="fw-5 text-danger">Out of Stock</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="tf-compare-row">
                  <div className="tf-compare-col tf-compare-field d-md-block d-none">
                    <h6>Brand</h6>
                  </div>
                  {campareListItems.map((elm, i) => (
                    <div
                      key={`brand-${elm.id}`}
                      className="tf-compare-col tf-compare-value text-center"
                      style={{ flex: 1 }}
                    >
                      {elm.brand || "N/A"}
                    </div>
                  ))}
                </div>
                <div className="tf-compare-row">
                  <div className="tf-compare-col tf-compare-field d-md-block d-none">
                    <h6>Color</h6>
                  </div>
                  {campareListItems.map((elm, i) => (
                    <div
                      key={`color-${elm.id}`}
                      className="tf-compare-col tf-compare-value text-center"
                      style={{ flex: 1 }}
                    >
                      {Array.isArray(elm.colors) && elm.colors.length > 0
                        ? elm.colors.map((color) => color.name).join(", ")
                        : "N/A"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
