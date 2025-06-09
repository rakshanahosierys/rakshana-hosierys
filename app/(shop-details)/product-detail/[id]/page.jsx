// app/(shop-details)/product-detail/[id]/page.js
'use client'; // This directive makes this a Client Component

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import ProductReviews from "@/components/shopDetails/ProductReviews";
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";

// Import the client-side Firebase and Firestore specific functions
import { db } from '@/utlis/firebaseConfig'; // Client-side Firebase configuration
import { doc, getDoc } from "firebase/firestore"; // Firestore functions for client-side

// Metadata is typically for Server Components and might not be fully utilized here
// However, Next.js can still process it for static exports or initial server render.
export const metadata = {
  title: "Tinkle Classy Girls Frocks & Dresses - Classy Fox",
  description: "Classy Fox - Rakshana Hosierys",
};

export default function Page({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Define an async function to fetch product data
    const fetchProduct = async () => {
      try {
        setLoading(true); // Set loading to true when starting fetch
        setError(null); // Clear previous errors

        const docRef = doc(db, "products", id); // Get reference to the document
        const docSnap = await getDoc(docRef); // Fetch the document snapshot

        if (docSnap.exists()) {
          const productData = docSnap.data();
          setProduct({
            ...productData,
            id: docSnap.id, // Ensure the ID is included
            // Safely convert Firestore Timestamps to ISO strings for client-side use
            productCreatedAt: productData.productCreatedAt?.toDate ? productData.productCreatedAt.toDate().toISOString() : null,
            countdown: productData.countdown?.toDate ? productData.countdown.toDate().toISOString() : null
          });
        } else {
          setProduct(null); // Product not found
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again."); // Set error state
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (success or error)
      }
    };

    if (id) {
      fetchProduct(); // Call the fetch function if ID is available
    }
  }, [id]); // Re-run effect if the product ID changes

  if (loading) {
    return (
      <>
        <Header7 />
        <div className="container py-10 text-center">
          <p>Loading product details...</p>
        </div>
        <Footer1 />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header7 />
        <div className="container py-10 text-center text-red-500">
          <p>{error}</p>
        </div>
        <Footer1 />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header7 />
        <div className="container py-10 text-center">
          <h1 className="text-xl font-bold">Product not found.</h1>
          <p className="mt-4">
            <Link href="/shop-default" className="text-blue-600 hover:underline">
              Go back to Shop
            </Link>
          </p>
        </div>
        <Footer1 />
      </>
    );
  }

  return (
    <>
      <Header7 />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href={`/`} className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />
              <Link href={`/shop-default`} className="text">
                Shop
              </Link>
              <i className="icon icon-arrow-right" />
              <span className="text">
                {product.title ? product.title : "Cotton jersey top"}
              </span>
            </div>
            <ProductSinglePrevNext currentId={product.id} />
          </div>
        </div>
      </div>
      <DetailsOuterZoom product={product} />
      <ShopDetailsTab product={product} />
      <div className="container">
        {/* ProductReviews will also need to be a Client Component if it fetches data using client-side Firestore */}
        <ProductReviews productId={product.id} />
      </div>
      <br />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
