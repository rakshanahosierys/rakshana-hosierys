import Footer1 from "@/components/footers/Footer1";
import Header7 from "@/components/headers/Header7";

import Wishlist from "@/components/othersPages/Wishlist";
import React from "react";

export const metadata = {
  title: "Wishlist - Rakshana Hosierys",
  description: "Classy Fox - Explore your true style",
};
export default function page() {
  return (
    <>
      <Header7 />
      <div className="tf-page-title ">
        <div className="container-full">
          <div className="heading text-center">Your wishlist</div>
        </div>
      </div>

      <Wishlist />

      <Footer1 />
    </>
  );
}
