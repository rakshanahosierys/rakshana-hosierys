"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/utlis/firebaseConfig"; // Your Firestore instance
import Image from "next/image";
import { useContextElement } from "@/context/Context";
export default function Compare() {
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

  return (
    <div className="offcanvas offcanvas-bottom canvas-compare" id="compare">
      <div className="canvas-wrapper">
        <header className="canvas-header">
          <div className="close-popup">
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>
        </header>
        <div className="canvas-body">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="tf-compare-list">
                  <div className="tf-compare-head">
                    <div className="title">Compare Products</div>
                  </div>
                  <div className="tf-compare-offcanvas">
                    { isLoadingProducts ? (
                      <div className="text-center py-4">Loading compare list...</div>
                    ) : campareListItems.length === 0 ? (
                      <div className="text-center py-4">
                        No products to compare.
                        <br />
                        <Link href="/shop-default" data-bs-dismiss="offcanvas" className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center">Explore Products</Link>
                      </div>
                    ) : ( campareListItems.map((elm, i) => (
                      <div key={i} className="tf-compare-item">
                        <div className="position-relative">
                          <div
                            className="icon"
                            style={{ cursor: "pointer" }}
                            onClick={() => removeFromCompareItem(elm.id)}
                          >
                            <i className="icon-close" />
                          </div>
                          <Link href={`/product-detail/${elm.id}`}>
                            <Image
                              className="radius-3"
                              alt="image"
                              src={elm.imgSrc}
                              style={{ objectFit: "contain" }}
                              width={720}
                              height={1005}
                            />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                  <div className="tf-compare-buttons">
                    <div className="tf-compare-buttons-wrap">
                      {( campareListItems.length > 1 ?
                        <Link
                        href={`/compare`}
                        className="tf-btn radius-3 btn-fill justify-content-center fw-6 fs-14 flex-grow-1 animate-hover-btn"
                      >
                        Compare
                      </Link> : 'Add one more product to campare')}
                      <div
                        className="tf-compapre-button-clear-all link"
                        onClick={() => setCompareItem([])}
                      >
                        Clear All
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
