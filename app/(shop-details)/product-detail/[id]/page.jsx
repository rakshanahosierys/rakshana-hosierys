// app/(shop-details)/product-detail/[id]/page.js
import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";

import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
// Import adminDb from the centralized utility file
import { adminDb } from '@/utlis/firebaseAdmin';
import ProductReviews from "@/components/shopDetails/ProductReviews"; // Import the ProductReviews component

export const metadata = {
  title: "Tinkle Classy Girls Frocks & Dresses - Classy Fox",
  description: "Classy Fox - Rakshana Hosierys",
};
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";


export default async function Page({ params }) { // Renamed 'page' to 'Page' for convention
  const { id } = params; // No await needed for params

  // Use adminDb for Firestore operations in this Server Component
  const docRef = adminDb.collection("products").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    // Handle the case where the product is not found
    return (
      <>
        <Header7 />
        <div className="container py-10">
          <h1 className="text-xl font-bold text-center">Product not found.</h1>
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

  const productData = docSnap.data();

  const product = {
    ...productData,
    id,
    // Safely convert Firestore Timestamps to ISO strings
    productCreatedAt: productData.productCreatedAt?.toDate ? productData.productCreatedAt.toDate().toISOString() : null,
    countdown: productData.countdown?.toDate ? productData.countdown.toDate().toISOString() : null
  };

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
        {/* If ProductReviews also fetches Firestore data, ensure it's a Client Component
            or uses Admin SDK if it's a Server Component doing the fetching. */}
        <ProductReviews productId={product.id} />
      </div>
      <br />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
