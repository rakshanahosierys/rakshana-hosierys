"use client";

import { useContextElement } from "@/context/Context";
import { useEffect, useState } from "react";
import { ProductCardWishlist } from "@/components/shopCards/ProductCardWishlist"; // Correct relative path
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/utlis/firebaseConfig"; // Your Firestore instance

export default function Wishlist() {
  const { wishList } = useContextElement(); // Assuming wishList is an array of product IDs
  const [allFirestoreProducts, setAllFirestoreProducts] = useState([]); // To store all products from Firestore
  const [isLoadingProducts, setIsLoadingProducts] = useState(true); // Loading state for products
  const [wishListItems, setWishListItems] = useState([]); // Filtered wishlist items

  // 1. Effect to fetch ALL products from Firestore once
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoadingProducts(true);
      try {
        // Ensure 'db' is available before attempting to fetch
        if (!db) {
          console.warn("Firestore 'db' instance is not available.");
          setIsLoadingProducts(false);
          return;
        }
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
  }, [db]); // Depend on 'db' to ensure it's initialized

  // 2. Effect to filter wishlist items whenever wishList or allFirestoreProducts changes
  useEffect(() => {
    if (wishList && allFirestoreProducts.length > 0) {
      console.log("Wishlist IDs:", wishList);
      const filtered = allFirestoreProducts.filter((product) =>
        wishList.includes(product.id)
      );
      setWishListItems(filtered);
    } else if (wishList && wishList.length > 0 && !isLoadingProducts) {
      // If wishlist has items but products loaded and no matches found,
      // it means the product might not exist in Firestore or IDs don't match.
      // Clear wishlist items to reflect no matches.
      setWishListItems([]);
    } else if (!wishList || wishList.length === 0) {
      // If wishlist is empty, ensure wishListItems is also empty
      setWishListItems([]);
    }
  }, [wishList, allFirestoreProducts, isLoadingProducts]); // Depend on wishList and allFirestoreProducts

  return (
    <section className="flat-spacing-2">
      <div className="container">
        <div className="my-account-content account-wishlist"> {/* Main container for wishlist content */}
          {isLoadingProducts ? (
            <div className="text-center py-5">Loading wishlist products...</div>
          ) : (
            <>
              {wishListItems.length > 0 ? (
                <div className="grid-layout wrapper-shop" data-grid="grid-4">
                  {/* Render all wishlist items, no slicing */}
                  {wishListItems.map((elm) => (
                    // Re-typed this line to ensure no hidden characters or syntax issues
                    <ProductCardWishlist key={elm.id} product={elm} />
                  ))}
                </div>
              ) : (
                <div
                  className="row align-items-center w-100"
                  style={{ rowGap: "20px" }}
                >
                  <div className="col-lg-3 col-md-6 fs-18">
                    Your wishlist is empty
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <Link
                      href={`/shop-default`}
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                    >
                      Explore Products!
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
