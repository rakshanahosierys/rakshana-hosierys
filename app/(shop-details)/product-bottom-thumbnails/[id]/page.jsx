import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import DefaultShopDetails from "@/components/shopDetails/DefaultShopDetails";
import Details6 from "@/components/shopDetails/Details6";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
export const metadata = {
  title: "Shop Bottom Thumbnail || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
import { allProducts } from "@/data/products";
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";
export async function generateStaticParams() {
  return allProducts.map((product) => ({
    id: product.id.toString(),
  }));
}
export default async function page({ params }) {const { id } = await params
  const product =
    allProducts.filter((elm) => elm.id == id)[0] || allProducts[0];
  return (
    <>
      <Header2 />
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href={`/`} className="text">
                Home
              </Link>

              <i className="icon icon-arrow-right" />
              <span className="text">{product.title}</span>
            </div>
            <ProductSinglePrevNext currentId={product.id} />
          </div>
        </div>
      </div>
      <Details6 product={product} />
      <ShopDetailsTab />
      <Products />
      <RecentProducts />
      <Footer1 />
    </>
  );
}
