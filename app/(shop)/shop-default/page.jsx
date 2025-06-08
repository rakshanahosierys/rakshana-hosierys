import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";
import ShopDefault from "@/components/shop/ShopDefault";
import React from "react";

export const metadata = {
  title: "Classy Fox - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Classy Fox</div>
          <p className="text-center text-2 text_black-2 mt_5">
            Shop through our latest selection of Fashion
          </p>
        </div>
      </div>
      <ShopDefault />
      <Footer1 />
    </>
  );
}
