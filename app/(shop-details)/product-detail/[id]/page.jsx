// app/(shop-details)/product-detail/[id]/page.js
import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";

import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
// import { doc, getDoc } from "firebase/firestore"; // REMOVE CLIENT-SIDE IMPORTS
// import { db } from "@/utlis/firebaseConfig";      // REMOVE CLIENT-SIDE IMPORTS
import { adminDb } from '@/utlis/firebaseAdmin'; // <--- IMPORT ADMIN DB HERE
import ProductReviews from "@/components/shopDetails/ProductReviews"; // Import the ProductReviews component

export const metadata = {
  title: "Tinkle Classy Girls Frocks & Dresses - Classy Fox",
  description: "Classy Fox - Rakshana Hosierys",
};
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";


export default async function page({ params }) {
  const { id } = await params;

  // Use adminDb for Firestore operations in this Server Component
  const docRef = adminDb.collection("products").doc(id); // Admin SDK way
  const docSnap = await docRef.get(); // Admin SDK way

  if (!docSnap.exists) { // Admin SDK uses .exists property
    return <div>Product not found</div>;
  }

  const productData = docSnap.data(); // Admin SDK uses .data() method

  const product = {
    ...productData,
    id,
    // Ensure these fields are handled safely, as they might be Firestore Timestamps
    // toDate() is a method of Firestore Timestamp objects.
    // If productData.productCreatedAt or countdown are not Timestamps, toDate() will cause an error.
    // It's safer to check their type or ensure they are always Timestamps.
    // For now, assuming they are Firestore Timestamps:
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