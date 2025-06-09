// app/(shop-details)/product-detail/[id]/page.js
// This is a Server Component as there is no 'use client' directive.
// It will fetch data on the server side before rendering.

import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";

import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
// Import adminDb from the centralized utility file for server-side operations
import { adminDb } from '@/utlis/firebaseAdmin';
import ProductReviews from "@/components/shopDetails/ProductReviews"; // Import the ProductReviews component

export const metadata = {
  title: "Tinkle Classy Girls Frocks & Dresses - Classy Fox",
  description: "Classy Fox - Rakshana Hosierys",
};
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";


export default async function Page({ params }) {
  const { id } = params;

  let product = null; // Initialize product to null
  let errorFetching = false; // Flag to track fetching errors

  try {
    // Use adminDb for Firestore operations in this Server Component
    const docRef = adminDb.collection("products").doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const productData = docSnap.data();

      // Ensure ALL Firestore Timestamp objects are converted to serializable formats.
      // This is crucial for passing data from Server Components to Client Components.
      product = {
        ...productData,
        id,
        // Convert productCreatedAt Timestamp to ISO string
        productCreatedAt: productData.productCreatedAt?.toDate ? productData.productCreatedAt.toDate().toISOString() : null,
        // Convert countdown Timestamp to ISO string
        countdown: productData.countdown?.toDate ? productData.countdown.toDate().toISOString() : null,
        // Convert updatedAt Timestamp to ISO string (this was the source of the error)
        updatedAt: productData.updatedAt?.toDate ? productData.updatedAt.toDate().toISOString() : null,
        // Add any other Timestamp fields if they exist in your product data:
        // createdAt: productData.createdAt?.toDate ? productData.createdAt.toDate().toISOString() : null,
        // someOtherDateField: productData.someOtherDateField?.toDate ? productData.someOtherDateField.toDate().toISOString() : null,
      };
    } else {
      // Product not found, product remains null
    }
  } catch (e) {
    console.error("Server-side product fetch error:", e);
    errorFetching = true; // Set error flag
  }

  // Handle product not found or error cases
  if (errorFetching || !product) {
    return (
      <>
        <Header7 />
        <div className="container py-10 text-center">
          <h1 className="text-xl font-bold">
            {errorFetching ? "Error loading product data." : "Product not found."}
          </h1>
          <p className="text-center mt-4">
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
      <ShopDetailsTab product={product}/>
      <div className="container">
        {/* ProductReviews is a Client Component, it can receive serializable props. */}
        <ProductReviews productId={product.id} />
      </div>
      <br />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
