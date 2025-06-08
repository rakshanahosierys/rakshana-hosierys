import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";

import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utlis/firebaseConfig";
import ProductReviews from "@/components/shopDetails/ProductReviews"; // Import the ProductReviews component

export const metadata = {
  title: "Tinkle Classy Girls Frocks & Dresses - Classy Fox",
  description: "Classy Fox - Rakshana Hosierys",
};
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";


export default async function page({ params }) {
  const { id } = await params;

  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return <div>Product not found</div>;
  }

  const productData = docSnap.data();

  const product = {
    ...productData,
    id,
    productCreatedAt: productData.productCreatedAt?.toDate()?.toISOString() || null,
    countdown: productData.countdown?.toDate()?.toISOString() || null
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
        <ProductReviews productId={product.id} />
      </div>
      <br />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
